pragma solidity 0.8.7;

import './interface/IERC20.sol';
import './library/SafeERC20.sol';
import './library/FixedPoint.sol';
import './common/Ownable.sol';

contract LSBBondDepository is Ownable  {
    using FixedPoint for *;
    using SafeERC20 for IERC20;

    event BondCreated(uint deposit, uint indexed payout, uint indexed expires, uint indexed priceInUSD);
    event BondRedeemed(address indexed recipient, uint payout, uint remaining);
    event BondPriceChanged(uint indexed priceInUSD, uint indexed internalPrice, uint indexed debtRatio);
    event ControlVariableAdjustment(uint initialBCV, uint newBCV, uint adjustment, bool additio);

    // token given as payment for bond
    address public immutable LSB;
    // token used to create bond
    address public immutable principle;
    // mints LSB when receives principle
    address public immutable treasury;
    //receives profit share from bond
    address public immutable DAO;

    // LP and Reserve bonds are treated slightly different
    bool public immutable isLiquidityBond;
    // calculates value of LP tokens
    address public immutable bondCalculator;

    // to auto-stake payout
    address public staking;
    // to stake and claim if no staking warmup
    bool public useHelper;

    // stores terms for new bonds
    Terms public terms;
    // stores adjustment to BCV data
    Adjust public adjustment;

    // stores bond information for depositors
    mapping(address => Bond) public bondInfo;

    // total value of outstanding bonds using for princing
    uint public totalDebt;
    // reference block for debt decay
    uint public lastDecay;

    // Info for creating new bonds
    struct Terms {
        // scaling variable for price
        uint controlVariable;
        uint vestingTerm; // in blocks
        uint minimumPrice; // vs principle value
        uint maxPayout; // in thousandths of a %. i.e 500 = 0.5%
        uint maxDebt; // 9 decimal debt ratio, max % total supply created as debt
    }

    // Info for bond holder
    struct Bond {
        // LSB remaining to be paid
        uint payout;
        uint vesting; // Blocks left to vest
        uint lastBlock; // Last interaction
        uint pricePaid; // In DAI, for frontend viewing
    }

    // Info for incremental adjustments to control variable
    struct Adjust {
        bool add; // additional or subtraction
        uint rate; // increment
        uint target; // BCV when adjustment finished
        uint buffer; // minimum length(in blocks) betweek adjustments
        uint lastBlock; // block when last adjustment made
    }

    constructor(
        address _LSB,
        address _principle,
        address _treasury,
        address _DAO,
        address _bondCalculator
    ) {
        require(_LSB != address(0));
        LSB = _LSB;

        require(_principle != address(0));
        principle = _principle;

        require(_treasury != address(0));
        treasury = _treasury;

        require(_DAO != address(0));
        DAO = _DAO;

        // bondCalculator should be address(0) if not LP bond
        bondCalculator = _bondCalculator;
        isLiquidityBond = (_bondCalculator != address(0));
    }

    function initializeBondTerms(
        uint _controlVariable,
        uint _vestingTerm,
        uint _minumumPrice,
        uint _maxPayout,
        uint _fee,
        uint _maxDebt,
        uint _initialDebt
    ) {
        require(terms.controlVariable == 0, "Bonds must be initialized from 0");
        terms = Terms({
            controlVariable; _controlVariable,
            vestingTerm: _vestingTerm,
            minimumPrice: _minimumPrice,
            maxPayout: _maxPayout,
            fee: _fee,
            maxDebt: _maxDebt
        });

        totalDebt = _initialDebt;
        lastDecay = block.number;
    }

    enum PARAMETER {VESTING, PAYOUT, FEE, DEBT}

    function setBondTerms(
        PARAMETER _parameter,
        uint _input
    ) external onlyOwner() {
        if(_parameter == PARAMETER.VESTING) {
            require(_input >= 10000, "Vesting must be longer than 36 hours");
            terms.vestingTerm = _input;
        } else if(_parameter == PARAMETER.PAYOUT) {
            require(_input <= 1000, "Payout can not be above 1 percent");
            terms.maxPayout = _input;
        } else if(_parameter == PARAMETER.FEE) {
            require(_input <= 10000, "DAO fee can not exceed payout");
        } else if(_parameter == PARAMETER.DEBT) {
            terms.maxDebt = _input;
        }
    }

    function setAdjustment(
        bool _addition,
        uint _increment,
        uint _target,
        uint _buffer
    ) external onlyOwner() {
        require(_increment <= terms.controlVariable.mul(25).div(1000), "Increment too large");

        adjustment = Adjust({
            add: _addition,
            rate: _increment,
            target: _target,
            buffer: _buffer,
            lastBlock: block.number
        });
    }

    function setStaking(address _staking, bool _helper) external onlyOwner() {
        require(_staking != address(0));
        if(_helper) {
            useHelper = true;
            stakingHelper = _staking;
        } else {
            useHelper = false;
            staking = _staking;
        }
    }

    function deposit(uint _amount, uint _maxPrice, address _depositor) external returns(uint) {
        require(_depositor != address(0), "Invalid address");

        decayDebt();

        require(totalDebt <= terms.maxDebt, "Max capacity reached");

        // stored in bond info
        uint priceInUSD = bondPriceInUSD();
        uint nativePrice = _bondPrice();

        // slippage protection
        require(_maxPrice >= nativePrice, "Slippage limit: more than max price");

        uint value = ITreasury(treasury).valueOf(principle, _amount);
        uint payout = payoutFor(value);

        // must be > 0.01 LSB(underflow protection)
        require(payout >= 10000000, "Bond too small");
        // size protection because there is no slippage
        require(payout <= maxPayout(), "Bond too large");

        // profits are calculated
        uint fee = payout.mul(terms.fee).div(10000);
        uint profit = value.sub(payout).sub(fee);

        IERC20(principle).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(principle).approve(address(treasury), _amount);
        ITreasury(treasury).deposit(_amount, principle, profit);

        // fee is transferred to dao
        if(fee != 0) {
            IERC20(LSB).safeTransfer(DAO, fee);
        }

        // total debt is increased
        totalDebt = totalDebt.add(value);

        // depositor info is stored
        bondInfo[_depositor] = Bond({
            payout: bondInfo[_depositor].payout.add(payout),
            vesting: terms.vestingTerm,
            lastBlock: block.number,
            pricePaid: priceInUSD
        });

        emit BondCreated(_amount, payout, block.number.add(terms.vestingTerm), priceInUSD);
        emit BondPriceChanged(bondPriceInUSD(), _bondPrice(), debtRatio());

        // control variable is adjusted
        adjust();

        return payout;
    }

    function redeem(address _recipient, bool _stake) external returns(uint) {
        Bond memory info = bondInfo[_recipient];

        // blocks since last interaction / vesting term remaining
        uint percentVested = percentVestedFor(_recipient);

        if(percentVested >= 10000) { // if fully vested
            // delete user info
            delete bondInfo[_recipient];

            // emit bond data
            emit BondRedeemed(_recipient, info.payout, 0);

            // pay user everything due
            return stakedOrSend(_recipient, _stake, info.payout);
        } else { // if unfinished
            // calculate payout vested
            uint payout = info.payout.mul(percentVested).div(10000);

            // store updated deposit info
            bondInfo[_recipient] = Bond({
                payout: info.payout.sub(payout),
                vesting: info.vesting.sub(block.number.sub(info.lastBlock)),
                lastBlock: block.number,
                pricePaid: info.pricePaid
            });

            emit BondRedeemed(_recipient, payout, bondInfo[_recipient].payout);
            return stakeOrSend(_recipient, _stake, payout);
        }

        function stakeOrSend(address _recipient, bool _stake, uint _amount) internal returns(uint) {
            if(!_stake) { // if user does not want to stake
                IERC20(LSB1).transfer(_recipient, _amount);
            } else { // if user want to stake
                if(useHelper) { // use if staking warmup is 0
                    IERC20(LSB).approve(stakingHelper, _amount);
                    IStakingHelper(stakingHelper).stake(_amount, _recipient);
                } else {
                    IERC20(LSB).approve(staking, _amount);
                    IStaking(staking).stake(_amount, _recipient);
                }
            }

            return _amount;
        }

        function adjust() internal {
            
        }
    }
}
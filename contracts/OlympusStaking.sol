// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";
import "./libraries/Address.sol";
import "./interfaces/IWarmup.sol";

interface IOwnable {
  function manager() external view returns (address);

  function renounceManagement() external;
  
  function pushManagement( address newOwner_ ) external;
  
  function pullManagement() external;
}

contract Ownable is IOwnable {

    address internal _owner;
    address internal _newOwner;

    event OwnershipPushed(address indexed previousOwner, address indexed newOwner);
    event OwnershipPulled(address indexed previousOwner, address indexed newOwner);

    constructor () {
        _owner = msg.sender;
        emit OwnershipPushed( address(0), _owner );
    }

    function manager() public view override returns (address) {
        return _owner;
    }

    modifier onlyManager() {
        require( _owner == msg.sender, "Ownable: caller is not the owner" );
        _;
    }

    function renounceManagement() public virtual override onlyManager() {
        emit OwnershipPushed( _owner, address(0) );
        _owner = address(0);
    }

    function pushManagement( address newOwner_ ) public virtual override onlyManager() {
        require( newOwner_ != address(0), "Ownable: new owner is the zero address");
        emit OwnershipPushed( _owner, newOwner_ );
        _newOwner = newOwner_;
    }
    
    function pullManagement() public virtual override {
        require( msg.sender == _newOwner, "Ownable: must be new owner to pull");
        emit OwnershipPulled( _owner, _newOwner );
        _owner = _newOwner;
    }
}

interface IsOHM {
    function rebase( uint256 ohmProfit_, uint epoch_) external returns (uint256);

    function circulatingSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function gonsForBalance( uint amount ) external view returns ( uint );

    function balanceForGons( uint gons ) external view returns ( uint );
    
    function index() external view returns ( uint );
}

interface IDistributor {
    function distribute() external returns ( bool );
}

contract OlympusStaking is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public immutable OHM;
    address public immutable sOHM;

    struct Epoch {
        uint length;
        uint number;
        uint endBlock;
        uint distribute;
    }
    Epoch public epoch;

    address public distributor;
    
    address public locker;
    uint public totalBonus;
    
    address public warmupContract;
    uint public warmupPeriod;
    uint private unstakeSum;
    
    constructor ( 
        address _OHM, 
        address _sOHM, 
        uint _epochLength,
        uint _firstEpochNumber,
        uint _firstEpochBlock
    ) {
        require( _OHM != address(0) );
        OHM = _OHM;
        require( _sOHM != address(0) );
        sOHM = _sOHM;
        
        epoch = Epoch({
            length: _epochLength,
            number: _firstEpochNumber,
            endBlock: _firstEpochBlock,
            distribute: 0
        });
    }

    struct Claim {
        uint deposit;
        uint gons;
        uint expiry;
        bool lock; // prevents malicious delays
    }
    struct Unstake {
        uint deposit;
        uint expiry;
    }
    mapping( address => Claim ) public warmupInfo;
    mapping( address => Unstake ) public unstakeInfo;

    /**
        @notice stake OHM to enter warmup
        @param _amount uint
        @return bool
     */
    function stake( uint _amount, address _recipient ) external returns ( bool ) {
        rebase();
        
        IERC20( OHM ).safeTransferFrom( msg.sender, address(this), _amount );

        Claim memory info = warmupInfo[ _recipient ];
        require( !info.lock, "Deposits for account are locked" );

        warmupInfo[ _recipient ] = Claim ({
            deposit: info.deposit.add( _amount ),
            gons: info.gons.add( IsOHM( sOHM ).gonsForBalance( _amount ) ),
            expiry: epoch.number.add( warmupPeriod ),
            lock: false
        });
        
        IERC20( sOHM ).safeTransfer( warmupContract, _amount );
        return true;
    }

    /**
        @notice retrieve sOHM from warmup
        @param _recipient address
     */
    function claim ( address _recipient ) public {
        Claim memory info = warmupInfo[ _recipient ];
        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _recipient ];
            IWarmup( warmupContract ).retrieve( _recipient, IsOHM( sOHM ).balanceForGons( info.gons ) );
        }
    }

    function claimLock( address _recipient ) public {
        Claim memory info = warmupInfo[ _recipient ];
        if ( epoch.number >= info.expiry && info.expiry != 0 ) {
            delete warmupInfo[ _recipient ];
            IWarmup( warmupContract ).retrieve( locker, info.gons);
        }
    }

    /**
        @notice stake OHM to ender lock
        @param _amount uint
        @return bool
     */
    function lock( address _recipient, uint _amount, uint _estimate ) external returns ( bool ) {
        rebase();
        
        IERC20( OHM ).safeTransferFrom( msg.sender, address(this), _amount );

        Claim memory info = warmupInfo[ _recipient ];
        require( !info.lock, "Deposits for account are locked" );

        warmupInfo[ _recipient ] = Claim ({
            deposit: info.deposit.add( _amount ),
            gons: info.gons.add( _estimate ),
            expiry: epoch.number.add( warmupPeriod ),
            lock: false
        });
        
        IERC20( sOHM ).safeTransfer( warmupContract, _estimate );
        return true;
    }

    /**
        @notice forfeit sOHM in warmup and retrieve OHM
     */
    function forfeit() external {
        Claim memory info = warmupInfo[ msg.sender ];
        delete warmupInfo[ msg.sender ];

        IWarmup( warmupContract ).retrieve( address(this), IsOHM( sOHM ).balanceForGons( info.gons ) );
        IERC20( OHM ).safeTransfer( msg.sender, info.deposit );
    }

    /**
        @notice prevent new deposits to address (protection from malicious activity)
     */
    function toggleDepositLock() external {
        warmupInfo[ msg.sender ].lock = !warmupInfo[ msg.sender ].lock;
    }

    /**
        @notice redeem sOHM for OHM
        @param _amount uint
        @param _trigger bool
     */
    function unstake( uint _amount, bool _trigger ) external {
        if ( _trigger ) {
            rebase();
        }

        Unstake memory info = unstakeInfo[ msg.sender ];
        unstakeInfo[ msg.sender ] = Unstake ({
            deposit: info.deposit.add( _amount ),
            expiry: block.number.add( epoch.length )
        });

        unstakeSum = unstakeSum.add(_amount);
        IERC20( sOHM ).safeTransferFrom( msg.sender, address(this), _amount );
    }

    function claimUnstake(uint _amount) public {
        Unstake memory info = unstakeInfo[ msg.sender ];
        require(info.deposit >= _amount);
        require(info.expiry >= block.number);

        unstakeInfo[ msg.sender ] = Unstake ({
            deposit: info.deposit.sub( _amount ),
            expiry: info.expiry
        });
        
        unstakeSum = unstakeSum.sub(_amount);
        IERC20( OHM ).safeTransfer( msg.sender, _amount );
    }

    /**
        @notice returns the sOHM index, which tracks rebase growth
        @return uint
     */
    function index() public view returns ( uint ) {
        return IsOHM( sOHM ).index();
    }

    /**
        @notice trigger rebase if epoch over
     */
    function rebase() public {
        if( epoch.endBlock <= block.number ) {
            IsOHM( sOHM ).rebase( epoch.distribute, epoch.number );

            epoch.endBlock = epoch.endBlock.add( epoch.length );
            epoch.number++;
            
            if ( distributor != address(0) ) {
                IDistributor( distributor ).distribute();
            }

            uint balance = contractBalance();
            uint staked = IsOHM( sOHM ).circulatingSupply();

            if( balance <= staked ) {
                epoch.distribute = 0;
            } else {
                epoch.distribute = balance.sub( staked );
            }
        }
    }

    /**
        @notice returns contract OHM holdings, including bonuses provided
        @return uint
     */
    function contractBalance() public view returns ( uint ) {
        return IERC20( OHM ).balanceOf( address(this) ).add( totalBonus ).sub( unstakeSum );
    }

    /**
        @notice provide bonus to locked staking contract
        @param _amount uint
     */
    function giveLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.add( _amount );
        IERC20( sOHM ).safeTransfer( locker, _amount );
    }

    /**
        @notice reclaim bonus from locked staking contract
        @param _amount uint
     */
    function returnLockBonus( uint _amount ) external {
        require( msg.sender == locker );
        totalBonus = totalBonus.sub( _amount );
        IERC20( sOHM ).safeTransferFrom( locker, address(this), _amount );
    }

    enum CONTRACTS { DISTRIBUTOR, WARMUP, LOCKER }

    /**
        @notice sets the contract address for LP staking
        @param _contract address
     */
    function setContract( CONTRACTS _contract, address _address ) external onlyManager() {
        if( _contract == CONTRACTS.DISTRIBUTOR ) { // 0
            distributor = _address;
        } else if ( _contract == CONTRACTS.WARMUP ) { // 1
            require( warmupContract == address( 0 ), "Warmup cannot be set more than once" );
            warmupContract = _address;
        } else if ( _contract == CONTRACTS.LOCKER ) { // 2
            require( locker == address(0), "Locker cannot be set more than once" );
            locker = _address;
        }
    }
    
    /**
     * @notice set warmup period for new stakers
     * @param _warmupPeriod uint
     */
    function setWarmup( uint _warmupPeriod ) external onlyManager() {
        warmupPeriod = _warmupPeriod;
    }
}
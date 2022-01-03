// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";
import "./interfaces/IPrism.sol";
import "./types/ERC20Permit.sol";
import "./types/OlympusAccessControlled.sol";

contract PrismERC20 is ERC20Permit, IPrism, OlympusAccessControlled {
    using SafeMath for uint256;

    address public immutable PrismWallet;

    uint32 public buyFee;
    uint32 public sellFee;
    mapping(address => bool) public pairAddress;

    enum FEETYPE { BUY, SELL }

    constructor(address _authority, address _wallet) 
    ERC20("Prism", "Prism", 9) 
    ERC20Permit("Prism") 
    OlympusAccessControlled(IOlympusAuthority(_authority)) {
        require(_wallet != address(0));
        PrismWallet = _wallet;
    }

    function mint(address account_, uint256 amount_) external override onlyVault {
        _mint(account_, amount_);
    }

    function burn(uint256 amount) external override {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account_, uint256 amount_) external override {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) internal {
        uint256 decreasedAllowance_ = allowance(account_, msg.sender).sub(amount_, "ERC20: burn amount exceeds allowance");

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }

    function setPercent(FEETYPE _type, uint32 _fee) public onlyPolicy() {
        require(_fee <= 10000, "Invalid fee");
        if(_type == FEETYPE.BUY) {
            buyFee = _fee;
        } else if(_type == FEETYPE.SELL) {
            sellFee = _fee;
        }
    }

    function addPair(address _pair) public onlyPolicy() {
        require(_pair != address(0));
        pairAddress[_pair] = true;
    }

    function removePair(address _pair) public onlyPolicy() {
        require(_pair != address(0));
        pairAddress[_pair] = false;
    }

    function checkTrans(address _addr) private view returns(bool) {
        return pairAddress[_addr];
    }

    function _payFee(address _from, address _to, uint _amount) private returns(uint) {
        uint32 fee = 0;
        if(checkTrans(_from) && sellFee > 0) { // if sell
            fee = sellFee;
        } else if(checkTrans(_to) && buyFee > 0) { // if buy
            fee = buyFee;
        }

        if(fee > 0) {
            uint payFee = _amount.mul(fee).div(10000);
            _transfer(_from, PrismWallet, payFee);
            return _amount.sub(payFee);
        } else {
            return _amount;
        }
    }

    function transfer( address recipient, uint256 amount ) public override(IERC20, ERC20) returns (bool) {
        uint extra = _payFee(msg.sender, recipient, amount);
        _transfer(msg.sender, recipient, extra);
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override(IERC20, ERC20) returns (bool) {
        uint extra = _payFee(sender, recipient, amount);
        _transfer(sender, recipient, extra);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount, "ERC20: transfer amount exceeds allowance"));
        emit Transfer(sender, recipient, amount);
        return true;
    }
}

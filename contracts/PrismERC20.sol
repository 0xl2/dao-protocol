// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";
import "./interfaces/IPrism.sol";
import "./types/ERC20Permit.sol";
import "./types/OlympusAccessControlled.sol";

contract PrismERC20Token is ERC20Permit, IPrism, OlympusAccessControlled {
    using SafeMath for uint256;

    address public immutable PrismWallet;

    uint32 public fee;

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

    function setPercent(uint32 _fee) public onlyPolicy() {
        require(_fee <= 1e5, "Invalid fee");
        fee = _fee;
    }

    function _payFee(address _from, address _to, uint _amount) private returns(uint) {
        if(_from != address(this) && _to != address(this) && fee > 0) {
            uint payFee = _amount.mul(fee).div(1e5);
            _transfer(_from, PrismWallet, payFee);
            return _amount.sub(payFee);
        } else {
            return _amount;
        }
    }

    function transfer( address recipient, uint256 amount ) public override(ERC20, IERC20) returns (bool) {
        uint extra = _payFee(msg.sender, recipient, amount);
        _transfer(msg.sender, recipient, extra);
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override(ERC20, IERC20) returns (bool) {
        uint extra = _payFee(sender, recipient, amount);
        _transfer(sender, recipient, extra);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount, "ERC20: transfer amount exceeds allowance"));
        emit Transfer(sender, recipient, amount);
        return true;
    }
}

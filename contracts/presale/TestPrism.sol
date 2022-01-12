// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "../interfaces/IPrism.sol";
import "../libraries/SafeMath.sol";
import "../types/Ownable.sol";
import "../types/ERC20Permit.sol";

interface IUniswapV2Pair {
    function token0() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

contract TestPrism is ERC20Permit, IPrism, Ownable {
    using SafeMath for uint256;

    constructor()
    ERC20("Test Prism", "TPrism", 9) 
    ERC20Permit("TPrism") {}

    function mint(address account_, uint256 amount_) external override onlyOwner {
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
}
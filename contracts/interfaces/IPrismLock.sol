// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.7.5;

interface IPrismLock {
    function lock(address locker, uint amount, uint32 duration) external;

    function unLock(uint amount) external;

    function estimateAmount(uint32 duration, uint amount) external view returns(uint estimate);
}
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./types/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

contract PrismLock is Ownable {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    address public immutable RAINBOW;
    address public StakingHelper;

    uint8 public penalty; // in thousandths of a %. i.e. 500 = 0.5%

    mapping(uint32 => uint32) public lockUnits;
    mapping(address => bool) public userLocked;
    mapping(address => LockUnit) public userLocks;
    struct LockUnit {
        uint startTime;
        uint locked;
        uint expired;
        uint32 duration;
    }

    event Lock(address _locker, uint _startTime, uint _amount, uint32 _duration);
    event UnLock(address _locker, uint _amount);
    event AddLockUnit(uint32 _duration, uint32 _multiplier);
    event RemoveLockUnit(uint32 _duration);
    event Penalty(address indexed _to);

    constructor(address _rainbow) {
        require(_rainbow != address(0));
        RAINBOW = _rainbow;
    }

    modifier onlyHelper() {
        require(msg.sender == StakingHelper, "Lock: not the helper");
        _;
    }

    function addLockUnit(uint32 _duration, uint32 _multiplier) public onlyOwner() {
        require(_duration > 0, "Lock: Duration is zero");
        require(_multiplier >= 1, "Lock: Mutiplier under 1");
        
        lockUnits[_duration] = _multiplier;

        emit AddLockUnit(_duration, _multiplier);
    }

    function removeLockUnit(uint32 _duration) public onlyOwner() {
        require(lockUnits[_duration] > 0, "Lock: Duration not existing");

        delete lockUnits[_duration];

        emit RemoveLockUnit(_duration);
    }

    function setPenalty(uint8 _penalty) public onlyOwner() {
        require(_penalty <= 1e5, "Invalid penalty");
        penalty = _penalty;
    }

    function setHelper(address _helper) public onlyOwner() {
        require(_helper != address(0));
        require(StakingHelper == address(0));
        StakingHelper = _helper;
    }

    function _isSet(address _locker) private view returns(bool isSet, bool expired) {
        isSet = userLocked[_locker];
        expired = false;
        if(isSet) {
            LockUnit memory userLock = userLocks[_locker];
            expired = userLock.startTime.add(userLock.duration) >= block.timestamp;
        }
    }

    function _reset(address _locker) private {
        LockUnit memory userLock = userLocks[_locker];
        if(userLock.startTime.add(userLock.duration) >= block.timestamp) {
            uint32 multiplier = lockUnits[userLock.duration];
            uint expired = userLock.expired.add(userLock.locked.mul(multiplier).div(100));
            userLocks[_locker] = LockUnit({
                startTime: 0,
                locked: 0,
                expired: expired,
                duration: 0
            });
        }
    }

    function _lock(address _locker, uint _startTime, uint _amount, uint32 _duration) private {
        (bool isSet, bool expired) = _isSet(_locker);

        if(isSet) {
            if(expired) _reset(_locker);
            
            LockUnit memory userLock = userLocks[_locker];
            userLock.startTime = _startTime;
            userLock.locked = userLock.locked.add(_amount);
            userLocks[_locker] = userLock;
        } else {
            userLocks[_locker] = LockUnit({
                startTime: _startTime,
                locked: _amount,
                expired: 0,
                duration: _duration
            });

            userLocked[_locker] = true;
        }
    }

    function _unLock(uint _amount) private returns(uint amount) {
        (, bool expired) = _isSet(msg.sender);
        if(expired) _reset(msg.sender);

        LockUnit memory userLock = userLocks[msg.sender];
        if(userLock.expired >= _amount) {
            userLock.expired = userLock.expired.sub(_amount);
            userLocks[msg.sender] = userLock;

            amount = _amount;
        } else {
            uint extra = _amount.sub(userLock.expired);
            uint penaltied = extra.sub(extra.mul(penalty).div(1e5));
            amount = userLock.expired.add(penaltied);

            userLock.expired = 0;
            userLock.locked = userLock.locked.sub(extra);
            userLock.startTime = block.timestamp;
            userLocks[msg.sender] = userLock;
        }
    }

    function getDuration() public view returns(uint32 duration) {
        (bool isSet,) = _isSet(msg.sender);
        if(isSet) {
            duration = userLocks[msg.sender].duration;
        }
    }

    function getLock() public view returns(uint expire, uint locked) {
        (bool isSet, bool expired) = _isSet(msg.sender);
        if(isSet) {
            LockUnit memory userLock = userLocks[msg.sender];
            if(expired) {
                uint32 multiplier = lockUnits[userLock.duration];
                expire = userLock.expired.add(userLock.locked.mul(multiplier));
            } else {
                expire = userLock.expired;
                locked = userLock.locked;
            }
        }
    }

    function estimateAmount(uint32 duration, uint amount) external view returns(uint estimate) {
        uint32 multiplier = lockUnits[duration];
        estimate = amount.mul(multiplier).div(100);
    }

    function lock(address locker, uint amount, uint32 duration) external onlyHelper() {
        require(amount > 0);
        require(lockUnits[duration] > 0, "Lock: Invalid duration");

        uint startTime = block.timestamp;
        _lock(locker, startTime, amount, duration);

        emit Lock(locker, startTime, amount, duration);
    }

    function unLock(uint amount) external {
        require(amount > 0);
        require(userLocked[msg.sender]);

        (uint expire, uint locked) = getLock();

        require(expire.add(locked) >= amount, "Insufficient locked");

        uint claimAmount = _unLock(amount);
        IERC20(RAINBOW).safeTransfer(msg.sender, claimAmount);

        emit UnLock(msg.sender, claimAmount);
    }
}
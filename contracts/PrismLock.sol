// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./types/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";

interface ITreasury {
    function claimReward(uint _amount, address _recipient) external;
}

contract PrismLock is Ownable {
    using SafeMath for uint;
    using SafeMath for uint32;
    using SafeERC20 for IERC20;

    address public immutable RAINBOW;
    address public immutable Treasury;
    address public StakingHelper;

    uint32 public penalty; // in thousandths of a %. i.e. 500 = 0.5%

    mapping(uint32 => uint32) public lockUnits;
    mapping(address => bool) public userLocked;
    mapping(address => LockUnit) public userLocks;
    struct LockUnit {
        uint startTime;
        uint locked;
        uint expired;
        uint reward;
        uint32 duration;
    }

    event Lock(address _locker, uint _startTime, uint _amount, uint32 _duration);
    event UnLock(address _locker, uint _amount);
    event GetReward(address _locker, uint _amount);
    event AddLockUnit(uint32 _duration, uint32 _multiplier);
    event RemoveLockUnit(uint32 _duration);
    event Penalty(address indexed _to);

    constructor(address _rainbow, address _treasury) {
        require(_rainbow != address(0));
        RAINBOW = _rainbow;

        require(_treasury != address(0));
        Treasury = _treasury;
    }

    modifier onlyHelper() {
        require(msg.sender == StakingHelper, "Lock: not the helper");
        _;
    }

    function addLockUnit(uint32 _duration, uint32 _multiplier) public onlyOwner() {
        require(_duration > 0, "Lock: Duration is zero");
        require(_multiplier >= 100, "Lock: Mutiplier under 1");
        
        lockUnits[_duration] = _multiplier;

        emit AddLockUnit(_duration, _multiplier);
    }

    function removeLockUnit(uint32 _duration) public onlyOwner() {
        require(lockUnits[_duration] > 0, "Lock: Duration not existing");

        delete lockUnits[_duration];

        emit RemoveLockUnit(_duration);
    }

    function setPenalty(uint32 _penalty) public onlyOwner() {
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
            expired = block.timestamp >= userLock.startTime.add(userLock.duration);
        }
    }

    function _reset(address _locker) private {
        (, bool expired) = _isSet(_locker);
        if(expired) {
            LockUnit memory userLock = userLocks[_locker];
            uint32 multiplier = lockUnits[userLock.duration];
            uint reward = userLock.reward.add(userLock.locked.mul(multiplier.sub(100)).div(100));
            uint expired = userLock.expired.add(userLock.locked);
            userLocks[_locker] = LockUnit({
                startTime: 0,
                locked: 0,
                reward: reward,
                expired: expired,
                duration: userLock.duration
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
                reward: 0,
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

    function _getReward(uint _amount) private {
        (, bool expired) = _isSet(msg.sender);
        if(expired) _reset(msg.sender);

        LockUnit memory userLock = userLocks[msg.sender];
        
        require(userLock.reward >= _amount);

        userLock.reward = userLock.reward.sub(_amount);
        userLocks[msg.sender] = userLock;
    }

    function getDuration() public view returns(uint32 duration) {
        (bool isSet, bool expired) = _isSet(msg.sender);
        if(isSet && !expired) {
            duration = userLocks[msg.sender].duration;
        }
    }

    function getLock() public view returns(uint expire, uint locked, uint reward) {
        (bool isSet, bool expired) = _isSet(msg.sender);
        if(isSet) {
            LockUnit memory userLock = userLocks[msg.sender];
            uint32 multiplier = lockUnits[userLock.duration];
            if(expired) {
                expire = userLock.expired.add(userLock.locked);
                reward = userLock.reward.add(userLock.locked.mul(multiplier.sub(100)).div(100));
            } else {
                expire = userLock.expired;
                locked = userLock.locked;
                reward = userLock.reward;
            }
        }
    }

    function estimateAmount(uint32 duration, uint amount) external view returns(uint estimate) {
        uint32 multiplier = lockUnits[duration];
        estimate = amount.mul(multiplier).div(100);
    }

    function lock(address locker, uint amount, uint32 duration) external onlyHelper() {
    // function lock(address locker, uint amount, uint32 duration) external {
        require(amount > 0);
        require(lockUnits[duration] > 0, "Lock: Invalid duration");

        // check duration
        uint32 userDuration = getDuration();
        require(userDuration == 0 || userDuration == duration, "Lock: Invalid duration");

        uint startTime = block.timestamp;
        _lock(locker, startTime, amount, duration);

        emit Lock(locker, startTime, amount, duration);
    }

    function unLock(uint amount) external {
        require(amount > 0);
        require(userLocked[msg.sender]);

        (uint expire, uint locked,) = getLock();

        require(expire.add(locked) >= amount, "Insufficient locked");

        uint claimAmount = _unLock(amount);
        IERC20(RAINBOW).safeTransfer(msg.sender, claimAmount);

        emit UnLock(msg.sender, claimAmount);
    }

    function getReward(uint amount) external {
        require(amount > 0);

        _getReward(amount);
        
        ITreasury( Treasury ).claimReward(amount, msg.sender);
        emit GetReward(msg.sender, amount);
    }
}
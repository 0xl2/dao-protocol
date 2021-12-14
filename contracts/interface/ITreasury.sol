pragma solidity 0.8.7;

interface ITreasury {
    function deposit(uint256 _amount, address _token, uint256 _profit) external returns (bool);

    function valueOf(address _token, uint _amount) external view returns (uint value_);

    function mintRewards(address _recipient, uint _amount) external;

    function valueOfToken(address _token, uint256 _amount) external view returns (uint256 value_);
}
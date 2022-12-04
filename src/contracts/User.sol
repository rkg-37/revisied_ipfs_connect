//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

contract UserContract {
    using Counters for Counters.Counter;
    Counters.Counter private secretKeys;

    address payable private contractOwner;
    uint256 gasLimit = 0.005 ether;


    struct User{
        address payable userAddr;
        string details;
        bytes32 secretKey;
        uint256 itemsAllowed;
        uint256 totalWarranty;
        uint256 inactiveWarranty;
        uint256 activeWarranty;
        uint256 expiredWarranty;
    }

    mapping( address => User) internal UserAccounts;
    error User_Does_Not_Exist();
    error User_Already_Exists();
    error No_Items_Allowed();
    error Insufficient_Payment();
    error Invalid_User_Credentials();

    event User_Created(string message);
    
    constructor() {
        contractOwner = payable(msg.sender);
    }

    function getGasLimit() public view returns(uint256) {
        require(msg.sender == contractOwner, "Only contract owner can access this function!!!");
        return gasLimit;
    }

    function setGasLimit(uint256 cost) public {
        require(msg.sender == contractOwner, "Only contract owner can access this function!!!");
       gasLimit = cost;
    }

    function createUser(string memory ipfsHash) public {
        if(UserAccounts[msg.sender].userAddr != address(0)){
            emit User_Created("User Not Created");
        } else {
            secretKeys.increment();
            uint256 key = secretKeys.current();
            bytes32 userSecretKey = keccak256(abi.encodePacked(key));
            UserAccounts[msg.sender] = User(
                payable(msg.sender),
                ipfsHash,
                userSecretKey,
                0,
                0,
                0,
                0,
                0
            );

            emit User_Created("User Created");
        }
        
    }

    function checkSecretKey(bytes32 key) public view returns(bool) {
        if(UserAccounts[msg.sender].secretKey==key){
            return true;
        } else {
            return false;
        }
    }

    function getUserDetails() public view returns(string memory, bytes32, uint256){
        address _u = msg.sender;
        if (UserAccounts[_u].userAddr == address(0) ){
            revert User_Does_Not_Exist();
        }
        // string memory key = string(abi.encodePacked(UserAccounts[_u].secretKey));

        return (UserAccounts[_u].details, UserAccounts[_u].secretKey, UserAccounts[_u].itemsAllowed);
    }

    function addAllowedItems(uint256 items) public payable {
        address _u = msg.sender;
        if (UserAccounts[_u].userAddr == address(0) ){
            revert User_Does_Not_Exist();
        }

        if(gasLimit*items != msg.value){
            revert Insufficient_Payment();
        }

        uint256 prev = UserAccounts[_u].itemsAllowed;
        UserAccounts[_u].itemsAllowed = prev + items;

        payable(contractOwner).transfer(msg.value);

    }

    modifier checkUserCredentials(address _o, bytes32 _secret){
        if(UserAccounts[_o].secretKey!=_secret){
            revert Invalid_User_Credentials();
        }

        _;
    }

    modifier checkItemsAllowed(address _o) {
        if(UserAccounts[_o].itemsAllowed==0){
            revert No_Items_Allowed();
        }

        _;
    }
}
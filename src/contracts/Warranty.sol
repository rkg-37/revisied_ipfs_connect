//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./User.sol";
import "./Ticket.sol";

import "hardhat/console.sol";

contract WarrantySystem is UserContract, ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address payable contractOwner;
    string ipfsBaseUri = "";

    constructor( string memory ipfsUri) UserContract() ERC721("Warranty Token", "WARR") {
        contractOwner = payable(msg.sender);
        ipfsBaseUri = ipfsUri;
    }

    function getBaseUri() public view returns(string memory) {
        return ipfsBaseUri;
    }

    function setBaseUri(string memory baseUri) public{
        ipfsBaseUri = baseUri;
    }

    struct ProductWarranty {
        string warrantyDetails;
        string customer;
        uint256 expiryDuration;
        uint256 startTime;
        uint256 endTime;
        string[] tracking;
        string[] activity;
        string status;// placed, transit, active, expired,
        uint256 creationDate;
    }

    mapping (uint256 => ProductWarranty) private idToProductWarranty;

    error Owner_Missmatch();
    error Status_Info_Error(string message);
    error Token_Does_Not_Exists();

    modifier checkItemOwner(address _o,uint256 tokenId) {
        if(!_isApprovedOrOwner(_o, tokenId)){
            revert Owner_Missmatch();
        }

        _;
    }

    modifier checkExistence(uint256 tokenId){
        if(!_exists(tokenId)){
            revert Token_Does_Not_Exists();
        }

        _;
    }

    function createWarranty(
        address productOwner,
        bytes32 _secret,
        string memory _warrantyDetails, 
        string memory _customerHash, 
        uint256 _expiryDuration
    ) public checkUserCredentials(productOwner, _secret) checkItemsAllowed(productOwner){

        UserAccounts[productOwner].itemsAllowed = UserAccounts[productOwner].itemsAllowed - 1;


        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(productOwner, newTokenId);

        string[] memory _tracking;
        string[] memory _activity;

        idToProductWarranty[newTokenId] = ProductWarranty(
            _warrantyDetails,
            _customerHash,
            _expiryDuration,
            0,
            0,
            _tracking,
            _activity,
            "placed",
            block.timestamp
        );

        UserAccounts[productOwner].totalWarranty = UserAccounts[productOwner].totalWarranty + 1;
        UserAccounts[productOwner].inactiveWarranty = UserAccounts[productOwner].inactiveWarranty + 1;
    }

    function getWarrantyDetails(
        address productOwner, bytes32 _secret, uint256 tokenId
    ) public view checkUserCredentials(productOwner, _secret) checkExistence(tokenId) checkItemOwner(productOwner, tokenId) returns(ProductWarranty memory){
        
        return idToProductWarranty[tokenId];
    }

    function startTracking(
        address productOwner, bytes32 _secret, uint256 tokenId
    ) public checkUserCredentials(productOwner, _secret) checkExistence(tokenId) checkItemOwner(productOwner, tokenId){
        

        require(keccak256(bytes(idToProductWarranty[tokenId].status)) == keccak256(bytes("placed")), "Warranty status needs to be 'placed'");

        idToProductWarranty[tokenId].status = "transit";
    }

    function addTrackingData(
        address productOwner, bytes32 _secret, uint256 tokenId, string memory track
    ) public checkUserCredentials(productOwner, _secret) checkExistence(tokenId) checkItemOwner(productOwner, tokenId){

        require(keccak256(bytes(idToProductWarranty[tokenId].status)) == keccak256(bytes("transit")), "Warranty status needs to be 'transit'");

        idToProductWarranty[tokenId].tracking.push(track);
    }

    function reachedDestination(
        address productOwner, bytes32 _secret, uint256 tokenId, string memory track
    ) public checkUserCredentials(productOwner, _secret) checkExistence(tokenId) checkItemOwner(productOwner, tokenId){

        require(keccak256(bytes(idToProductWarranty[tokenId].status)) == keccak256(bytes("transit")), "Warranty status needs to be 'transit'");

        idToProductWarranty[tokenId].tracking.push(track);
        idToProductWarranty[tokenId].status = "active";
        uint256 _exp = idToProductWarranty[tokenId].expiryDuration;
        idToProductWarranty[tokenId].startTime = block.timestamp;
        idToProductWarranty[tokenId].endTime = block.timestamp + _exp;
        UserAccounts[productOwner].inactiveWarranty = UserAccounts[productOwner].inactiveWarranty - 1;
        UserAccounts[productOwner].activeWarranty = UserAccounts[productOwner].activeWarranty + 1;
    }

    function addExpiry(uint256 tokenId) public checkExistence(tokenId) {
        require(msg.sender == contractOwner, "Only contract owner can access this function!!!");

        require(keccak256(bytes(idToProductWarranty[tokenId].status)) == keccak256(bytes("active")), "Warranty status needs to be 'active'");

        idToProductWarranty[tokenId].status = "expired";
        UserAccounts[productOwner].activeWarranty = UserAccounts[productOwner].activeWarranty - 1;
        UserAccounts[productOwner].expiredWarranty = UserAccounts[productOwner].expiredWarranty + 1;

    }

    function getExpiryTime(uint256 tokenId) public view checkExistence(tokenId) returns(string memory) {
        require(msg.sender == contractOwner, "Only contract owner can access this function!!!");
	    return idToProductWarranty[tokenId].endTime;
    }

    function checkingCreds(address _o, bytes32 _secret) public view returns(bool) {
        if(UserAccounts[_o].secretKey!=_secret){
            return false;
        }
        return true;
    }


    // Ticket Module

    // function raiseTicket(
    //     address productOwner, 
    //     bytes32 _secret,
    //     string memory ticketDetails,
    //     address ticketAddr
    // ) public checkUserCredentials(productOwner, _secret) {

    //     TicketContract(ticketAddr).createTicket( productOwner, ticketDetails);
    // }

    // function getTicketDetails(
    //     address productOwner, 
    //     bytes32 _secret,
    //     uint256 ticketId,
    //     address ticketAddr
    // ) public view checkUserCredentials(productOwner, _secret) returns( TicketContract.Ticket memory){
    //     return TicketContract(ticketAddr).getTicket(productOwner, ticketId);
    // }

    // function assignTicketToOfficer(
    //     address productOwner, 
    //     bytes32 _secret,
    //     uint256 ticketId,
    //     string memory officer,
    //     address ticketAddr
    // ) public checkUserCredentials(productOwner, _secret) {
        
    //     TicketContract(ticketAddr).assignTicket(productOwner, ticketId, officer);
    // }

    function addActivityToToken(
        address productOwner, 
        bytes32 _secret,
        uint256 tokenId,
        string memory activityHash
    ) public checkUserCredentials(productOwner, _secret) checkExistence(tokenId) checkItemOwner(productOwner, tokenId) {
        require(keccak256(bytes(idToProductWarranty[tokenId].status)) == keccak256(bytes("active")), "Warranty status needs to be 'active'");

        idToProductWarranty[tokenId].activity.push(activityHash);
    }

    // function closeTicket(
    //     address productOwner, 
    //     bytes32 _secret,
    //     uint256 ticketId,
    //     address ticketAddr
    // ) public checkUserCredentials(productOwner, _secret) {
    //     TicketContract(ticketAddr).burnTicket(productOwner, ticketId);
    // }

    // function getTotalTickets(
    //     address productOwner, 
    //     bytes32 _secret,
    //     address ticketAddr
    // ) public view checkUserCredentials(productOwner, _secret) returns(uint256){
    //     return TicketContract(ticketAddr).balanceOf(productOwner);
    // }

}

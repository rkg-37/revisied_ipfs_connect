//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract TicketContract is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _ticketIds;

    address payable private contractOwner;

    struct Ticket{
        string ticketDetails;
        string officerAssigned;
        uint256 creationDate;
        string status; // pending, assigned
        string comments;
    }

    error Unauthorised();
    error Ticket_Does_Not_Exists();

    mapping (uint256 => Ticket) private idToTicket;

    constructor()  ERC721("Warranty Token", "WARR") {
        contractOwner = payable(msg.sender);
    }

    modifier checkOwner(address _o, uint256 _t){
        if(_isApprovedOrOwner(_o, _t)){
            revert Unauthorised();
        }

        _;
    }

    modifier checkExistence(uint256 _t){
        if(!_exists(_t)){
            revert Ticket_Does_Not_Exists();
        }

        _;
    }

    function createTicket(address ticketOwner,string memory ipfsHash) public {
        _ticketIds.increment();
        uint256 newTokenId = _ticketIds.current();

        _mint(ticketOwner, newTokenId);

        idToTicket[newTokenId] = Ticket (
            ipfsHash,
            "",
            block.timestamp,
            "pending",
            ""
        );
    }

    function getTicket( 
        address ticketOwner, uint256 ticketId 
    ) public view checkOwner(ticketOwner, ticketId) checkExistence(ticketId) returns (Ticket memory){
        return idToTicket[ticketId];
    }

    function assignTicket(address ticketOwner, uint256 ticketId, string memory officerHash) public checkExistence(ticketId) checkOwner(ticketOwner, ticketId) {
        idToTicket[ticketId].officerAssigned = officerHash;
    }

    function burnTicket(address ticketOwner, uint256 ticketId) public checkExistence(ticketId) checkOwner(ticketOwner, ticketId){
        _burn(ticketId);
        delete idToTicket[ticketId];
    }



}
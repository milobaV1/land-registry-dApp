//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "./IKYC.sol";

contract LandRegistry {
    //Register land
    //Verify Land
    //Get land
    //Transfer

    IKYC public kyc;

    constructor(address _kycAddress) {
        kyc = IKYC(_kycAddress);
    }

    // Land Transfer Status and Use Enums
    enum TransferStatus { None, Pending, Approved }
    enum LandUse { Residential, Industrial }

    // LandOwner Struct
    struct LandOwner{
        address landOwnerAddress;
        uint256[] ownedLands;
        bool isActive;
    }

    // LandData Struct
    struct LandData{
        uint256 landId;
        string cOfONo;
        address currentOwner;
        string state;
        string lga;
        uint256 area; // Size of the land probably in square meters
        LandUse landUse;
        string landIpfs;
        bool isVerified;
        address[] ownershipHistory;
        uint256 registrationDate; // Timestamp
        uint256 lastTransferDate; // Timestamp
        TransferStatus transferStatus; // Enum: None, Pending, Approved
    }

    // Events
    event LandCreated(
        uint256 landId,
        string cOfONo,
        address currentOwner,
        string state,
        string lga,
        uint256 area,
        LandUse landuse,
        string landIpfs,
        bool isVerified,
        uint256 registrationDate
    );

    event LandUpdate(
        address currentOwner,
        uint256 transferDate,
        TransferStatus transferStatus
    );

    event verifiedLand(uint256 indexed _landId);

    // State Variables
    LandData[] public landList; // list containing all registered land
    mapping(string => bool) public cOfOExists;
    mapping(address => LandOwner) public landOwners;
    mapping(address => bool) public isLandOwner;
    mapping(uint256 => bool) isLandVerified;
    mapping(uint256 => LandData) lands; // maps the land id to the land
    mapping(address => uint256[]) ownedLandsMapping; // maps the land owner to all the ids of the owned land
    
    // New efficient ownership tracking mappings
    mapping(address => mapping(uint256 => bool)) public ownsLand; // owner => landId => bool
    mapping(address => uint256) public landCount; // owner => count of owned lands

    // Modifiers
    modifier landExists(uint256 _landId) {
        require(_landId < landList.length, "Land does not exist");
        _;
    }

    modifier newLand(string memory _cOfONo){
        require(!cOfOExists[_cOfONo], "Land is already registered");
        _;
    }

    modifier landNotVerified(uint256 _landId){
        require(!isLandVerified[_landId], "Land already verified");
        _;
    }

    // Modifier for users that have done KYC
    modifier onlyVerifiedUser(){
        require(kyc.isUserVerified(msg.sender), "KYC Verification needed");
        _;
    }

    // Register Land Function
    function registerLand(string memory _cOfONo, string memory _state, string memory _lga, uint256 _area, LandUse _landUse, string memory _ipfs) public onlyVerifiedUser newLand(_cOfONo){
        console.log("registerLand function called");
        
        uint256 newLandId = landList.length;
        address[] memory ownershipHistory = new address[](1);
        ownershipHistory[0] = msg.sender;

        LandData memory newLandData = LandData({
            landId: newLandId,
            cOfONo: _cOfONo,
            currentOwner: msg.sender,
            state: _state,
            lga: _lga,
            area: _area,
            landUse: _landUse,
            landIpfs: _ipfs,
            isVerified: false,
            ownershipHistory: ownershipHistory,
            registrationDate: block.timestamp,
            lastTransferDate: block.timestamp,
            transferStatus: TransferStatus.None
        });

        landList.push(newLandData);
        lands[newLandId] = newLandData;
        isLandVerified[newLandId] = false;
        cOfOExists[_cOfONo] = true;

        // Update ownership mappings
        ownedLandsMapping[msg.sender].push(newLandId);
        ownsLand[msg.sender][newLandId] = true;
        landCount[msg.sender]++;
        
        if(!isLandOwner[msg.sender]){
            landOwners[msg.sender] = LandOwner({
                landOwnerAddress: msg.sender,
                ownedLands: ownedLandsMapping[msg.sender],
                isActive: true
            });
            isLandOwner[msg.sender] = true;
        }

        emit LandCreated(
            newLandId,
            _cOfONo,
            msg.sender,
            _state,
            _lga,
            _area,
            _landUse,
            _ipfs,
            false,
            block.timestamp
        );
    }

    // Verify Land Function
    function verifyLand(uint256 _landId) public landExists(_landId) landNotVerified(_landId){
        LandData storage land = landList[_landId];
        land.isVerified = true;
        isLandVerified[_landId] = true;
        emit verifiedLand(_landId);
    }

    // function initiateTransfer
    // Transfer Land Function
    function transferLand(uint256 _landId, address _newOwner) public onlyVerifiedUser landExists(_landId){
        LandData storage land = landList[_landId];
        require(land.currentOwner == msg.sender, "Only the owner can transfer land");
        require(_newOwner != address(0), "Invalid new owner");
        require(kyc.isUserVerified(_newOwner), "New owner must be KYC verified");

        address previousOwner = land.currentOwner;

        // Remove ownership from previous owner
        ownsLand[previousOwner][_landId] = false;
        landCount[previousOwner]--;
        
        // Remove from array mapping
        _removeLandFromOwner(previousOwner, _landId);

        // Update land data
        land.currentOwner = _newOwner;
        land.lastTransferDate = block.timestamp;
        land.ownershipHistory.push(_newOwner);
        land.transferStatus = TransferStatus.Approved;

        // Add ownership to new owner
        ownsLand[_newOwner][_landId] = true;
        landCount[_newOwner]++;
        ownedLandsMapping[_newOwner].push(_landId);
        
        // Set up new owner if they don't exist yet
        if(!isLandOwner[_newOwner]){
            landOwners[_newOwner] = LandOwner({
                landOwnerAddress: _newOwner,
                ownedLands: ownedLandsMapping[_newOwner],
                isActive: true
            });
            isLandOwner[_newOwner] = true;
        } else {
            // Update existing owner's data
            landOwners[_newOwner].ownedLands = ownedLandsMapping[_newOwner];
            landOwners[_newOwner].isActive = true;
        }

        // Update previous owner status
        if (landCount[previousOwner] == 0) {
            landOwners[previousOwner].isActive = false;
        } else {
            // Update previous owner's ownedLands array reference
            landOwners[previousOwner].ownedLands = ownedLandsMapping[previousOwner];
        }

        emit LandUpdate(
            _newOwner,
            land.lastTransferDate,
            land.transferStatus
        );
    }

    // Helper function to remove land from owner's array
    function _removeLandFromOwner(address owner, uint256 landId) internal {
        uint256[] storage ownedLands = ownedLandsMapping[owner];
        
        for (uint256 i = 0; i < ownedLands.length; i++) {
            if (ownedLands[i] == landId) {
                // Move the last element to the position of the element to remove
                ownedLands[i] = ownedLands[ownedLands.length - 1];
                // Remove the last element
                ownedLands.pop();
                break;
            }
        }
    }

    // View Functions
    function getAllLand() public view returns(LandData[] memory) {
        return landList;
    }

    function getLand(uint256 _landId) public view landExists(_landId) returns (LandData memory){
        return landList[_landId];
    }

    // New helper functions for efficient ownership checking
    function doesOwnerHaveLand(address owner, uint256 landId) public view returns (bool) {
        return ownsLand[owner][landId];
    }

    // Get total number of lands owned by an address
    function getLandCount(address owner) public view returns (uint256) {
        return landCount[owner];
    }

    // Get all land IDs owned by a specific address (from mapping)
    function getOwnedLands(address owner) public view returns (uint256[] memory) {
        return ownedLandsMapping[owner];
    }

    // Check if a land is verified
    function isVerified(uint256 _landId) public view landExists(_landId) returns (bool) {
        return isLandVerified[_landId];
    }

    // Get ownership history of a land
    function getOwnershipHistory(uint256 _landId) public view landExists(_landId) returns (address[] memory) {
        return landList[_landId].ownershipHistory;
    }

    // Get lands by state (useful for filtering)
    function getLandsByState(string memory _state) public view returns (LandData[] memory) {
        uint256 count = 0;
        
        // First pass: count matching lands
        for (uint256 i = 0; i < landList.length; i++) {
            if (keccak256(bytes(landList[i].state)) == keccak256(bytes(_state))) {
                count++;
            }
        }
        
        // Second pass: populate array
        LandData[] memory stateLands = new LandData[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < landList.length; i++) {
            if (keccak256(bytes(landList[i].state)) == keccak256(bytes(_state))) {
                stateLands[index] = landList[i];
                index++;
            }
        }
        
        return stateLands;
    }

    // Get verified lands only
    function getVerifiedLands() public view returns (LandData[] memory) {
        uint256 count = 0;
        
        // First pass: count verified lands
        for (uint256 i = 0; i < landList.length; i++) {
            if (landList[i].isVerified) {
                count++;
            }
        }
        
        // Second pass: populate array
        LandData[] memory verifiedLands = new LandData[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < landList.length; i++) {
            if (landList[i].isVerified) {
                verifiedLands[index] = landList[i];
                index++;
            }
        }
        
        return verifiedLands;
    }

    // Get total number of registered lands
    function getTotalLandCount() public view returns (uint256) {
        return landList.length;
    }

    // Get lands by land use type
    function getLandsByUse(LandUse _landUse) public view returns (LandData[] memory) {
        uint256 count = 0;
        
        // Count matching lands
        for (uint256 i = 0; i < landList.length; i++) {
            if (landList[i].landUse == _landUse) {
                count++;
            }
        }
        
        // Populate array
        LandData[] memory useLands = new LandData[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < landList.length; i++) {
            if (landList[i].landUse == _landUse) {
                useLands[index] = landList[i];
                index++;
            }
        }
        
        return useLands;
    }
}
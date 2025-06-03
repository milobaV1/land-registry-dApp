//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";
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

    // Verifiers
    // address[] public verifiers;
    // mapping(address => bool) isVerifier;
    // modifier onlyVerifier {
    //     require(isVerifier[msg.sender], "Not a registered verifier");
    //     _;
    // }
    //Land
    enum TransferStatus { None, Pending, Approved }
    enum LandUse { Residential, Industrial }

    //LandOwner
    struct LandOwner{
        address landOwnerAddress;
        uint256[] ownedLands;
        bool isActive;
        
        //Some other things
    }

    //LandData
    struct LandData{
        uint256 landId;
        //bool landVerified; (Commented this out because there is already the isVerified boolean)
        address currentOwner;
        string state;
        string lga;
        uint256 area; //Size of the land probably in square meters
        LandUse landUse;
        //string documentNumber; (Might not need this)
        string landIpfs;
        bool isVerified;
        address[] ownershipHistory;
        uint256 registrationDate; //Timestamp
        uint256 lastTransferDate; //Timestamp
        TransferStatus transferStatus; // Enum: None, Pending, Approved

    }

    event LandCreated(
        uint256 landId,
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

    //event verifiedLand(address indexed verifier, uint256 indexed _landId);
    event verifiedLand(uint256 indexed _landId);

    LandData[] public landList; // list containing all registered land
    mapping(address => LandOwner) public landOwners;
    mapping(address => bool) public isLandOwner;

    //mapping(uint256 => mapping(address => bool)) isLandVerified; (Changed this logic because we're not using an external verifier)
    mapping(uint256 => bool) isLandVerified;
    mapping(uint256 => LandData) lands; // maps the land id to the land
    mapping(address => uint256[]) ownedLandsMapping; // maps the land owner to all the ids of the owned land

    modifier landExists(uint256 _landId) {
        //Instead of using this require, I am think of having a mapping that maps the land id to a boolean to show if the land exists or not, the i'll do something like this
        //require(landExists[_landId], "Land does not exist")
        require(_landId < landList.length, "Land does not exist");
        _;
    }

    modifier landNotVerified(uint256 _landId){
        require(!isLandVerified[_landId], "Land already verified");
        _;
    }

    //Modifier for users that have done KYC
    modifier onlyVerifiedUser(){
        require(kyc.isUserVerified(msg.sender), "KYC Verification needed");
        _;
    }


    function registerLand(string memory _state, string memory _lga, uint256 _area, LandUse _landUse, string memory _ipfs) public onlyVerifiedUser{
        console.log("registerLand function called");
        //Do the necessary checks
        //Land must not exist
        

        uint256 newLandId = landList.length;
        address[] memory ownershipHistory = new address[](1);
        ownershipHistory[0] = msg.sender;

        LandData memory newLand = LandData({
            landId: newLandId,
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

        landList.push(newLand);
        lands[newLandId] = newLand;
        isLandVerified[newLandId] = false;

        ownedLandsMapping[msg.sender].push(newLandId);
        
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
// This first verifyland function uses an external verifier to verify land but I want to change that logic
    // function verifyLand(uint256 _landId) public 
    // //onlyVerifier 
    // landExists(_landId) landNotVerified(_landId){
    //     //LandData storage land = landList[_landId];
    //     isLandVerified[_landId][msg.sender] = true;
    //     emit verifiedLand(msg.sender, _landId);
    // }

    function verifyLand(uint256 _landId) public landExists(_landId) landNotVerified(_landId){
        LandData storage land = landList[_landId];
        land.isVerified = true;
        isLandVerified[_landId] = true;
        emit verifiedLand(_landId);

    }

    function transferLand(uint256 _landId, address _newOwner) public onlyVerifiedUser landExists(_landId){
        LandData storage land = landList[_landId];
        require(land.currentOwner == msg.sender, "Only the woner can transfer land");
        require(_newOwner != address(0), "Invalid new owner");
        require(kyc.isUserVerified(_newOwner), "New owner must be KYC verfied");

        land.currentOwner = _newOwner;
        land.lastTransferDate = block.timestamp;
        land.ownershipHistory.push(_newOwner);
        land.transferStatus = TransferStatus.Approved;

        ownedLandsMapping[_newOwner].push(_landId);
         if(!isLandOwner[msg.sender]){
            landOwners[msg.sender] = LandOwner({
                landOwnerAddress: msg.sender,
                ownedLands: ownedLandsMapping[msg.sender],
                isActive: true
            });
            isLandOwner[msg.sender] = true;
        }
        emit LandUpdate(
            _newOwner,
            land.lastTransferDate,
            land.transferStatus
        );


    }

    function getAllLand() public view returns(LandData[] memory) {
        return landList;
    }

    function getLand(uint256 _landId) public view landExists(_landId) returns (LandData memory){
        return landList[_landId];
    }


}
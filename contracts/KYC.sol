// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

//Should be able to delete

contract LandRegistryKYC {

    struct KYC {
        string ninHash;       // Hashed or encrypted version of NIN
        string photoCID;      // IPFS CID for the uploaded photo
        bool isVerified;      // Whether KYC has been verified
    }

    address[] public users;
    mapping(address => bool) public hasSubmittedKYC;
    mapping(address => KYC) public kycRecords;

    event KYCSet(
        address user,
        bool isVerified
    );

    function isUserVerified(address user) public view returns (bool) {
        return kycRecords[user].isVerified;
    }

    function setKYC(address user, string memory ninHash, string memory photoCID) public {

        require(!hasSubmittedKYC[user], "KYC already exists for this user");

        kycRecords[user] = KYC({
            ninHash: ninHash,
            photoCID: photoCID,
            isVerified: true
        });

        users.push(user);
        hasSubmittedKYC[user] = true;
        emit KYCSet(user, true);
    }

    function getUserKYCData(address user) public view returns (string memory ninHash, string memory photoCID, bool isVerified) {
        KYC memory record = kycRecords[user];
        return (record.ninHash, record.photoCID, record.isVerified);
    }
    
   function getVerifiedUsers() public view returns (address[] memory) {
    uint count = 0;
    for (uint i = 0; i < users.length; i++) {
        if (kycRecords[users[i]].isVerified) {
            count++;
        }
    }

    address[] memory verified = new address[](count);
    uint j = 0;
    for (uint i = 0; i < users.length; i++) {
        if (kycRecords[users[i]].isVerified) {
            verified[j] = users[i];
            j++;
        }
    }

    return verified;
}
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IKYC.sol";

contract MockKYC is IKYC {
    mapping(address => bool) private verifiedUsers;
    mapping(address => string) private userNinHashes;
    mapping(address => string) private userPhotoCIDs;
    address[] private verifiedUsersList;
    
    function verifyUser(address user) external {
        if (!verifiedUsers[user]) {
            verifiedUsers[user] = true;
            verifiedUsersList.push(user);
        }
    }
    
    function revokeUser(address user) external {
        if (verifiedUsers[user]) {
            verifiedUsers[user] = false;
            // Remove from array
            for (uint i = 0; i < verifiedUsersList.length; i++) {
                if (verifiedUsersList[i] == user) {
                    verifiedUsersList[i] = verifiedUsersList[verifiedUsersList.length - 1];
                    verifiedUsersList.pop();
                    break;
                }
            }
        }
    }
    
    // Set KYC data for testing purposes
    function setUserKYCData(address user, string memory ninHash, string memory photoCID) external {
        userNinHashes[user] = ninHash;
        userPhotoCIDs[user] = photoCID;
    }
    
    // Implement all required interface functions
    function isUserVerified(address user) external view override returns (bool) {
        return verifiedUsers[user];
    }
    
    function getUserKYCData(address user) external view override returns (string memory ninHash, string memory photoCID, bool isVerified) {
        return (userNinHashes[user], userPhotoCIDs[user], verifiedUsers[user]);
    }
    
    function getVerifiedUsers() external view override returns (address[] memory) {
        return verifiedUsersList;
    }
}
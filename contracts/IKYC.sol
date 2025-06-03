// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface  IKYC {
    function isUserVerified(address user) external view returns (bool);
    function getUserKYCData(address user) external view returns (string memory ninHash, string memory photoCID, bool isVerified);
    function getVerifiedUsers() external view returns (address[] memory);
}
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KYC", function () {
  let LandRegistryKYC: any, kycContract: any;
  let owner: import("ethers").Signer, user1: import("ethers").Signer, user2: import("ethers").Signer;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    LandRegistryKYC = await ethers.getContractFactory("LandRegistryKYC");
    kycContract = await LandRegistryKYC.deploy();
    await kycContract.waitForDeployment();
  });

  it("should allow setting KYC for a user", async () => {
    const ninHash = "hashed_nin";
    const photoCID = "ipfs_photo_cid";

    const user1Address = await user1.getAddress();
    await kycContract.setKYC(user1Address, ninHash, photoCID);
    const data = await kycContract.getUserKYCData(user1Address);

    expect(data.ninHash).to.equal(ninHash);
    expect(data.photoCID).to.equal(photoCID);
    expect(data.isVerified).to.equal(true);
  });

  it("should emit KYCSet event on KYC submission", async () => {
    const user1Address = await user1.getAddress();
    await expect(
      kycContract.setKYC(user1Address, "hash1", "cid1")
    )
      .to.emit(kycContract, "KYCSet")
      .withArgs(user1Address, true);
  it("should not allow duplicate KYC submission", async () => {
    const user1Address = await user1.getAddress();
    await kycContract.setKYC(user1Address, "hash1", "cid1");

    await expect(
      kycContract.setKYC(user1Address, "hash2", "cid2")
    ).to.be.revertedWith("KYC already exists for this user");
  });

  it("should return correct verification status", async () => {
    const user2Address = await user2.getAddress();
    expect(await kycContract.isUserVerified(user2Address)).to.be.false;

    await kycContract.setKYC(user2Address, "hash2", "cid2");

    expect(await kycContract.isUserVerified(user2Address)).to.be.true;
  });

  it("should return only verified users", async () => {
    const user1Address = await user1.getAddress();
    const user2Address = await user2.getAddress();
    await kycContract.setKYC(user1Address, "hash1", "cid1");
    await kycContract.setKYC(user2Address, "hash2", "cid2");

    const verified = await kycContract.getVerifiedUsers();
    expect(verified).to.include.members([user1Address, user2Address]);
    expect(verified.length).to.equal(2);
  });
});
  });

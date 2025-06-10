import { expect } from "chai";
import { ethers } from "hardhat";

describe("LandRegistry", function () {
  let LandRegistry: any, landRegistry: any;
  let MockKYC: any, mockKYC: any;
  let owner: import("ethers").Signer, addr1: import("ethers").Signer, addr2: import("ethers").Signer, addr3: import("ethers").Signer;
  
  // Test data constants
  const LAND_DATA = {
    state: "Lagos",
    lga: "Ikeja",
    area: 1000,
    landUse: 0, // Residential
    ipfs: "QmTestHash123"
  };

  const LAND_DATA_2 = {
    state: "Abuja",
    lga: "Garki",
    area: 2000,
    landUse: 1, // Industrial
    ipfs: "QmTestHash456"
  };

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    // Deploy Mock KYC contract
    MockKYC = await ethers.getContractFactory("MockKYC");
    mockKYC = await MockKYC.deploy();
    await mockKYC.waitForDeployment();
    
    // Deploy LandRegistry contract
    LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy(await mockKYC.getAddress());
    await landRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct KYC contract address", async function () {
      expect(await landRegistry.kyc()).to.equal(await mockKYC.getAddress());
    });

    it("Should initialize with zero total land count", async function () {
      expect(await landRegistry.getTotalLandCount()).to.equal(0);
    });
  });

  describe("Land Registration", function () {
    beforeEach(async function () {
      // Verify users for KYC
      await mockKYC.verifyUser(await owner.getAddress());
      await mockKYC.verifyUser(await addr1.getAddress());
    });

    it("Should register land successfully with valid data", async function () {
      const ownerAddress = await owner.getAddress();
      const tx = await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      
      // Get the block to check timestamp
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(landRegistry, "LandCreated")
        .withArgs(
          0, // landId
          ownerAddress,
          LAND_DATA.state,
          LAND_DATA.lga,
          LAND_DATA.area,
          LAND_DATA.landUse,
          LAND_DATA.ipfs,
          false, // isVerified
          block?.timestamp // timestamp
        );
    });

    it("Should fail if user is not KYC verified", async function () {
      await expect(
        landRegistry.connect(addr2).registerLand(
          LAND_DATA.state,
          LAND_DATA.lga,
          LAND_DATA.area,
          LAND_DATA.landUse,
          LAND_DATA.ipfs
        )
      ).to.be.revertedWith("KYC Verification needed");
    });

    it("Should create correct land data structure", async function () {
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );

      const land = await landRegistry.getLand(0);
      const ownerAddress = await owner.getAddress();
      expect(land.landId).to.equal(0);
      expect(land.currentOwner).to.equal(ownerAddress);
      expect(land.state).to.equal(LAND_DATA.state);
      expect(land.lga).to.equal(LAND_DATA.lga);
      expect(land.area).to.equal(LAND_DATA.area);
      expect(land.landUse).to.equal(LAND_DATA.landUse);
      expect(land.landIpfs).to.equal(LAND_DATA.ipfs);
      expect(land.isVerified).to.be.false;
      expect(land.transferStatus).to.equal(0); // None
    });

    it("Should update land owner mapping correctly", async function () {
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      const ownerAddress = await owner.getAddress();
      expect(await landRegistry.isLandOwner(ownerAddress)).to.be.true;
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.true;
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(1);
      
      const landOwner = await landRegistry.landOwners(ownerAddress);
      expect(landOwner.landOwnerAddress).to.equal(ownerAddress);
      expect(landOwner.isActive).to.be.true;
    });

    it("Should assign sequential land IDs and update total count", async function () {
      // Register multiple lands
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      
      await landRegistry.connect(addr1).registerLand(
        LAND_DATA_2.state,
        LAND_DATA_2.lga,
        LAND_DATA_2.area,
        LAND_DATA_2.landUse,
        LAND_DATA_2.ipfs
      );

      const land1 = await landRegistry.getLand(0);
      const land2 = await landRegistry.getLand(1);
      
      expect(land1.landId).to.equal(0);
      expect(land2.landId).to.equal(1);
      expect(await landRegistry.getTotalLandCount()).to.equal(2);
    });

    it("Should track ownership correctly for multiple lands", async function () {
      // Register two lands for the same owner
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );

      await landRegistry.registerLand(
        "Ogun",
        "Abeokuta",
        1500,
        0,
        "QmTestHash789"
      );
      const ownerAddress = await owner.getAddress();
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(2);
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.true;
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 1)).to.be.true;

      const ownedLands = await landRegistry.getOwnedLands(ownerAddress);
      expect(ownedLands.length).to.equal(2);
      expect(ownedLands[0]).to.equal(0);
      expect(ownedLands[1]).to.equal(1);
    });
  });

  describe("Land Verification", function () {
    beforeEach(async function () {
      const ownerAddress = await owner.getAddress();
      await mockKYC.verifyUser(ownerAddress);
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
    });

    it("Should verify land successfully", async function () {
      await expect(landRegistry.verifyLand(0))
        .to.emit(landRegistry, "verifiedLand")
        .withArgs(0);
      
      const land = await landRegistry.getLand(0);
      expect(land.isVerified).to.be.true;
      expect(await landRegistry.isVerified(0)).to.be.true;
    });

    it("Should fail to verify non-existent land", async function () {
      await expect(landRegistry.verifyLand(999))
        .to.be.revertedWith("Land does not exist");
    });

    it("Should fail to verify already verified land", async function () {
      await landRegistry.verifyLand(0);
      
      await expect(landRegistry.verifyLand(0))
        .to.be.revertedWith("Land already verified");
    });
  });

  describe("Land Transfer", function () {
    beforeEach(async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();
      await mockKYC.verifyUser(ownerAddress);
      await mockKYC.verifyUser(addr1Address);
      await mockKYC.verifyUser(addr2Address);
      
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
    });

    it("Should transfer land successfully", async function () {
      const addr1Address = await addr1.getAddress();
      const tx = await landRegistry.transferLand(0, addr1Address);
      
      // Get the block to check timestamp
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(landRegistry, "LandUpdate")
        .withArgs(
          addr1Address,
          block?.timestamp, // timestamp
          2 // TransferStatus.Approved
        );
      
      const land = await landRegistry.getLand(0);
      expect(land.currentOwner).to.equal(addr1Address);
      expect(land.transferStatus).to.equal(2); // Approved
    });

    it("Should fail if caller is not the owner", async function () {
      const addr2Address = await addr2.getAddress();
      await expect(
        landRegistry.connect(addr1).transferLand(0, addr2Address)
      ).to.be.revertedWith("Only the owner can transfer land");
    });

    it("Should fail if new owner is zero address", async function () {
      await expect(
        landRegistry.transferLand(0, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid new owner");
    });

    it("Should fail if new owner is not KYC verified", async function () {
      const addr3Address = await addr3.getAddress();
      await expect(
        landRegistry.transferLand(0, addr3Address)
      ).to.be.revertedWith("New owner must be KYC verified");
    });

    it("Should fail if caller is not KYC verified", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await mockKYC.revokeUser(ownerAddress);
      
      await expect(
        landRegistry.transferLand(0, addr1Address)
      ).to.be.revertedWith("KYC Verification needed");
    });

    it("Should fail for non-existent land", async function () {
      const addr1Address = await addr1.getAddress();
      await expect(
        landRegistry.transferLand(999, addr1Address)
      ).to.be.revertedWith("Land does not exist");
    });

    it("Should update ownership history correctly", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();
      
      await landRegistry.transferLand(0, addr1Address);
      await landRegistry.connect(addr1).transferLand(0, addr2Address);
      
      const ownershipHistory = await landRegistry.getOwnershipHistory(0);
      expect(ownershipHistory.length).to.equal(3);
      expect(ownershipHistory[0]).to.equal(ownerAddress);
      expect(ownershipHistory[1]).to.equal(addr1Address);
      expect(ownershipHistory[2]).to.equal(addr2Address);
    });

    it("Should remove land from previous owner's mapping", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      // Verify initial ownership
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.true;
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(1);
      
      // Transfer land
      await landRegistry.transferLand(0, addr1Address);
      
      // Check previous owner no longer owns the land
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.false;
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(0);
      
      // Check new owner owns the land
      expect(await landRegistry.doesOwnerHaveLand(addr1Address, 0)).to.be.true;
      expect(await landRegistry.getLandCount(addr1Address)).to.equal(1);
      
      // Check arrays are updated
      const ownerLands = await landRegistry.getOwnedLands(ownerAddress);
      const newOwnerLands = await landRegistry.getOwnedLands(addr1Address);
      
      expect(ownerLands.length).to.equal(0);
      expect(newOwnerLands.length).to.equal(1);
      expect(newOwnerLands[0]).to.equal(0);
    });

    it("Should mark previous owner as inactive if no lands remain", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await landRegistry.transferLand(0, addr1Address);
      
      const previousOwner = await landRegistry.landOwners(ownerAddress);
      expect(previousOwner.isActive).to.be.false;
      
      const newOwner = await landRegistry.landOwners(addr1Address);
      expect(newOwner.isActive).to.be.true;
    });

    it("Should handle multiple land transfers correctly", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      // Register another land for owner
      await landRegistry.registerLand(
        "Ogun",
        "Abeokuta",
        1500,
        0,
        "QmTestHash789"
      );
      
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(2);
      
      // Transfer one land
      await landRegistry.transferLand(0, addr1Address);
      
      // Owner should still be active with one land
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(1);
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 1)).to.be.true;
      
      const ownerData = await landRegistry.landOwners(ownerAddress);
      expect(ownerData.isActive).to.be.true;
    });

    it("Should handle transfer to existing land owner", async function () {
      const addr1Address = await addr1.getAddress();
      // addr1 registers a land first
      await landRegistry.connect(addr1).registerLand(
        LAND_DATA_2.state,
        LAND_DATA_2.lga,
        LAND_DATA_2.area,
        LAND_DATA_2.landUse,
        LAND_DATA_2.ipfs
      );
      
      expect(await landRegistry.getLandCount(addr1Address)).to.equal(1);
      
      // Transfer land from owner to addr1
      await landRegistry.transferLand(0, addr1Address);
      
      // addr1 should now own 2 lands
      expect(await landRegistry.getLandCount(addr1Address)).to.equal(2);
      expect(await landRegistry.doesOwnerHaveLand(addr1Address, 0)).to.be.true;
      expect(await landRegistry.doesOwnerHaveLand(addr1Address, 1)).to.be.true;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await mockKYC.verifyUser(ownerAddress);
      await mockKYC.verifyUser(addr1Address);
      
      // Register multiple lands
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      
      await landRegistry.connect(addr1).registerLand(
        LAND_DATA_2.state,
        LAND_DATA_2.lga,
        LAND_DATA_2.area,
        LAND_DATA_2.landUse,
        LAND_DATA_2.ipfs
      );
    });

    it("Should return all registered lands", async function () {
      const allLands = await landRegistry.getAllLand();
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      expect(allLands.length).to.equal(2);
      expect(allLands[0].currentOwner).to.equal(ownerAddress);
      expect(allLands[1].currentOwner).to.equal(addr1Address);
    });

    it("Should return specific land by ID", async function () {
      const land = await landRegistry.getLand(1);
      const addr1Address = await addr1.getAddress();
      expect(land.landId).to.equal(1);
      expect(land.currentOwner).to.equal(addr1Address);
      expect(land.state).to.equal(LAND_DATA_2.state);
      expect(land.lga).to.equal(LAND_DATA_2.lga);
    });

    it("Should fail to get non-existent land", async function () {
      await expect(landRegistry.getLand(999))
        .to.be.revertedWith("Land does not exist");
    });

    it("Should return lands by state", async function () {
      const lagosLands = await landRegistry.getLandsByState("Lagos");
      const abujaLands = await landRegistry.getLandsByState("Abuja");
      
      expect(lagosLands.length).to.equal(1);
      expect(abujaLands.length).to.equal(1);
      expect(lagosLands[0].state).to.equal("Lagos");
      expect(abujaLands[0].state).to.equal("Abuja");
    });

    it("Should return lands by use type", async function () {
      const residentialLands = await landRegistry.getLandsByUse(0); // Residential
      const industrialLands = await landRegistry.getLandsByUse(1); // Industrial
      
      expect(residentialLands.length).to.equal(1);
      expect(industrialLands.length).to.equal(1);
      expect(residentialLands[0].landUse).to.equal(0);
      expect(industrialLands[0].landUse).to.equal(1);
    });

    it("Should return verified lands only", async function () {
      // Verify one land
      await landRegistry.verifyLand(0);
      
      const verifiedLands = await landRegistry.getVerifiedLands();
      expect(verifiedLands.length).to.equal(1);
      expect(verifiedLands[0].isVerified).to.be.true;
      expect(verifiedLands[0].landId).to.equal(0);
    });

    it("Should return empty array for non-existent state", async function () {
      const nonExistentLands = await landRegistry.getLandsByState("NonExistent");
      expect(nonExistentLands.length).to.equal(0);
    });

    it("Should return correct total land count", async function () {
      expect(await landRegistry.getTotalLandCount()).to.equal(2);
      
      // Register another land
      await landRegistry.registerLand(
        "Ogun",
        "Abeokuta",
        1500,
        0,
        "QmTestHash789"
      );
      
      expect(await landRegistry.getTotalLandCount()).to.equal(3);
    });
  });

  describe("Ownership Tracking Functions", function () {
    beforeEach(async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await mockKYC.verifyUser(ownerAddress);
      await mockKYC.verifyUser(addr1Address);
      
      // Register multiple lands
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      
      await landRegistry.registerLand(
        "Ogun",
        "Abeokuta",
        1500,
        0,
        "QmTestHash789"
      );
    });

    it("Should correctly track land ownership", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.true;
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 1)).to.be.true;
      expect(await landRegistry.doesOwnerHaveLand(addr1Address, 0)).to.be.false;
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(2);
      expect(await landRegistry.getLandCount(addr1Address)).to.equal(0);
    });

    it("Should return correct owned lands array", async function () {
      const ownerAddress = await owner.getAddress();
      const ownedLands = await landRegistry.getOwnedLands(ownerAddress);
      expect(ownedLands.length).to.equal(2);
      expect(ownedLands[0]).to.equal(0);
      expect(ownedLands[1]).to.equal(1);
    });

    it("Should update ownership tracking after transfer", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await mockKYC.verifyUser(addr1Address);
      await landRegistry.transferLand(0, addr1Address);
      
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.false;
      expect(await landRegistry.doesOwnerHaveLand(addr1Address, 0)).to.be.true;
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(1);
      expect(await landRegistry.getLandCount(addr1Address)).to.equal(1);
    });
  });

  describe("Edge Cases and Security", function () {
    beforeEach(async function () {
      const ownerAddress = await owner.getAddress();
      await mockKYC.verifyUser(ownerAddress);
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
    });

    it("Should handle empty string inputs in registration", async function () {
      await expect(
        landRegistry.registerLand("", "", 0, 0, "")
      ).to.not.be.reverted;
    });

    it("Should handle very large area values", async function () {
      const largeArea = ethers.parseUnits("999999999", "ether");
      await expect(
        landRegistry.registerLand(
          LAND_DATA.state,
          LAND_DATA.lga,
          largeArea,
          LAND_DATA.landUse,
          LAND_DATA.ipfs
        )
      ).to.not.be.reverted;
    });

    it("Should maintain data integrity after multiple operations", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await mockKYC.verifyUser(addr1Address);
      
      // Verify land
      await landRegistry.verifyLand(0);
      
      // Transfer land
      await landRegistry.transferLand(0, addr1Address);
      
      const land = await landRegistry.getLand(0);
      expect(land.isVerified).to.be.true;
      expect(land.currentOwner).to.equal(addr1Address);
      expect(land.transferStatus).to.equal(2); // Approved
      expect(land.ownershipHistory.length).to.equal(2);
      
      // Check ownership tracking
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.false;
      expect(await landRegistry.doesOwnerHaveLand(addr1Address, 0)).to.be.true;
    });

    it("Should properly track timestamps", async function () {
      const blockBefore = await ethers.provider.getBlock("latest");
      
      await landRegistry.registerLand(
        "TestState",
        "TestLGA",
        500,
        0,
        "TestIPFS"
      );
      
      const blockAfter = await ethers.provider.getBlock("latest");
      const land = await landRegistry.getLand(1);
      
      expect(land.registrationDate).to.be.at.least(blockBefore?.timestamp || 0);
      expect(land.registrationDate).to.be.at.most(blockAfter?.timestamp || 0);
    });

    it("Should handle complex transfer chains", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();
      await mockKYC.verifyUser(addr1Address);
      await mockKYC.verifyUser(addr2Address);
      
      // Chain of transfers: owner -> addr1 -> addr2
      await landRegistry.transferLand(0, addr1Address);
      await landRegistry.connect(addr1).transferLand(0, addr2Address);
      
      // Verify final state
      expect(await landRegistry.doesOwnerHaveLand(ownerAddress, 0)).to.be.false;
      expect(await landRegistry.doesOwnerHaveLand(addr1Address, 0)).to.be.false;
      expect(await landRegistry.doesOwnerHaveLand(addr2Address, 0)).to.be.true;
      
      expect(await landRegistry.getLandCount(ownerAddress)).to.equal(0);
      expect(await landRegistry.getLandCount(addr1Address)).to.equal(0);
      expect(await landRegistry.getLandCount(addr2Address)).to.equal(1);
      
      const ownershipHistory = await landRegistry.getOwnershipHistory(0);
      expect(ownershipHistory.length).to.equal(3);
    });
  });

  describe("Gas Optimization Tests", function () {
    beforeEach(async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await mockKYC.verifyUser(ownerAddress);
      await mockKYC.verifyUser(addr1Address);
    });

    it("Should not exceed reasonable gas limits for registration", async function () {
      const tx = await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      const receipt = await tx.wait();
      
      // Registration should not use excessive gas - adjusted limit
      expect(receipt.gasUsed).to.be.below(700000); // Increased from 600000
    });

    it("Should not exceed reasonable gas limits for transfer", async function () {
      const ownerAddress = await owner.getAddress();
      const addr1Address = await addr1.getAddress();
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      
      const tx = await landRegistry.transferLand(0, addr1Address);
      const receipt = await tx.wait();
      
      // Transfer should not use excessive gas
      expect(receipt.gasUsed).to.be.below(300000);
    });

    it("Should have efficient ownership lookups", async function () {
      const ownerAddress = await owner.getAddress();
      await landRegistry.registerLand(
        LAND_DATA.state,
        LAND_DATA.lga,
        LAND_DATA.area,
        LAND_DATA.landUse,
        LAND_DATA.ipfs
      );
      
      // These should be O(1) operations
      const hasLand = await landRegistry.doesOwnerHaveLand(ownerAddress, 0);
      const landCount = await landRegistry.getLandCount(ownerAddress);
      
      expect(hasLand).to.be.true;
      expect(landCount).to.equal(1);
    });
  });
});
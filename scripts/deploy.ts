import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying KYC Contract...");
  
  const KYCContract = await ethers.getContractFactory("LandRegistryKYC");
  const kycContract = await KYCContract.deploy();
  
  await kycContract.waitForDeployment();
  const contractAddress = await kycContract.getAddress();
  
  console.log("KYC Contract deployed to:", contractAddress);
  
  // Save contract address and ABI for frontend
  const contractInfo = {
    address: contractAddress,
    abi: JSON.parse(kycContract.interface.formatJson()),
  };
  
  const frontendDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendDir, "LandRegistryKYC.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("Contract info saved to frontend/src/contracts/LandRegistryKYC.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
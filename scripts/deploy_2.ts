import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  console.log("Deploying Land Registry Contract...");
  
  const LandRegistryContract = await ethers.getContractFactory("LandRegistry");
  const kycAddress = process.env.KYC_ADDRESS;
  if (!kycAddress) {
    throw new Error("KYC_ADDRESS environment variable is not set");
  }
  console.log(kycAddress)
  const landRegistryContract = await LandRegistryContract.deploy(kycAddress);
  
  await landRegistryContract.waitForDeployment();
  const contractAddress = await landRegistryContract.getAddress();
  
  console.log("Land Registry Contract deployed to:", contractAddress);
  
  // Save contract address and ABI for frontend
  const contractInfo = {
    address: contractAddress,
    abi: JSON.parse(landRegistryContract.interface.formatJson()),
  };
  
  const frontendDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendDir, "LandRegistry.json"),
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("Contract info saved to frontend/src/contracts/LandRegistry.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
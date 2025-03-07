const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the initial supply from environment variable or use default
  const initialSupply = process.env.INITIAL_SUPPLY 
    ? ethers.parseEther(process.env.INITIAL_SUPPLY)
    : ethers.parseEther("1000000"); // Default: 1 million tokens

  // Deploy the contract
  const Gryphon = await hre.ethers.getContractFactory("Gryphon");
  const gryphon = await Gryphon.deploy(initialSupply);
  await gryphon.waitForDeployment();

  const address = await gryphon.getAddress();
  console.log("Gryphon deployed to:", address);

  // Wait for a few block confirmations to ensure the deployment is confirmed
  console.log("Waiting for block confirmations...");
  await gryphon.deploymentTransaction().wait(5);
  console.log("Confirmed!");

  // Verify the contract
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [initialSupply],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Error verifying contract:", error);
  }

  // Log deployment information
  console.log("\nDeployment Information:");
  console.log("----------------------");
  console.log("Contract Address:", address);
  console.log("Initial Supply:", ethers.formatEther(initialSupply), "GRYPHON");
  console.log("Max Supply:", ethers.formatEther(await gryphon.MAX_SUPPLY()), "GRYPHON");
  console.log("Owner:", await gryphon.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
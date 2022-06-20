import { writeFile, writeFileSync } from "fs";

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const WalletInvest = await ethers.getContractFactory("WalletInvest");
  const walletDeploy = await upgrades.upgradeProxy(
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    WalletInvest
  );

  await walletDeploy.deployed();

  console.log("succes Upgraded to :", walletDeploy.address);
  const data = `export const WALLET_INVEST_ADDRESS = "${walletDeploy.address}";`;
  writeFile("contractAddress.ts", data, function (err) {
    if (err) throw err;
    console.log("File saved!");
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

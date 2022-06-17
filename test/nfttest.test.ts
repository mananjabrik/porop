import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BinanceUSD, NFTtest } from "../typechain-types";

const { ethers } = require("hardhat");

let ndfInvest: NFTtest = null as any;
let busd: BinanceUSD = null as any;
let accounts: SignerWithAddress[] = [];

const initiateAccounts = async () => {
  const accounts = await ethers.getSigners();
  return accounts;
};

describe("nft investment v2", () => {
  before(async () => {
    accounts = await initiateAccounts();
    const BusdToken = await ethers.getContractFactory("BinanceUSD");
    busd = await BusdToken.deploy();
    await busd.deployed();

    const NFTtest = await ethers.getContractFactory("NFTtest");
    ndfInvest = await NFTtest.deploy();
    await ndfInvest.deployed();

    expect(ndfInvest.address).to.be.a("string");
  });

  it("should deploy BUSD and NFTInvest", async () => {
    expect(busd.address).to.be.a("string");
    expect(ndfInvest.address).to.be.a("string");
  });
  it("nftInvset should have owner", async () => {
    const account = accounts[0];
    const owner = await ndfInvest.owner();
    expect(owner).to.equal(account.address);
    expect(owner).to.be.a("string");
  });
  it("should have 20000000 balance of BUSD", async () => {
    const owner = accounts[0];
    const balance = await busd.balanceOf(owner.address);
    expect(balance.toString()).to.equal("20000000");
  });
  it("should Listing NFT on NFTinvest", async () => {
    const owner = accounts[0];
    // const marketCreated = await ndfInvest
    //   .connect(owner)
    //   .createMarketByCategory(1, "halobosku");
    // await ndfInvest.connect(owner).createMarketByCategory(1, "halobosku2");
    const promise = new Array(12).fill(null).map(async (_, i) => {
      const tx = new Array(100).fill(null).map(async (_, j) => {
        const bigLIsting = await ndfInvest
          .connect(owner)
          .createMarketByCategory(1, `inihashnya##category${i}itemNumber${j}`);
        const receipt = await bigLIsting.wait();
        return receipt;
      });
      return tx;
    });

    const receipts = await Promise.all(promise);
    const tx = await receipts.every((receipt) => {
      return receipt;
    });
    expect(tx).to.eq(true);
  });
  it("shoult store NFT", async () => {
    const owner = accounts[0];
    const items = await ndfInvest.connect(owner).getItemsByCategory(1);
    console.log(items);
  });
  //   it("should have balance of buyyer to buy NFT", async () => {
  //     const owner = accounts[0];
  //     const user = accounts[1];
  //     const transerReceipt = await busd
  //       .connect(owner)
  //       .transfer(user.address, 50000);
  //     const tx = await transerReceipt.wait();
  //     const userBalance = await busd.connect(user).balanceOf(user.address);
  //     expect(tx.status).to.equal(1);
  //     expect(userBalance.toString()).to.equal("50000");
  //   });

  //   it("sould buy nft by randomcategory", async () => {
  //     const buyyer = accounts[1];
  //     const buyingNft = await ndfInvest
  //       .connect(buyyer)
  //       .buyItemByCategory(1, busd.address);
  //     const receipt = await buyingNft.wait();
  //     const tokenId = await ndfInvest.connect(buyyer).tokenByIndex(0);
  //     const uri = await ndfInvest.connect(buyyer).tokenURI(tokenId);
  //     console.log(uri);
  //     console.log(tokenId);
  //     expect(receipt.status).to.eq(1);
  //   });
});

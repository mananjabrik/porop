import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { NFTInvest, BinanceUSD } from "../typechain-types";
const cliProgress = require("cli-progress");
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const { ethers, upgrades } = require("hardhat");

let ndfInvest: NFTInvest = null as any;
let busd: BinanceUSD = null as any;
let accounts: SignerWithAddress[] = [];

const initiateAccounts = async () => {
  const accounts = await ethers.getSigners();
  return accounts;
};

describe("nft investment", () => {
  before(async () => {
    accounts = await initiateAccounts();

    const BUSDTOKEN = await ethers.getContractFactory("BinanceUSD");
    busd = await BUSDTOKEN.deploy();
    await busd.deployed();

    const NFTInvest = await ethers.getContractFactory("NFTInvest");
    ndfInvest = (await upgrades.deployProxy(NFTInvest, [
      busd.address,
    ])) as NFTInvest;
    await ndfInvest.deployed();
    expect(ndfInvest.address).to.be.a("string");
  });

  it("should deploy BUSD and NFTInvest", async () => {
    expect(busd.address).to.be.a("string");
    expect(ndfInvest.address).to.be.a("string");
  });
  it("nftInvset should have owner", async () => {
    const owner = await ndfInvest.owner();
    expect(owner).to.be.a("string");
  });
  it("should have 20000000 balance of BUSD", async () => {
    const owner = accounts[0];
    const balance = await busd.balanceOf(owner.address);
    expect(balance.toString()).to.equal("20000000");
  });
  it("should transfer BUSD to nftInvset", async () => {
    const owner = accounts[0];
    const amount = 10000000;
    const receipt = await busd
      .connect(owner)
      .transfer(ndfInvest.address, amount);
    const tx = await receipt.wait();
    expect(tx.status).to.equal(1);
  });
  it("should have 10000000 balance of BUSD", async () => {
    const owner = accounts[0];
    const balance = await busd.balanceOf(owner.address);
    expect(balance.toString()).to.equal("10000000");
  });
  it("should have 10000000 balance of nftInvset", async () => {
    const nftaddress = ndfInvest.address;
    const owner = accounts[0];
    const balance = await busd.connect(owner).balanceOf(nftaddress);
    expect(balance.toString()).to.equal("10000000");
  });
  it("should set nftInvest years Reward to 2500000", async () => {
    const owner = accounts[0];
    const years = 2500000;
    const receipt = await ndfInvest.connect(owner).setYearsReward(years);
    const tx = await receipt.wait();
    expect(tx.status).to.equal(1);
  });
  it("should have 2500000 yearsReward", async () => {
    const owner = accounts[0];
    const years = await ndfInvest.connect(owner).getYearsReward();
    expect(years.toString()).to.equal("2500000");
  });
  // user wanna buy NFT, so he/she sould have enough BUSD
  it("should have 1200 balance of BUSD", async () => {
    const owner = accounts[0];
    const user = accounts[1];
    const transerReceipt = await busd
      .connect(owner)
      .transfer(user.address, 50000);
    const tx = await transerReceipt.wait();
    const userBalance = await busd.connect(user).balanceOf(user.address);
    expect(tx.status).to.equal(1);
    expect(userBalance.toString()).to.equal("50000");
  });
  // user increase allowance of nftInvset
  it("should increase nftInvest balance to 1200", async () => {
    const user = accounts[1];
    const nftaddress = ndfInvest.address;
    const increaseReceipt = await busd
      .connect(user)
      .increaseAllowance(nftaddress, 5000);
    const tx = await increaseReceipt.wait();
    expect(tx.status).to.equal(1);
  });
  // owner listing NFT on Market
  it("should listing NFT on Market", async () => {
    const owner = accounts[0];
    // const listing = await ndfInvest
    //   .connect(owner)
    //   .createMarketItem(1, 1000, "haloboksu");
    // const myBalance = await busd.connect(owner).balanceOf(owner.address);

    bar1.start(1200, 0);

    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 100; j++) {
        await ndfInvest
          .connect(owner)
          .createMarketItem(
            i + 1,
            1000,
            `haloboksu category Category${i} itemId${j}`
          );
        bar1.increment();
      }
    }

    // await ndfInvest.connect(owner).createMarketItem(1, 1000, "haloboksu4");
    // await ndfInvest.connect(owner).createMarketItem(1, 1000, "haloboksu5");
    // await ndfInvest.connect(owner).createMarketItem(2, 1000, "haloboksu6");
    // await ndfInvest.connect(owner).createMarketItem(2, 1000, "haloboksu89");

    // const tx = await listing.wait();
    // expect(tx.status).to.equal(1);
  }).timeout(50000000000);

  // user want to buy NFT
  it("should buy NFT", async () => {
    const user = accounts[1];
    const buyReceipt = await ndfInvest.connect(user).buyRandomByCategory(2);
    await ndfInvest.connect(user).buyRandomByCategory(1);
    await ndfInvest.connect(user).buyRandomByCategory(1);

    const tx = await buyReceipt.wait();
    expect(tx.status).to.equal(1);
  });
  it("should have NFT Uri", async () => {
    const user = accounts[1];

    const tokenId = await ndfInvest
      .connect(user)
      .tokenOfOwnerByIndex(user.address, 0);
    const tokenId2 = await ndfInvest
      .connect(user)
      .tokenOfOwnerByIndex(user.address, 1);
    const tokenId3 = await ndfInvest
      .connect(user)
      .tokenOfOwnerByIndex(user.address, 2);

    const uri = await ndfInvest.connect(user).tokenURI(tokenId);
    const uri2 = await ndfInvest.connect(user).tokenURI(tokenId2);
    const uri3 = await ndfInvest.connect(user).tokenURI(tokenId3);

    console.log({ uri, uri2, uri3 });
    expect(uri).to.be.a("string");
  });
});

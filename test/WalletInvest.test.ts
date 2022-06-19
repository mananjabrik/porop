import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { WalletInvest, Currency } from "../typechain-types";

let walletInvest: WalletInvest = null as any;
let curency1: Currency = null as any;
let curency2: Currency = null as any;

let accounts: SignerWithAddress[] = [];

describe("first", () => {
  before(async () => {
    const Acounts: SignerWithAddress[] = await ethers.getSigners();
    accounts = Acounts;

    const WalletInvest = await ethers.getContractFactory("WalletInvest");
    const walletDeploy = await WalletInvest.deploy();
    //@ts-ignore
    walletInvest = await walletDeploy.deployed();

    const Curency1 = await ethers.getContractFactory("Currency");
    const curency1Deploy = await Curency1.deploy();
    //@ts-ignore
    curency1 = await curency1Deploy.deployed();

    const Curency2 = await ethers.getContractFactory("Currency");
    const curency2Deploy = await Curency2.deploy();
    //@ts-ignore
    curency2 = await curency2Deploy.deployed();
  });

  it("should have owner", async () => {
    const owner = await walletInvest.owner();
  });

  it("User 1 and User 2 Have Balance 10000", async () => {
    //user 1
    await curency1.connect(accounts[0]).transfer(accounts[1].address, 10000);
    await curency2.connect(accounts[0]).transfer(accounts[1].address, 10000);
    //user 2
    await curency1.connect(accounts[0]).transfer(accounts[2].address, 10000);
    await curency2.connect(accounts[0]).transfer(accounts[2].address, 10000);
  });

  it("user 1 approve allowance", async () => {
    const user1 = accounts[1];
    const approveToken1 = await curency1
      .connect(user1)
      .approve(walletInvest.address, 3200);
    const approveToken2 = await curency2
      .connect(user1)
      .approve(walletInvest.address, 3200);

    const tx1 = await approveToken1.wait();
    const tx2 = await approveToken2.wait();

    expect(tx1.status).to.eq(1);
    expect(tx2.status).to.eq(1);
  });

  it("user 2 approve allowance", async () => {
    const user1 = accounts[2];
    const approveToken1 = await curency1
      .connect(user1)
      .approve(walletInvest.address, 3200);
    const approveToken2 = await curency2
      .connect(user1)
      .approve(walletInvest.address, 3200);

    const tx1 = await approveToken1.wait();
    const tx2 = await approveToken2.wait();

    expect(tx1.status).to.eq(1);
    expect(tx2.status).to.eq(1);
  });

  it("user antri jual", async () => {
    const user = accounts[1];
    const tokenAddress = curency1.address; // user memiliki token ini
    const tokenAddress2 = curency2.address; // user ingin token ini
    const jual = await walletInvest.connect(user).selMyTokenWith(
      tokenAddress, // token yang ingin dijual
      tokenAddress2, // token yang akan diterima
      1, // jumlah token yang ingin dijual
      2 // jumlah token yang akan diterima
    );
    const tx = await jual.wait();
    expect(tx.status).to.eq(1);
  });

  it("check Balance on Contract", async () => {
    const user = accounts[1];
    const tokenAddress = curency1.address; // user memiliki token ini
    const tokenAddress2 = curency2.address; // user ingin token ini
    const balance = await walletInvest
      .connect(user)
      .getTotalInvestByToken(tokenAddress);
    console.log("value:", balance);
  });

  it("user beli langsung token", async () => {
    const user = accounts[2];
    const tokenAddress = curency1.address; // user memiliki token ini
    // const tokenAddress2 = curency2.address; // user ingin token ini
    const tokenAddressToId = await walletInvest
      .connect(user)
      .getAddressTokenId(tokenAddress);

    const userBuy = await walletInvest
      .connect(user)
      .swapToken(tokenAddressToId, 1);

    const tx = await userBuy.wait();
    expect(tx.status).to.eq(1);
  });

  it("balance contract from token1 mustbe 0", async () => {
    const user = accounts[1];
    const tokenAddress = curency1.address; // user memiliki token ini
    const balance = await walletInvest
      .connect(user)
      .getTotalInvestByToken(tokenAddress);
    console.log("value:", balance);
  });
});

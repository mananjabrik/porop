import { expect } from "chai";
import { ethers } from "hardhat";
import { PoropAja, Currency } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let curency1: Currency = null as any;
let porop: PoropAja = null as any;
let accounts: SignerWithAddress[] = [];
// const initiateAccounts = async () => {
//   const accounts = await ethers.getSigners();
//   return accounts;
// };

describe("Porop Contract Testing", function () {
  before(async () => {
    // await initiateAccounts();
    const akun: SignerWithAddress[] = await ethers.getSigners();
    accounts = akun;
    const Curency1 = await ethers.getContractFactory("Currency");
    //@ts-ignore
    curency1 = await Curency1.deploy();

    const POROP = await ethers.getContractFactory("PoropAja");
    const test = await POROP.deploy([]);
    // @ts-ignore
    porop = await test.deployed();
    console.log(test.address);
  });
  it("shoul have owner", async () => {
    const owner = await porop.owner();
    console.log(owner);
  });

  it("User register", async () => {
    // const accounts: SignerWithAddress[] = await ethers.getSigners();
    const user = accounts[1];
    const tokenAddress = curency1.address;
    const register = await porop.connect(user).registerWallet(tokenAddress);
    const tx = await register.wait();
    expect(tx.status).to.eq(1);
  });

  it("Top Up Wallet", async () => {
    // const accounts: SignerWithAddress[] = await ethers.getSigners();
    const user = accounts[1];
    curency1.connect(accounts[0]).transfer(user.address, 1200);
    const tokenAddress = curency1.address;
    await curency1.connect(user).approve(porop.address, 1200);
    const register = await porop.connect(user).topupWallet(tokenAddress, 1000);
    const tx = await register.wait();
    expect(tx.status).to.eq(1);

    //balance user 2 must be 1000
    const balance = await porop.connect(user).getMyWalletBalance(tokenAddress);
    console.log("user 1 balance", balance);
  });

  it("new User Register", async () => {
    const user = accounts[2];
    const tokenAddress = curency1.address;
    const register = await porop.connect(user).registerWallet(tokenAddress);
    const tx = await register.wait();
    expect(tx.status).to.eq(1);
    // user topup wallet
    await curency1.connect(accounts[0]).transfer(user.address, 1200);
    await curency1.connect(user).approve(porop.address, 1200);
    const topup = await porop.connect(user).topupWallet(tokenAddress, 1200);
    const tx2 = await topup.wait();
    expect(tx2.status).to.eq(1);
    //balance user 2 must be 1000
    const balance = await porop.connect(user).getMyWalletBalance(tokenAddress);
    console.log("user 2 balance", balance);
  });

  it("checking global balance from user invested", async () => {
    const globalWallet = await porop
      .connect(accounts[0])
      .getGlobalWalletBalance(curency1.address);

    console.log("global balance", globalWallet);
    expect(globalWallet).to.eq(2000);
  });
});

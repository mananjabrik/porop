import { expect } from "chai";
import { ethers } from "hardhat";
import { PoropAja, Currency } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let curency1: Currency = null as any;
let porop: PoropAja = null as any;
const accounts: SignerWithAddress[] = [];
const initiateAccounts = async () => {
  const accounts = await ethers.getSigners();
  return accounts;
};

describe("Porop Contract Testing", function () {
  before(async () => {
    await initiateAccounts();
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
    const user = accounts[1];
    const tokenAddress = curency1.address;
    const register = await porop.connect(user).registerWallet(tokenAddress);
    const tx = await register.wait();

    expect(tx.status).to.eq(1);
  });
});

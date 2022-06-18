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
    await curency1.connect(accounts[0]).transfer(accounts[1].address, 3200);
    await curency1.connect(accounts[0]).transfer(accounts[2].address, 3200);
    await curency2.connect(accounts[0]).transfer(accounts[1].address, 3200);

    console.log(owner);
  });
  it("shoul create wallet for new user", async () => {
    const user = accounts[1];
    const tokenAddress = curency1.address;
    const tokenAddress2 = curency2.address;

    await curency1.connect(user).approve(walletInvest.address, 3200);
    await curency2.connect(user).approve(walletInvest.address, 3200);
    await curency1.connect(accounts[2]).approve(walletInvest.address, 3200);

    walletInvest.connect(user).investToken(tokenAddress, 1000);
    await walletInvest.connect(user).investToken(tokenAddress2, 1000);
    await walletInvest.connect(user).investToken(tokenAddress, 1000);
    await walletInvest.connect(accounts[2]).investToken(tokenAddress, 1000);

    const balance = await walletInvest
      .connect(user)
      .getTotalInvestByToken(curency2.address);

    console.log("balance on state address", balance);
    // expect(tx.status).to.eq(1);
  });
});

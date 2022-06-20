import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import { WalletInvest, Currency } from "../typechain-types";

let walletInvest: WalletInvest = null as any;
let curency1: Currency = null as any;
let curency2: Currency = null as any;

let accounts: SignerWithAddress[] = [];

describe("test wallet invest", () => {
  before(async () => {
    const Acounts: SignerWithAddress[] = await ethers.getSigners();
    accounts = Acounts;

    const WalletInvest = await ethers.getContractFactory("WalletInvest");
    const walletDeploy = await upgrades.deployProxy(WalletInvest);
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
    expect(owner).to.equal(accounts[0].address);
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
      1000, // jumlah token yang ingin dijual
      2 // jumlah token yang akan diterima
    );
    const tx = await jual.wait();
    expect(tx.status).to.eq(1);
  });

  it("user antri Beli", async () => {
    const user = accounts[2];
    const tokenAddress2 = curency2.address; // user memiliki token ini
    const tokenAddress = curency1.address; // user ingin token ini
    const beli = await walletInvest.connect(user).selMyTokenWith(
      tokenAddress2, // token yang ingin dijual
      tokenAddress, // token yang akan diterima
      2, // jumlah token yang ingin dijual
      2 // jumlah token yang akan diterima
    );
    const tx = await beli.wait();
    expect(tx.status).to.eq(1);
  });

  it("check Balance on Contract mustbe 1000", async () => {
    const user = accounts[1];
    const tokenAddress = curency1.address;
    const balance = await walletInvest
      .connect(user)
      .getTotalInvestByToken(tokenAddress);
    expect(balance.toNumber()).to.eq(1000);
  });

  it("user beli 100 token1 dengan token 2", async () => {
    const user = accounts[2];
    const tokenAddress = curency1.address; // user memiliki token ini

    const balanceBefore = await curency1.connect(user).balanceOf(user.address);
    const getTotalMarket = await walletInvest.getTotalMarket();

    const getId = async (total: BigNumber) => {
      let id = 0;
      for (let i = 0; i < getTotalMarket.toNumber(); i++) {
        const findTokenId = await walletInvest
          .connect(user)
          .getListTokenById(0);
        if (findTokenId.tokenForBuy === tokenAddress) {
          id = findTokenId.itemId.toNumber();
          break;
        }
      }
      return id;
    };

    const id = await getId(getTotalMarket);

    const userBuy = await walletInvest.connect(user).swapToken(id, 100);
    const tx = await userBuy.wait();

    const balanceAfter = await curency1.connect(user).balanceOf(user.address);

    expect(tx.status).to.eq(1);
    expect(balanceAfter.toNumber()).to.eq(balanceBefore.toNumber() + 100);
  });

  it("balance contract from token1 mustbe 900", async () => {
    const user = accounts[1];
    const tokenAddress = curency1.address; // user memiliki token ini
    const balance = await walletInvest
      .connect(user)
      .getTotalInvestByToken(tokenAddress);
    expect(balance.toNumber()).to.eq(900);
  });

  it("user 1 must have token2 address 200", async () => {
    const user = accounts[1];
    const balance = await curency2.connect(user).balanceOf(user.address);
    expect(balance.toNumber()).to.eq(10200);
  });

  it("User get all available token", async () => {
    const user = accounts[1];
    const getTotalMarket = await walletInvest.getTotalMarket();

    const getListToken = async () => {
      let listToken = [];
      for (let i = 0; i < getTotalMarket.toNumber(); i++) {
        const findToken = await walletInvest.connect(user).getListTokenById(i);
        listToken.push(findToken);
      }
      return listToken;
    };

    const listToken = await getListToken();

    expect(listToken.length).to.eq(2);
  });
});

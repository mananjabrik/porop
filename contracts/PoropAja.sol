// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//token to id
struct Token {
  uint256 id; // id of the token
  uint256 balance; // balance of the token
  address contractToken; // contract token of the token
}

// global wallet
struct GlobalWallet {
  Token token;
  address owner;
}

// msg.sender save wallet id
struct User {
  uint256 indexPoint;
}

// id to wallet
struct Wallet {
  Token token; // token of the wallet
  bool isRegistered; // is the wallet registered
  address owner; // owner of the wallet
}

// exchange market
struct MarketToken {
  uint256 id; // id
  uint256 price; // harga perbiji
  uint256 total; // total token yg di jual
  address tokenContract; // token contract address yg di tawarkan
  address tokenExchange; // token exchange address yg di inginkan
  address seller; // perjual
  address owner; // pemilik token
}

contract PoropAja {
  using Counters for Counters.Counter;

  address public owner;

  Counters.Counter private _bid;
  Counters.Counter private _ask;
  Counters.Counter private _wallet;
  Counters.Counter private _globalWallet;

  mapping(uint256 => MarketToken) private _idMarketTokens; // user create ask, or bid
  mapping(uint256 => Wallet) private _idWallets; // wallet user
  mapping(address => Wallet) private _addresToBlance; //wallet address to balance
  mapping(uint256 => GlobalWallet) private _globalWallets; // wallet global
  mapping(address => Token) private _idTokens; // this to get balance global
  mapping(address => User) private _idUsers; // this to get balance global

  event Bid(
    uint256 id,
    uint256 price,
    uint256 amount,
    address seller,
    address owner
  );
  event Ask(
    uint256 id,
    uint256 price,
    uint256 amount,
    address seller,
    address owner
  );

  constructor() {
    owner = msg.sender;
  }

  // register wallet
  function registerWallet(address _tokenContract) public payable {
    uint256 id = _wallet.current();
    uint256 idGlobal = _globalWallet.current();

    //create user
    _idUsers[msg.sender].indexPoint = id;

    // create User wallet
    _idWallets[id].isRegistered = true;
    _idWallets[id].token.id = id;
    _idWallets[id].token.balance = 0;
    _idWallets[id].token.contractToken = _tokenContract;
    _idWallets[id].owner = msg.sender;
    _wallet.increment();

    // wallet balance
    _addresToBlance[_tokenContract] = _idWallets[id];
    _addresToBlance[_tokenContract].token.balance = 0;
    _addresToBlance[_tokenContract].token.contractToken = _tokenContract;
    _addresToBlance[_tokenContract].owner = msg.sender;

    // create Global wallet wallet
    _globalWallets[idGlobal].token.id = id;
    _globalWallets[idGlobal].token.balance = 0;
    _globalWallets[idGlobal].token.contractToken = _tokenContract;
    _globalWallets[idGlobal].owner = address(this);
    _globalWallet.increment();

    // global wallet invest
    _idTokens[_tokenContract] = Token({
      id: idGlobal,
      balance: 0,
      contractToken: _tokenContract
    });
  }

  // topup wallet
  function topupWallet(address _tokenContract, uint256 _amount) public {
    uint256 id = _addresToBlance[_tokenContract].token.id;
    uint256 idGlobal = _idTokens[_tokenContract].id;
    ERC20 token = ERC20(_tokenContract);

    token.transferFrom(msg.sender, address(this), _amount);
    // topup wallet
    _idWallets[id].token.balance += _amount;
    _idTokens[_tokenContract].balance += _amount;

    // update global wallet
    _globalWallets[idGlobal].token.balance += _amount;

    // global wallet invest
    _idTokens[_tokenContract].balance += _amount;
  }

  // get global wallet balance
  function getGlobalWalletBalance(address _tokenContract)
    public
    view
    returns (uint256)
  {
    uint256 id = _idTokens[_tokenContract].id;
    return _globalWallets[id].token.balance;
  }

  // get my wallet balance
  function getMyWalletBalance(address _tokenContract)
    public
    view
    returns (uint256)
  {
    uint256 id = _addresToBlance[_tokenContract].token.id;
    return _idWallets[id].token.balance;
  }
}

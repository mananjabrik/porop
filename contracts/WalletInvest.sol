// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// creat spesification about apps
struct WalletUser {
  uint256 id;
  address owner;
  address token;
  uint256 balance;
}

struct MarketItem {
  uint256 itemId;
  uint256 price;
  uint256 stock;
  address tokenForSale;
  address tokenForBuy;
  address owner;
}

contract WalletInvest {
  using Counters for Counters.Counter;

  Counters.Counter private walletId;
  Counters.Counter private globalWalletId;
  Counters.Counter private antriJualId;
  Counters.Counter private antriBeliId;

  address public owner; // owner

  mapping(uint256 => WalletUser) public idToWallets; // wallet user

  mapping(uint256 => MarketItem) public idToMarketItems; // antri Jual

  event UserInvestToken(
    address indexed sender,
    uint256 indexed id,
    address indexed token,
    uint256 balance
  );

  constructor() {
    owner = msg.sender;
  }

  function investToken(address _token, uint256 _amoun) public payable {
    require(_token != address(0), "token is not valid");

    //transfer token to this contract
    ERC20 token = ERC20(_token);
    require(token.balanceOf(msg.sender) >= _amoun, "balance is not enough");
    token.transferFrom(msg.sender, address(this), _amoun);

    //create wallet
    uint256 id = walletId.current();
    walletId.increment();
    idToWallets[id] = WalletUser(id, msg.sender, _token, _amoun);

    emit UserInvestToken(msg.sender, id, _token, _amoun);
  }

  function getTotalInvestByToken(address _token) public view returns (uint256) {
    ERC20 token = ERC20(_token);
    uint256 total = token.balanceOf(address(this));
    return total;
  }

  function swapToken(uint256 _id, uint256 _amount) public payable {
    // thist contract transfer token to user
    MarketItem storage marketWallet = idToMarketItems[_id];
    ERC20 tokenGet = ERC20(marketWallet.tokenForSale);
    require(marketWallet.stock >= _amount, "contract invest is not enough");
    tokenGet.transfer(msg.sender, _amount);

    //user transfer token to this contract
    ERC20 swap = ERC20(marketWallet.tokenForBuy);
    uint256 pricePerToken = marketWallet.price * _amount;
    require(
      swap.balanceOf(msg.sender) >= pricePerToken,
      "balance user is not enough"
    );
    swap.transferFrom(msg.sender, address(this), pricePerToken);

    //update Stock
    uint256 currentStock = marketWallet.stock;
    marketWallet.stock = currentStock - _amount;
  }

  function getAddressTokenId(address _token) public view returns (uint256) {
    uint256 id = 0;
    for (uint256 i = 0; i < antriJualId.current(); i++) {
      if (idToWallets[i].token == _token) {
        id = idToWallets[i].id;
        break;
      }
    }
    return id;
  }

  function selMyTokenWith(
    address _tokenForSell,
    address _tokenForBuy,
    uint256 _stock,
    uint256 _price
  ) public {
    require(_tokenForSell != address(0), "token is not valid");
    require(_stock > 0, "stok is not valid");

    //seller mustbe transfer tokenSell to contract
    ERC20 token = ERC20(_tokenForSell);
    token.transferFrom(msg.sender, address(this), _stock);

    //create antri jual
    uint256 id = antriJualId.current();
    antriJualId.increment();
    idToMarketItems[id] = MarketItem({
      itemId: id,
      tokenForSale: _tokenForSell,
      tokenForBuy: _tokenForBuy,
      price: _price,
      owner: msg.sender,
      stock: _stock
    });
  }
}

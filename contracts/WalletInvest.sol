// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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
  Counters.Counter private antriJualId;
  address public owner; // owner
  mapping(uint256 => MarketItem) public idToMarketItems; // antri Jual
  event CreateMarket(
    uint256 indexed id,
    uint256 price,
    uint256 stock,
    address tokenForSale,
    address tokenForBuy,
    address owner
  );

  constructor() {
    owner = msg.sender;
  }

  // thist contract transfer token to user
  function _contractTransfer(uint256 _id, uint256 _amount) private {
    MarketItem storage marketWallet = idToMarketItems[_id];
    ERC20 tokenInside = ERC20(marketWallet.tokenForSale);
    require(marketWallet.stock >= _amount, "contract invest is not enough");
    tokenInside.transfer(msg.sender, _amount);
  }

  //user payyer transfer token to owner on market item
  function _payerTransfer(uint256 _id, uint256 _amount) private {
    MarketItem storage marketWallet = idToMarketItems[_id];
    ERC20 swap = ERC20(marketWallet.tokenForBuy);
    uint256 pricePerToken = marketWallet.price * _amount;
    require(
      swap.balanceOf(msg.sender) >= pricePerToken,
      "balance user is not enough"
    );
    swap.transferFrom(msg.sender, marketWallet.owner, pricePerToken);
  }

  function swapToken(uint256 _id, uint256 _amount) public payable {
    _contractTransfer(_id, _amount);
    _payerTransfer(_id, _amount);
    //update Stock
    MarketItem storage marketWallet = idToMarketItems[_id];
    uint256 currentStock = marketWallet.stock;
    marketWallet.stock = currentStock - _amount;
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

  function getTotalInvestByToken(address _token) public view returns (uint256) {
    ERC20 token = ERC20(_token);
    uint256 total = token.balanceOf(address(this));
    return total;
  }

  function getListTokenById(uint256 _id)
    public
    view
    returns (MarketItem memory)
  {
    MarketItem storage marketWallet = idToMarketItems[_id];
    return marketWallet;
  }

  function getTotalMarket() public view returns (uint256) {
    return antriJualId.current();
  }
}

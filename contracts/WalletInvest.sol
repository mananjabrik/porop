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

struct GlobalWallet {
  uint256 id;
  address token;
  uint256 balance;
}

struct TotalInvestByToken {
  uint256 id;
  uint256 total;
  address token;
}

contract WalletInvest {
  using Counters for Counters.Counter;

  Counters.Counter private walletId;
  Counters.Counter private globalWalletId;

  address public owner; // owner

  mapping(uint256 => WalletUser) public idToWallets; // wallet user
  mapping(uint256 => GlobalWallet) public idToGlobalWallets; // wallet global
  mapping(address => TotalInvestByToken) public addressToTotalInvest; // total invest by token

  event UserInvestToken(
    address indexed sender,
    uint256 indexed id,
    address indexed token,
    uint256 balance
  );

  constructor() {
    owner = msg.sender;
  }

  function _tokenInvested(address _token, uint256 _amoun) private {
    uint256 globalId = globalWalletId.current();
    globalWalletId.increment();
    idToGlobalWallets[globalId] = GlobalWallet(globalId, _token, _amoun);

    addressToTotalInvest[_token].id = globalId;
    addressToTotalInvest[_token].total += _amoun;
    addressToTotalInvest[_token].token = _token;
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

    _tokenInvested(_token, _amoun);

    emit UserInvestToken(msg.sender, id, _token, _amoun);
  }

  function getTotalInvestByToken(address _token) public view returns (uint256) {
    return addressToTotalInvest[_token].total;
  }
}

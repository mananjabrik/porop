// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Currency is ERC20 {
  constructor() ERC20("Currency Test", "CRT") {
    _mint(msg.sender, 200000000 * 10**decimals());
  }
}

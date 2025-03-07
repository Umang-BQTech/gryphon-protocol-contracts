// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Gryphon Token
 * @dev Implementation of the Gryphon Token
 */
contract Gryphon is ERC20Capped, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens with 18 decimals

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     * @param initialSupply The initial supply of tokens
     */
    constructor(uint256 initialSupply) 
        ERC20("Gryphon", "GRYPHON") 
        ERC20Capped(MAX_SUPPLY) 
        Ownable(msg.sender)
    {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's allowance.
     * @param account The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}
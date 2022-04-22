//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TestToken is ERC20, Ownable {
    
    // Addres of staking contract to allow reward minting.
    address private _stakingContractAddress;

    constructor (string memory name_, string memory symbol_) 
        ERC20(name_,symbol_){
    }

    // Modifier for allow only staking contract to call certain function.
    modifier onlyStakingContract () {
        require (msg.sender == _stakingContractAddress, "Only staking contract can call" );
        _;
    }

    // Contract owner can change staking contract address.
    function setStakingContract(address stakingContractAddress_) public onlyOwner {
        _stakingContractAddress = stakingContractAddress_;
    }

    // Contract owner can mint tokens for a desired wallet.
    function mintToWallet (address to_, uint amount_) public onlyOwner {
        _mint(to_,amount_);
    }
 
    // Function for reward minting only callable by staking contracts.
    function mintReward (address to_, uint amount_) public onlyStakingContract {
        _mint(to_,amount_);
    }


}
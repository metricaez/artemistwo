//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TestToken is ERC20, Ownable {
    address private _stakingContractAddress;

    constructor (string memory name_, string memory symbol_) 
        ERC20(name_,symbol_){
    }

    modifier onlyStakingContract () {
        require (msg.sender == _stakingContractAddress, "Only staking contract can call" );
        _;
    }

    function setStakingContract(address stakingContractAddress_) public onlyOwner {
        _stakingContractAddress = stakingContractAddress_;
    }

    function mintToWallet (address to_, uint amount_) public onlyOwner {
        _mint(to_,amount_);
    }

    function mintReward (address to_, uint amount_) public onlyStakingContract {
        _mint(to_,amount_);
    }


}
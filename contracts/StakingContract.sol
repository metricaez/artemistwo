//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./ITestToken.sol";

contract StakingContract is ERC20, Ownable {
    
    address private _approvedToken;

    struct StakerData {
        uint stakedAmount;
        uint stakeStart;
    }

    mapping (address => StakerData) private _stakingData;

    constructor(string memory name_, string memory symbol_) 
        ERC20(name_,symbol_){

    }

    modifier isStaked (){
        require(_stakingData[msg.sender].stakedAmount > 0, "No tokens staked");
        _;
    }

    function setApprovedToken(address tokenAddress_) public onlyOwner {
        _approvedToken = tokenAddress_;
    }

    function stakeTokens (uint amount_) public {
        require (IERC20(_approvedToken).balanceOf(msg.sender)>= amount_, 
        "Insufficient amount of tokens");
        _stakingData[msg.sender].stakedAmount += amount_;
        if(_stakingData[msg.sender].stakeStart == 0){
            _stakingData[msg.sender].stakeStart = block.timestamp;
        }
        bool _success = IERC20(_approvedToken).transferFrom(msg.sender, address(this), amount_);
        if(!_success) revert TokenTransferError();
        if (balanceOf(msg.sender) == 0){
            _mint(msg.sender, 1 ether);
        }
        
    }

    function unstakeTokens () public isStaked {
        _burn(msg.sender,1 ether);
        bool _success = IERC20(_approvedToken).transfer(msg.sender, _stakingData[msg.sender].stakedAmount);
        if(!_success) revert TokenTransferError();
        ITestToken(_approvedToken).mintReward(msg.sender,calculateReward(msg.sender));
    }

    function checkBalance () public view isStaked returns (uint) {
        uint _reward = calculateReward(msg.sender);
        uint _userBalance = _stakingData[msg.sender].stakedAmount + _reward;
        return _userBalance;
    }

    function calculateReward (address beneficiary_) public view returns (uint){
        return block.timestamp - _stakingData[beneficiary_].stakeStart;
    }

    error TokenTransferError();

}

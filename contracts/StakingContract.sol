//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Imports for ERC20 based system and basic access control.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./ITestToken.sol";

contract StakingContract is ERC20, Ownable {
    
    // Address of approved token for deposit.
    address private _approvedToken;

    // Struct to arrange users data.
    struct StakerData {
        uint stakedAmount;
        uint stakeStart;
    }

    // Mapping of structs of users data by address key.
    mapping (address => StakerData) private _stakingData;

    constructor(string memory name_, string memory symbol_) 
        ERC20(name_,symbol_){
    }

    // Modifier for checking that function caller has token staked. 
    modifier isStaked (){
        require(_stakingData[msg.sender].stakedAmount > 0, "No tokens staked");
        _;
    }

    // Contract owner is able to update approved token for deposit.
    function setApprovedToken(address tokenAddress_) public onlyOwner {
        _approvedToken = tokenAddress_;
    }

    /* Function for token staking, amount is amount of tokens to be staked.
        * Checks that user has enough balance to stak desired amount.
        * Allowance must be approved before call.
        * Updates data of user in contract. 
        * Updates stakeStart only if user is not already staked.
        * Sendes one staking receipt token if user does not already has one.
    */
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

    /* Withdraw function.
        * Checks that user has tokens staked.
        * Allowance must be approved before call.
        * Burns receipt token.
        * Sends back deposited balance plus generated reward.
    */
    function unstakeTokens () public isStaked {
        _stakingData[msg.sender].stakeStart == 0;
        _burn(msg.sender,1 ether);
        bool _success = IERC20(_approvedToken).transfer(msg.sender, _stakingData[msg.sender].stakedAmount);
        if(!_success) revert TokenTransferError();
        ITestToken(_approvedToken).mintReward(msg.sender,calculateReward(msg.sender));
    }

    /* User balances check.
        * Checks that user has tokens staked.
        * Returns staked balance plus generated reward. 
    */
    function checkBalance () public view isStaked returns (uint) {
        uint _reward = calculateReward(msg.sender);
        uint _userBalance = _stakingData[msg.sender].stakedAmount + _reward;
        return _userBalance;
    }

    /* User reward check.
        * Returns generated reward.
        * This function implements the 1 wei per second staked reward ratio. 
    */
    function calculateReward (address beneficiary_) public view returns (uint){
        return block.timestamp - _stakingData[beneficiary_].stakeStart;
    }

    // Error for double check ERC20 transfers.
    error TokenTransferError();

}

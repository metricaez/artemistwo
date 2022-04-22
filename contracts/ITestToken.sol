// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITestToken {

	// mintReward must be visible from Staking Contract.
	function mintReward(address to_, uint amount_) external;
}
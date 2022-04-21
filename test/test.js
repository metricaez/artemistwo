const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking Basic Testing", function () {

	const initBalance = 10;
	const initBalanceForm = ethers.utils.parseEther(initBalance.toString());
	// Signers
	let owner;
	let addr1;

	const deploy = async () => {
		// Get the ContractFactory and Signers here.
		[owner, addr1] = await ethers.getSigners();
		
    	StakingContract = await hre.ethers.getContractFactory(
			"StakingContract"
		);
		TestToken = await hre.ethers.getContractFactory("TestToken");

		stakingContract = await StakingContract.deploy("Receipt", "RCPT");
		testToken = await TestToken.deploy("Test Toke", "TTKN");
		
		await stakingContract.setApprovedToken(testToken.address);
		await testToken.setStakingContract(stakingContract.address);
		await testToken.mintToWallet(addr1.address, initBalanceForm);
	};

	const convFromEthToWei = (_numberToConvert) => {
		return ethers.utils.parseEther(_numberToConvert.toString());
	};

	const convFromWeiToEth = (_numberToConvert) => {
		return ethers.utils.formatEther(_numberToConvert.toString());
	};

	const testStakeTokens = async (_staker,_amount) => {
		await testToken
		.connect(_staker)
		.approve(stakingContract.address, convFromEthToWei(10));
		await stakingContract.connect(_staker).stakeTokens(convFromEthToWei(_amount));
	}

	const forwardTime = async (_secondsToForward) => {
		await ethers.provider.send("evm_increaseTime", [_secondsToForward]);
		await network.provider.send("evm_mine");
	}

	describe("Staking Contract:  Functions", () => {
		beforeEach(deploy); 

		describe("stakeTokens(uint amount_)", () => {
			it(`Calling stake should deposit send amount`, async () => {
				await testToken
				.connect(addr1)
				.approve(stakingContract.address, convFromEthToWei(10));
				await stakingContract.connect(addr1).stakeTokens(convFromEthToWei(5));
				expect(
					convFromWeiToEth(await stakingContract.balanceOf(addr1.address))
				).to.equal("1.0");
				expect(
					convFromWeiToEth(await testToken.balanceOf(addr1.address))
				).to.equal("5.0");
			});
		});

		describe("checkBalance()", () => {
			it(`Calling check should return current balance`, async () => {
				await testStakeTokens(addr1,5);
				await forwardTime(200);
				console.log("Balance on contract: " + await stakingContract.connect(addr1).checkBalance())
			});
		});

		describe("unstakeTokens()", () => {
			it(`Unstaking should return tokens and burn withdraw receipt token`, async () => {
				await testStakeTokens(addr1,5);
				await stakingContract
				.connect(addr1)
				.approve(stakingContract.address, convFromEthToWei(10));
				await forwardTime(200);
				console.log("Withdrawn balance: " + await testToken.balanceOf(addr1.address));
				console.log("Balance on contract: " + await stakingContract.connect(addr1).checkBalance())
				await stakingContract.connect(addr1).unstakeTokens();
				console.log("Withdrawn balance: " + await testToken.balanceOf(addr1.address));
				expect(
					convFromWeiToEth(await stakingContract.balanceOf(addr1.address))
				).to.equal("0.0");
			});
		});


	})

})
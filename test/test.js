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

		StakingContract = await hre.ethers.getContractFactory("StakingContract");
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

	const testStakeTokens = async (_staker, _amount) => {
		await testToken
			.connect(_staker)
			.approve(stakingContract.address, convFromEthToWei(10));
		await stakingContract
			.connect(_staker)
			.stakeTokens(convFromEthToWei(_amount));
	};

	const forwardTime = async (_secondsToForward) => {
		await ethers.provider.send("evm_increaseTime", [_secondsToForward]);
		await network.provider.send("evm_mine");
	};

	describe("Test Token Contract: Deploy", () => {
		beforeEach(deploy);
		describe("constructor(string memory name_, string memory symbol_)", () => {
			it(`On deploy owner should be set`, async () => {
				expect(await testToken.owner()).to.equal(owner.address);
			});
		});
	});

	describe("Test Token Contract: Functions", () => {
		beforeEach(deploy);
		describe("mintToWallet (address to_, uint amount_)", () => {
			it(`Mint called by owner should pass and mint`, async () => {
				// Mint to wallet called on deploy script.
				expect(await testToken.balanceOf(addr1.address)).to.equal(
					initBalanceForm
				);
			});
			it(`Mint called by non owner should revert`, async () => {
				await expect(testToken.connect(addr1).mintToWallet(addr1.address, 20))
					.to.be.reverted;
			});
		});
		describe("setStakingContract(address stakingContractAddress_)", () => {
			it(`Contract change called by non owner should revert`, async () => {
				await expect(testToken.connect(addr1).setStakingContract(owner.address))
					.to.be.reverted;
			});
		});
	});

	describe("Staking Contract: Deploy", () => {
		beforeEach(deploy);
		describe("constructor(string memory name_, string memory symbol_)", () => {
			it(`On deploy owner should be set`, async () => {
				expect(await stakingContract.owner()).to.equal(owner.address);
			});
		});
	});

	describe("Staking Contract:  Functions", () => {
		beforeEach(deploy);

		describe("setApprovedToken(address stakingContractAddress_)", () => {
			it(`Contract change called by non owner should revert`, async () => {
				await expect(
					stakingContract.connect(addr1).setApprovedToken(owner.address)
				).to.be.reverted;
			});
		});

		describe("stakeTokens(uint amount_)", () => {
			it(`Function call without enough funds should revert`, async () => {
				await testToken.approve(stakingContract.address, convFromEthToWei(10));
				await expect(
					stakingContract.stakeTokens(convFromEthToWei(5))
				).to.be.revertedWith("Insufficient amount of tokens");
			});

			it(`Calling stake should deposit sent amount and receive 1 receipt token`, async () => {
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

			it(`Calling already staked should increase deposit but do not mint another receipt token`, async () => {
				await testToken
					.connect(addr1)
					.approve(stakingContract.address, convFromEthToWei(10));
				await stakingContract.connect(addr1).stakeTokens(convFromEthToWei(5));
				await stakingContract.connect(addr1).stakeTokens(convFromEthToWei(3));
				expect(
					convFromWeiToEth(await stakingContract.balanceOf(addr1.address))
				).to.equal("1.0");
				expect(
					convFromWeiToEth(await testToken.balanceOf(addr1.address))
				).to.equal("2.0");
			});
		});

		describe("calculateReward()", () => {
			//System is designed for a reward of 1 wei per staked second.
			it(`Calling calculateReward should return reward withou staked capital`, async () => {
				await testStakeTokens(addr1, 5);
				await forwardTime(200);
				expect(await stakingContract.calculateReward(addr1.address)).to.equal(
					200
				);
			});
		});

		describe("checkBalance()", () => {
			it(`Calling checkBalance with no stake should revert`, async () => {
				await expect(stakingContract.checkBalance()).to.be.revertedWith(
					"No tokens staked"
				);
			});
			it(`Calling check should return current balance`, async () => {
				//System is designed for a reward of 1 wei per staked second.
				await testStakeTokens(addr1, 5);
				await forwardTime(200);
				expect(
					convFromWeiToEth(await stakingContract.connect(addr1).checkBalance())
				).to.equal("5.0000000000000002");
			});
		});

		describe("unstakeTokens()", () => {
			it(`Calling unstakeTokens with no stake should revert`, async () => {
				await expect(stakingContract.unstakeTokens()).to.be.revertedWith(
					"No tokens staked"
				);
			});
			it(`Unstaking should return tokens and burn withdraw receipt token`, async () => {
				await testStakeTokens(addr1, 5);
				await stakingContract
					.connect(addr1)
					.approve(stakingContract.address, convFromEthToWei(10));
				await forwardTime(200);
				console.log(
					"Addr1 balance after staking : " +
						(await testToken.balanceOf(addr1.address))
				);
				console.log(
					"Addr1 balance on contract: " +
						(await stakingContract.connect(addr1).checkBalance())
				);
				await stakingContract.connect(addr1).unstakeTokens();
				console.log(
					"Withdrawn balance (non staked tokens + staked tokens + reward): " +
						(await testToken.balanceOf(addr1.address))
				);
				expect(
					convFromWeiToEth(await stakingContract.balanceOf(addr1.address))
				).to.equal("0.0");
			});
		});
	});
});

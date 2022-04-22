
async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const StakingContract = await hre.ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract.deploy("Pre Work Staking Contract","TKNR");
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy("Test Token","TST");

  await stakingContract.deployed();
  await testToken.deployed();

  console.log("Staking Contract deployed to:", stakingContract.address);
  console.log("Test Token Contract deployed to:", testToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

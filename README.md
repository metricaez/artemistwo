# Essay

## Intro  
In this brief essay I would like to explain the process behind the development of the solution for the requested assignment.
I choose for option two which is the Staking Contract, I started by detecting the explicit requested functionalities that the project should implement. Those are:
- As a user I must be able to deposit tokens for staking on the staking contract.
- As a user I must receive rewards periodically as long as I have tokens staked.
- As a user I must be able to check my balance, which is my staked number of tokens plus my reward for the period staked. 
- As a user I must be able to withdraw the staked tokens and the earned reward.
- As a user I must receive a receipt token as a proof of having tokens staked in the contract.
- As a system I must be able to implement these functionalities for multiple users simultaneously. 

## Design 
The specifications of the assignment left room for design decisions to be made, having in mind the timebox presented and that this is not meant to be production ready this are the decisions I choose and relevant comments related to them:
-	I assumed that both the staking token and the receipt token could be ERC20 standard.
-	The reward rate would be of one weir per second with tokens staked on the contract. Some considerations regarding this statement:
  1. The reward rate is not related with the staked amount of tokens per user. Example: Reward would be the same for a user with 10 staked tokens and for a user with 50000 stacked tokens.
  2. Rewards start running once the balance of staked tokens on the contract for the user increases from 0 to any amount. The user might deposit more tokens into the contract but the reward will be calculated from the first deposit. Once the user withdraws all funds and reward this process is restarted. 
-	The staking contract mints new tokens as rewards, this implies a minting permission over the staking token which is currently implemented. This can also be done by distributing from a reward pool of deposited staking tokens but this implementation ties the system work to the deposit of tokens in said pool which introduces new border cases to explore. As for this first implementation I went for this approach.  
-	A user receives only one receipt token no matter how many times it sends tokens to the contract, once the user withdraws its funds, the token is burnt. 
-	Only basic security checks such as access control and function patterns were implemented due to the scope of the project.

## Implementation
After the initial evaluation and the design decisions were taken, I started to program both the Staking Contract as the Test Token (the token that can be staked). Since Staking Contract must be able to mint tokens and I do not want it the owner of the Test Token contract I decided to implement a mintReward function which is not an ERC20 so a custom Interface was implemented. This decision was based on the need of being able to mint tokens from the owner wallet for testing purposes and even though this could be made through a function within Staking Contract at this stage I decided to leave it separated. 
As most of the functions for the desired functionalities could be implanted with ERC20 standard functions I found no major difficulties during the code writing stage. The only relevant decision that was made was the organization of users as Structs within a mapping with their addresses as keys.  

## Testing
Once the contracts were presented, a basic unit testing script was implemented. All the functions most relevant use cases were tested and basic access control. This is the part which presented most difficulties as since the reward rate is related to the seconds passed since staked the amounts to be checked against could vary slightly depending on the test length as it implies time between function calls. For example, to check that the withdrawn function a logic test would be to check that after withdraw the user gest its staked balance and its reward according to the second that the EVM was fast forwarded, however if some functions are called in the middle some extra tokens might be added to the reward these calls imply time execution.

## Conclusion 
I do consider that the system works as requested and there are many things such as contract structure and testing that could be improved but for the scope of this first pre work I decided to push it this way. Hope it is enough and I am more than welcome for any feedback or further request both for documentation and implementation. 

# Links 


Staking Contract Goerli deploy:
https://goerli.etherscan.io/address/0x4f71456D53A78b20D79EaE058Fe250ba31e4608d#code

Test Token Goerli deploy:
https://goerli.etherscan.io/address/0x01Ee331d2869794fcd84b70Ef9CAC7cDcdbc6458#code

Github Repo:
https://github.com/metricaez/artemistwo.git
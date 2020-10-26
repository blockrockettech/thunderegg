const LavaToken = require('../artifacts/LavaToken.json');

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(
    "Deploying thunderegg contract with the account:",
    deployerAddress
  );

  const ThunderGod = await ethers.getContractFactory("ThunderEgg");
  const thunderEgg = await ThunderGod.deploy(
    process.env.LAVA_TOKEN_ADDRESS,
    process.env.LAVA_PER_BLOCK,
    process.env.LAVA_FARMING_START_BLOCK,
    process.env.LAVA_BONUS_END_BLOCK
  );

  console.log('ThunderEgg deployed at:', (await thunderEgg.deployed()).address);

  console.log('Changing minter');
  const lavaToken = new ethers.Contract(
    process.env.LAVA_TOKEN_ADDRESS,
    LavaToken.abi,
    deployer
  );

  await lavaToken.changeMinter((await thunderEgg.deployed()).address);

  //setBaseTokenURI
  // https://us-central1-thunderegg-d26af.cloudfunctions.net/main/api/chain/4/metadata/1 - API done and hosted

  console.log('Minter changed to ThunderEgg!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

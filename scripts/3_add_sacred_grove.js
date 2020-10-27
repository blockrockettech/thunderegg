const ThunderEgg = require('../artifacts/ThunderEgg.json');

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(
    "Deploying new sacred grove contract with the account:",
    deployerAddress
  );

  const thunderEgg = new ethers.Contract(
    process.env.THUNDEREGG_ADDRESS,
    ThunderEgg.abi,
    deployer //provider
  );

  await thunderEgg.addSacredGrove('100', process.env.STAKING_TOKEN_ADDRESS, true);

  console.log('Adding sacred grove');

  await thunderEgg.setBaseTokenURI('https://us-central1-thunderegg-d26af.cloudfunctions.net/main/api/chain/4/metadata/');

  console.log('Set base token URI');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

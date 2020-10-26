const ThunderEgg = require('../artifacts/ThunderEgg.json');

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(
    "Deploying with the account:",
    deployerAddress
  );

  const thunderEgg = new ethers.Contract(
    process.env.THUNDEREGG_ADDRESS,
    ThunderEgg.abi,
    deployer //provider
  );

  await thunderEgg.massUpdateSacredGroves();

  console.log('Updating sacred grove');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

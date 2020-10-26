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

  await thunderEgg.addSacredGrove('100', process.env.THUNDEREGG_ADDRESS, true);

  console.log('Adding sacred grove');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

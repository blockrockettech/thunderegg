async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(
    "Deploying deposit contract with the account:",
    deployerAddress
  );

  const volcano = await ethers.getContractFactory("LavaToken");
  const lava = await volcano.deploy(
    process.env.LAVA_INITIAL_SUPPLY,
    process.env.LAVA_INITIAL_SUPPLY_BENEFICIARY,
    process.env.LAVA_MINTER
  );

  console.log('Lava contract deployed at:', (await lava.deployed()).address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

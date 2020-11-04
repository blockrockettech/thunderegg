const ethers = require('ethers');

module.exports = class ThunderEggService {

  constructor(chainId) {
    this.chainId = chainId;
    const network = ethers.providers.getNetwork(parseInt(this.chainId));
    this.provider = ethers.providers.getDefaultProvider(network);
    this.contract = new ethers.Contract(require('../contracts/ThunderEgg.json').networks[this.chainId].address, require('../contracts/ThunderEgg.json').abi, this.provider);
  }

  // genesis is #1
  async thunderEggStats(eggId, groveId = 1) {
    //address _owner, uint256 _birth, uint256 _age, uint256 _lp, uint256 _lava, bytes32 _name
    const {_owner, _birth, _age, _lp, _lava, _name} = await this.contract.thunderEggStats(groveId, eggId);

    const contractName = await this.contract.name();
    const symbol = await this.contract.symbol();
    const tokenUri = await this.contract.tokenURI(eggId);
    const eggName = ethers.utils.parseBytes32String(_name);

    return {
      contractName,
      symbol,
      name: `ThunderEgg #${eggId}`,
      description: `My name is ${eggName}`,
      image: `https://us-central1-thunderegg-d26af.cloudfunctions.net/main/api/chain/${this.chainId}/image/${eggId}`,
      tokenUri,
      owner: _owner,
      attributes: [
        {
          'trait_type': 'Birth',
          'value': _birth.toString()
        },
        {
          'trait_type': 'LP',
          'value': _lp.toString()
        },
        {
          'trait_type': 'Age',
          'value': _age.toString()
        },
        {
          'trait_type': 'Lava',
          'value': _lava.toString()
        },
        {
          'trait_type': 'Name',
          'value': eggName
        },
      ]
    };
  }

};

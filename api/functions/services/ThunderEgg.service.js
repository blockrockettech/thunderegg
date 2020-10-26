const ethers = require('ethers');

module.exports = class ThunderEggService {

  constructor(chainId) {
    this.chainId = chainId;
    const network = ethers.providers.getNetwork(4);
    this.provider = ethers.providers.getDefaultProvider(network);
    this.contract = new ethers.Contract(require('../contracts/ThunderEgg.json').networks['4'].address, require('../contracts/ThunderEgg.json').abi, this.provider);
  }

  async thunderEggStats(eggId, groveId = 0) {
    const {_owner, _birth, _lp, _lava, _name} = await this.contract.thunderEggStats(groveId, eggId);

    const name = await this.contract.name();
    const symbol = await this.contract.symbol();
    const tokenUri = await this.contract.tokenURI(eggId);
    const eggName = ethers.utils.parseBytes32String(_name);

    return {
      name,
      description: `Thunder egg #${eggName}`,
      symbol,
      image: `https://us-central1-thunderegg-d26af.cloudfunctions.net/main/api/chain/${this.chainId}/image/${eggId}`,
      tokenUri,
      owner: _owner,
      birth: _birth.toString(),
      lp: _lp.toString(),
      lava: _lava.toString(),
      eggName: eggName,
    };
  }

};

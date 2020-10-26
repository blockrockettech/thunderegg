const _ = require('lodash');

const metadata = require('express').Router({mergeParams: true});

const ThunderEggService = require('../../services/ThunderEgg.service');

metadata.get('/:tokenId', async (req, res, next) => {
  try {
    const {chainId, tokenId} = req.params;
    console.log({chainId, tokenId});

    const thunderEggService = new ThunderEggService(chainId);
    const metadata = await thunderEggService.thunderEggStats(tokenId);
    res.json(metadata);
  } catch (e) {
    return next(e);
  }
});

module.exports = metadata;

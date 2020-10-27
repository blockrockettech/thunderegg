const fs = require('fs');
const _ = require('lodash');

const image = require('express').Router({mergeParams: true});

image.get('/:tokenId', async (req, res, next) => {
  try {
    const image = await fs.createReadStream(`./services/images/EGG-purple.png`);
    res.contentType('image/png');
    return image.pipe(res);
  } catch (e) {
    return next(e);
  }
});

module.exports = image;

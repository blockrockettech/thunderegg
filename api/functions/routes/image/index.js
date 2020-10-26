const fs = require('fs');
const _ = require('lodash');

const image = require('express').Router({mergeParams: true});

image.get('/:tokenId', async (req, res, next) => {
  try {
    const image = await fs.createReadStream(`./services/images/eggcellent.jpg`);
    res.contentType('image/jpg');
    return image.pipe(res);
  } catch (e) {
    return next(e);
  }
});

module.exports = image;

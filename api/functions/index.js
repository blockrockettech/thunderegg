const functions = require('firebase-functions');

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const metadata = require('./routes/metadata');
const image = require('./routes/image');

const newApp = express();

newApp.use('/chain/:chainId/image', image);
newApp.use('/chain/:chainId/metadata', metadata);

const main = express();
main.use(cors());
main.use('/api', newApp);

exports.main = functions.https.onRequest(main);

import * as functions from 'firebase-functions';
import React from 'react';
import { renderToString } from 'react-dom/server';
import express from 'express';
import fs from 'fs';
// import Debug from 'debug';
// const debug
// var debug = require('debug')('MyApp');

import Meta from './src/js/components/Meta.js';
import getFacts from './src/js/facts.js';

const index = fs.readFileSync(__dirname + '/index.html', 'utf8')

const app = express();

app.get('/', (req, res) => {
  console.log(`you in here b? prob not`)
  getFacts().then(facts => {
    console.log(`you in here b?`)
    const metaHtml = renderToString(<Meta facts={facts} />)
    console.log(index)
    console.log('~~~~~~~~~~~~~~~~')
    console.log(metaHtml)
    const finalHtml = index.replace('<!-- ::META:: -->', metaHtml)
    console.log('~~~~~~~~~~~~~~~~')
    console.log(finalHtml)
    res.send(finalHtml);
  });
});

app.use(express.static('.'));

const port = 3000;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

export let gsvrisk = functions.https.onRequest(app);

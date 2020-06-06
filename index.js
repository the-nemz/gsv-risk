import * as functions from 'firebase-functions';
import React from 'react';
import { renderToString } from 'react-dom/server';
import express from 'express';
import fs from 'fs';

import Meta from './server/js/components/Meta.js';
import getFacts from './server/js/facts.js';

const index = fs.readFileSync(__dirname + '/index.html', 'utf8')

const app = express();

app.get('/', (req, res) => {
  getFacts().then(facts => {
    const metaHtml = renderToString(<Meta facts={facts} />)
    const finalHtml = index.replace('<!-- ::META:: -->', metaHtml)
    res.send(finalHtml);
  });
});

app.use(express.static('.'));

export let gsvrisk = functions.https.onRequest(app);

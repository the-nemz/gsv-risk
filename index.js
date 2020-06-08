import * as functions from 'firebase-functions';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';
import express from 'express';
import fs from 'fs';

import Meta from './server/js/components/Meta.js';
import { INITIAL_FACTORS, getInputFromFactor } from './server/js/_util.js';

const index = fs.readFileSync(__dirname + '/index.html', 'utf8')

const app = express();

app.get('/', (req, res) => {
  const queryParams = req.query ? req.query : {};
  let factors = INITIAL_FACTORS;

  let hasValidQuery = false;
  for (const factor of factors) {
    if (factor.id in queryParams) {
      factor.input = queryParams[factor.id];
      factor.input = getInputFromFactor(factor);
      if (factor.input !== null) {
        hasValidQuery = true;
      }
    } else {
      factor.input = null;
    }
  }

  renderToString(<Meta factors={factors} useDefaults={!hasValidQuery} />);
  const helmet = Helmet.renderStatic();

  const finalHtml = index.replace('<!-- ::META:: -->', helmet.title.toString() + helmet.meta.toString());
  res.send(finalHtml);
});

app.use(express.static('.'));

export let gsvrisk = functions.https.onRequest(app);

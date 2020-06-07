import * as functions from 'firebase-functions';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Helmet } from 'react-helmet';
import express from 'express';
import fs from 'fs';

import Meta from './server/js/components/Meta.js';

const index = fs.readFileSync(__dirname + '/index.html', 'utf8')

const app = express();

app.get('/', (req, res) => {
  renderToString(<Meta />);
  const helmet = Helmet.renderStatic();

  const finalHtml = index.replace('<!-- ::META:: -->', helmet.title.toString() + helmet.meta.toString());
  res.send(finalHtml);
});

app.use(express.static('.'));

export let gsvrisk = functions.https.onRequest(app);

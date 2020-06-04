import * as functions from 'firebase-functions';
import React from 'react';
import { renderToString } from 'react-dom/server';
import express from 'express';
import fs from 'fs';

import Main from './src/js/components/Main.js';
import getFacts from './src/js/facts.js';

const index = fs.readFileSync(__dirname + '/index.html', 'utf8')

const app = express();
app.get('**', (req, res) => {
  getFacts().then(facts => {
    const mainHtml = renderToString(<Main facts={facts} />)
    const finalHtml = index.replace('<!-- ::APP:: -->', mainHtml)
    res.send(finalHtml);
  });
});

export let gsvrisk = functions.https.onRequest(app);

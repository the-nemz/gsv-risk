'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gsvrisk = undefined;

var _firebaseFunctions = require('firebase-functions');

var functions = _interopRequireWildcard(_firebaseFunctions);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _reactHelmet = require('react-helmet');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Meta = require('./server/js/components/Meta.js');

var _Meta2 = _interopRequireDefault(_Meta);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var index = _fs2.default.readFileSync(__dirname + '/index.html', 'utf8');

var app = (0, _express2.default)();

app.get('/', function (req, res) {
  // const metaHtml = renderToString(<Meta />).replace('<div>', '').replace('</div>', '');
  var metaHtml = (0, _server.renderToString)(_react2.default.createElement(_Meta2.default, null));
  var helmet = _reactHelmet.Helmet.renderStatic();

  // console.log(helmet.title.toString());
  // console.log(helmet.meta.toString());

  var finalHtml = index.replace('<!-- ::META:: -->', helmet.title.toString() + helmet.meta.toString());
  res.send(finalHtml);

  // console.log('final html here:');
  // console.log(finalHtml);


  // ${helmet.title.toString()}
  // ${helmet.meta.toString()}

  // res.send(`
  //   <!doctype html>
  //   <html lang="en">
  //     <head>
  //         <meta charset="utf-8"/>
  //         <link rel="icon" href="/favicon.ico"/>
  //         <meta name="viewport" content="width=device-width,initial-scale=1"/>
  //         <meta name="theme-color" content="#000000"/>
  //         <meta name="description" content="Web site created using create-react-app"/>
  //         <link rel="apple-touch-icon" href="/logo192.png"/>
  //         <link rel="manifest" href="/manifest.json"/>
  //         <link href="/static/css/main.f81d2e15.chunk.css" rel="stylesheet">
  //         ${helmet.title.toString()}
  //         ${helmet.meta.toString()}
  //     </head>
  //     <body>
  //         <noscript>You need to enable JavaScript to run this app.</noscript>
  //         <div id="root"></div>
  //         <script>!function(l){function e(e){for(var r,t,n=e[0],o=e[1],u=e[2],f=0,i=[];f<n.length;f++)t=n[f],p[t]&&i.push(p[t][0]),p[t]=0;for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(l[r]=o[r]);for(s&&s(e);i.length;)i.shift()();return c.push.apply(c,u||[]),a()}function a(){for(var e,r=0;r<c.length;r++){for(var t=c[r],n=!0,o=1;o<t.length;o++){var u=t[o];0!==p[u]&&(n=!1)}n&&(c.splice(r--,1),e=f(f.s=t[0]))}return e}var t={},p={1:0},c=[];function f(e){if(t[e])return t[e].exports;var r=t[e]={i:e,l:!1,exports:{}};return l[e].call(r.exports,r,r.exports,f),r.l=!0,r.exports}f.m=l,f.c=t,f.d=function(e,r,t){f.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},f.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},f.t=function(r,e){if(1&e&&(r=f(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var t=Object.create(null);if(f.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var n in r)f.d(t,n,function(e){return r[e]}.bind(null,n));return t},f.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return f.d(r,"a",r),r},f.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},f.p="/";var r=window.webpackJsonp=window.webpackJsonp||[],n=r.push.bind(r);r.push=e,r=r.slice();for(var o=0;o<r.length;o++)e(r[o]);var s=n;a()}([])</script><script src="/static/js/2.486beae6.chunk.js"></script><script src="/static/js/main.48379de3.chunk.js"></script>
  //     </body>
  //   </html>
  // `);
});

app.use(_express2.default.static('.'));

var gsvrisk = exports.gsvrisk = functions.https.onRequest(app);
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
  (0, _server.renderToString)(_react2.default.createElement(_Meta2.default, null));
  var helmet = _reactHelmet.Helmet.renderStatic();

  var finalHtml = index.replace('<!-- ::META:: -->', helmet.title.toString() + helmet.meta.toString());
  res.send(finalHtml);
});

app.use(_express2.default.static('.'));

var gsvrisk = exports.gsvrisk = functions.https.onRequest(app);
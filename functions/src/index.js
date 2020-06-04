'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Main = require('./js/components/Main.js');

var _Main2 = _interopRequireDefault(_Main);

var _facts = require('./js/facts.js');

var _facts2 = _interopRequireDefault(_facts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _facts2.default)().then(function (facts) {
  _reactDom2.default.render(_react2.default.createElement(_Main2.default, { facts: facts }), document.getElementById('root'));
});
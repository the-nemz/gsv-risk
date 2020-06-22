'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = require('react-helmet');

var _util = require('../_util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Meta = function (_React$Component) {
  _inherits(Meta, _React$Component);

  function Meta(props) {
    _classCallCheck(this, Meta);

    return _possibleConstructorReturn(this, (Meta.__proto__ || Object.getPrototypeOf(Meta)).call(this, props));
  }

  _createClass(Meta, [{
    key: 'getDescription',
    value: function getDescription(factors, gsv) {
      var textFactors = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = factors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var factor = _step.value;

          if (factor.input !== null) {
            if (factor.options) {
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = factor.options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var option = _step2.value;

                  if (option.value === factor.input) {
                    textFactors.push(option.label.toLowerCase());
                  }
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }
            } else {
              textFactors.push(factor.meta.replace('[INPUT]', factor.input));
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var allTextFactors = '';
      if (textFactors.length === 1) {
        allTextFactors = textFactors[0];
      } else if (textFactors.length === 2) {
        allTextFactors = textFactors[0] + ' and ' + textFactors[1];
      } else if (textFactors.length >= 3) {
        allTextFactors = textFactors.slice(0, -1).join(', ') + ', and ' + textFactors[textFactors.length - 1];
      }

      return 'GSV Risk | An event with ' + allTextFactors + ' has COVID-19 risk comparable to ' + (0, _util.getGsvText)(gsv) + ' grocery store visits.';
    }
  }, {
    key: 'render',
    value: function render() {
      var title = 'Grocery Store Visits | Calculate COVID-19 risk in terms we all know - going to the grocery store.';
      var description = 'GSV Risk is a web application that allows you to approximate an event\'s COVID-19 risk in units we all know - grocery store visits.';
      var logoPath = this.props.host + '/images/default.svg';

      if (!this.props.useDefaults) {
        var gsv = (0, _util.calculateGsv)(this.props.factors);
        title = 'GSV Risk | ' + (0, _util.getGsvText)(gsv) + ' grocery store visits!';
        description = this.getDescription(this.props.factors, gsv);

        if (gsv < 4.95) {
          logoPath = this.props.host + '/images/' + gsv.toFixed(1) + '.svg';
        } else {
          logoPath = this.props.host + '/images/' + gsv.toFixed(0) + '.svg';
        }
      }

      return _react2.default.createElement(_reactHelmet.Helmet, {
        title: title,
        meta: [{
          name: 'og:site_name',
          content: 'GSV Risk'
        }, {
          name: 'og:title',
          content: title
        }, {
          name: 'description',
          content: description
        }, {
          name: 'og:description',
          content: description
        }, {
          name: 'og:image:secure_url',
          content: logoPath
        }]
      });
    }
  }]);

  return Meta;
}(_react2.default.Component);

exports.default = Meta;
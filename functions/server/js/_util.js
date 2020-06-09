'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateGsv = calculateGsv;
exports.getInputFromFactor = getInputFromFactor;
exports.getGsvText = getGsvText;
exports.calculateLogFraction = calculateLogFraction;
exports.gsvToColor = gsvToColor;
exports.getRandomInt = getRandomInt;
var MAX_GSV = exports.MAX_GSV = 50;
var MIN_GSV = exports.MIN_GSV = 0.1;

var MASK_HELP_RATIO = exports.MASK_HELP_RATIO = 0.5;

var RED_GSV = exports.RED_GSV = 25; // GSV value at which point bar color should be fully red
var RED_HUE = exports.RED_HUE = 9;
var GREEN_HUE = exports.GREEN_HUE = 123;

var INITIAL_FACTORS = exports.INITIAL_FACTORS = [{
  id: 'transmission',
  prompt: 'Which best describes the type of interactions you\'ll have?',
  type: 'number',
  options: [{
    'value': 2,
    'label': 'Brief outdoor contact',
    'example': 'Passing by somone on a sidewalk'
  }, {
    'value': 5,
    'label': 'Brief indoor contact',
    'example': 'Slipping by somone in a store aisle'
  }, {
    'value': 10,
    'label': 'Brief close contact',
    'example': 'Sharing a small elevator'
  }, {
    'value': 25,
    'label': 'Extended close contact',
    'example': 'Having dinner with someone'
  }, {
    'value': 50,
    'label': 'Significant physical contact',
    'example': 'Repeated hugging, shoulder to shoulder, etc'
  }],
  default: 5,
  updateDefault: false,
  input: null
},
// {
//   id: 'transmission',
//   prompt: 'What is the risk of transmission?',
//   meta: '[INPUT]% transmissibility',
//   type: 'number',
//   default: 5,
//   updateDefault: false,
//   input: null
// },
{
  id: 'interactions',
  prompt: 'How many people will you interact with?',
  meta: '[INPUT] interactions',
  type: 'number',
  default: 15,
  updateDefault: false,
  input: null
}, {
  id: 'masks',
  prompt: 'What percent of people will be wearing masks?',
  meta: '[INPUT]% of people wearing masks',
  type: 'number',
  default: 100,
  updateDefault: false,
  input: null
}, {
  id: 'infected',
  prompt: 'What percent of people in your area are infected?',
  meta: '[INPUT]% infected',
  type: 'number',
  default: 1.2,
  updateDefault: true,
  input: null
}];

function calculateGsv(factors) {
  var baseFactorValues = {};
  var compareFactorValues = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = factors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var factor = _step.value;

      baseFactorValues[factor.id] = factor.default;
      compareFactorValues[factor.id] = factor.input || factor.input === 0 ? factor.input : factor.default;
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

  var resultFromFactorValues = function resultFromFactorValues(factorValues) {
    var transmit = factorValues.transmission / 100 * (1 - factorValues.masks / 100) + MASK_HELP_RATIO * factorValues.transmission / 100 * (factorValues.masks / 100);
    var inner = 1 - transmit * (factorValues.infected / 100);
    var result = 1 - inner ** factorValues.interactions;
    return result;
  };

  var baseResult = resultFromFactorValues(baseFactorValues);
  var compareResult = resultFromFactorValues(compareFactorValues);

  var gsv = Math.log(1 - compareResult) / Math.log(1 - baseResult);

  var cleanValue = Math.min(gsv || gsv, MAX_GSV);
  return Math.max(cleanValue, MIN_GSV);
}

function getInputFromFactor(factor) {
  if (factor.type === 'number') {
    var parsedVal = parseFloat(factor.input);
    if (parsedVal || parsedVal === 0) {
      if (factor.options) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = factor.options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var option = _step2.value;

            if (option.value === parsedVal) {
              return parsedVal;
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

        return null;
      } else {
        return parsedVal;
      }
    } else {
      return null;
    }
  } else if (factor.input) {
    return factor.input;
  }
  return null;
}

function getGsvText(gsv) {
  if (gsv === 50) {
    return gsv + '+';
  } else if (gsv === 0.1) {
    return '< ' + gsv;
  } else if (gsv < 5) {
    return gsv.toFixed(1);
  } else {
    return gsv.toFixed(0);
  }
}

function calculateLogFraction(gsv) {
  var maxGsv = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MAX_GSV;

  return Math.log10(Math.min(gsv + 1, maxGsv)) / Math.log10(maxGsv);
}

function gsvToColor(gsv) {
  var frac = calculateLogFraction(gsv, RED_GSV);
  var hue = frac * (RED_HUE - GREEN_HUE) + GREEN_HUE;
  return 'hsl(' + hue + ', 100%, 43%)';
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));;
}
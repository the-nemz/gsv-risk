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
  customizeBase: false,
  type: 'number',
  options: [{
    'value': 5,
    'label': 'Brief contact',
    'example': 'Slipping by somone in a store aisle'
  }, {
    'value': 10,
    'label': 'Close contact',
    'example': 'Sharing a small elevator'
  }, {
    'value': 25,
    'label': 'Extended close contact',
    'example': 'Having dinner with someone'
  }, {
    'value': 50,
    'label': 'Significant physical contact',
    'example': 'Hugging, shoulder to shoulder, etc'
  }],
  overrideBase: false,
  baseValue: 5,
  input: null
}, {
  id: 'setting',
  prompt: 'Will you be indoors or outdoors?',
  customizeBase: false,
  type: 'number',
  options: [{
    'value': 100,
    'label': 'Indoors',
    'example': 'Event will be mostly indoors'
  }, {
    'value': 40,
    'label': 'Outdoors',
    'example': 'Event will be mostly outdoors'
  }, {
    'value': 80,
    'label': 'Mixed indoors and outdoors',
    'example': 'Event will be mixed indoors and outdoors'
  }],
  overrideBase: false,
  baseValue: 100,
  input: null
}, {
  id: 'interactions',
  prompt: 'How many people will you interact with?',
  basePrompt: 'How many people come within 6 feet of you?',
  customizeBase: true,
  meta: '[INPUT] interactions',
  type: 'number',
  overrideBase: false,
  baseValue: 15,
  input: null
}, {
  id: 'masks',
  prompt: 'What percent of people will be wearing masks?',
  basePrompt: 'What percent of people wear masks?',
  customizeBase: true,
  meta: '[INPUT]% of people wearing masks',
  type: 'number',
  overrideBase: false,
  baseValue: 100,
  input: null
}, {
  id: 'infected',
  prompt: 'What percent of people in your area are infected?',
  customizeBase: false,
  meta: '[INPUT]% infected',
  type: 'number',
  overrideBase: true,
  baseValue: 1.2,
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

      compareFactorValues[factor.id] = factor.input || factor.input === 0 ? factor.input : factor.baseValue;
      baseFactorValues[factor.id] = factor.overrideBase ? compareFactorValues[factor.id] : factor.baseValue;
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
    var transmit = factorValues.transmission / 100 * (factorValues.setting / 100);
    var maskTransmit = transmit * (1 - factorValues.masks / 100) + MASK_HELP_RATIO * transmit * (factorValues.masks / 100);
    var inner = 1 - maskTransmit * (factorValues.infected / 100);
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
  var isBase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var input = isBase ? factor.baseInput : factor.input;
  if (factor.type === 'number') {
    var parsedVal = parseFloat(input);
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
  } else if (input) {
    return input;
  }
  return null;
}

function getGsvText(gsv) {
  if (gsv === 50) {
    return gsv + '+';
  } else if (gsv === 0.1) {
    return '< ' + gsv;
  } else if (gsv < 4.95) {
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
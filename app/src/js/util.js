export const MAX_GSV = 50;
export const MIN_GSV = 0.1;
export const MASK_HELP_RATIO = 0.5;

export const INITIAL_FACTORS = [
  {
    id: 'transmission',
    prompt: 'Which best describes the type of interactions you\'ll have?',
    type: 'select',
    options: [
      {
        'value': 2,
        'label': 'Brief outdoor contact',
        'example': 'Passing by somone on a sidewalk'
      },
      {
        'value': 5,
        'label': 'Brief indoor contact',
        'example': 'Slipping by somone in a store aisle'
      },
      {
        'value': 10,
        'label': 'Brief close contact',
        'example': 'Sharing a small elevator'
      },
      {
        'value': 25,
        'label': 'Extended close contact',
        'example': 'Having dinner with someone'
      },
      {
        'value': 50,
        'label': 'Significant physical contact',
        'example': 'Repeated hugging, shoulder to shoulder, etc'
      }
    ],
    default: 5,
    updateDefault: false,
    input: null
  },
  {
    id: 'interactions',
    prompt: 'How many people will you interact with?',
    type: 'number',
    default: 15,
    updateDefault: false,
    input: null
  },
  {
    id: 'masks',
    prompt: 'What percent of people will be wearing masks?',
    type: 'number',
    default: 100,
    updateDefault: false,
    input: null
  },
  {
    id: 'infected',
    prompt: 'What percent of people in your area are infected?',
    type: 'number',
    default: 1.2,
    updateDefault: true,
    input: null
  }
]

export function calculateGsv(factors) {
  let baseFactorValues = {};
  let compareFactorValues = {};
  for (const factor of factors) {
    baseFactorValues[factor.id] = factor.default;
    compareFactorValues[factor.id] = factor.input || factor.input === 0 ? factor.input : factor.default;
  }

  const resultFromFactorValues = (factorValues) => {
    const transmit = (factorValues.transmission / 100) * (1 - (factorValues.masks / 100)) + (MASK_HELP_RATIO * factorValues.transmission / 100) * (factorValues.masks / 100);
    const inner = 1 - (transmit * (factorValues.infected / 100));
    const result = 1 - (inner ** factorValues.interactions);
    return result;
  }

  const baseResult = resultFromFactorValues(baseFactorValues);
  const compareResult = resultFromFactorValues(compareFactorValues);

  const gsv = Math.log(1 - compareResult) / Math.log(1 - baseResult);

  let cleanValue = Math.min(gsv || gsv, MAX_GSV);
  return Math.max(cleanValue, MIN_GSV);
}

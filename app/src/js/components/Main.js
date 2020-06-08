import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import _ from 'lodash';

import '../polyfill.js';

import Factor from './Factor';
import Results from './Results';

import { calculateGsv } from '../util.js';

export default class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      factors: [
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
          id: 'infected',
          prompt: 'What percent of people in your area are infected?',
          type: 'number',
          default: 1.2,
          updateDefault: true,
          input: null
        }
      ]
    };
  }

  handleFactorInputChange(factor) {
    let factors = _.cloneDeep(this.state.factors);
    for (const curr of factors) {
      if (curr.id === factor.id) {
        if (factor.type === 'number') {
          const parsedVal = parseFloat(factor.input);
          if (parsedVal || parsedVal === 0) {
            curr.input = parsedVal;
            if (factor.updateDefault) {
              curr.default = parsedVal;
            }
          } else {
            curr.input = null;
          }
        } else {
          curr.input = factor.input;
          if (factor.updateDefault) {
            curr.default = factor.input;
          }
        }
        break;
      }
    }

    this.setState({
      factors: factors
    })
  }

  renderFactors() {
    let factors = [];
    for (const factor of this.state.factors) {
      factors.push(
        <Factor factor={factor} key={factor.id} onFactorInputChange={(factor) => this.handleFactorInputChange(factor)} />
      );
      if (factor.input === null || factor.input === undefined) {
        break;
      }
    }
    return factors;
  }

  render() {
    return (
      <div className="Main">
        <div className="Main-container l-container">
          <div className="Main-left">
            <CSSTransitionGroup
              transitionName="example"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={300}>
              {this.renderFactors()}
            </CSSTransitionGroup>
          </div>
          <div className="Main-right">
            <Results gsv={calculateGsv(this.state.factors)} />
          </div>
        </div>
      </div>
    );
  }
}

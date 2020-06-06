import React from 'react';
import _ from 'lodash';

import '../polyfill.js';

import Factor from './Factor';

export default class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      factors: [
        {
          id: 'interactions',
          prompt: 'How many people will you interact with?',
          type: 'number',
          input: null
        },
        {
          id: 'infected',
          prompt: 'What percent of people in your area are infected?',
          type: 'number',
          input: null
        },
        {
          id: 'transmission',
          prompt: 'What\'s the chance of transmission with an infected person?',
          type: 'number',
          input: null
        }
      ]
    };
  }

  handleFactorInputChange(factor) {
    let factors = _.cloneDeep(this.state.factors);
    for (const curr of factors) {
      if (curr.id === factor.id) {
        curr.input = factor.input;
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
      <div className="Main l-container">
        <div className="Main-left">
          {this.renderFactors()}
        </div>
        <div className="Main-right"></div>
      </div>
    );
  }
}

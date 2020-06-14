import React from 'react';
import Select from 'react-select';

import Factor from './Factor.js';

import { INITIAL_FACTORS, getInputFromFactor } from '../util.js';

// const BASEVALUES_CONTENT = [
//   {
//     id: 'interactions',
//     prompt: 'How many people do you interact with at the store?',
//     type: 'number'
//   },
//   {
//     id: 'masks',
//     prompt: 'What percent of people wear masks at the store?',
//     type: 'number'
//   }
// ]

export default class Input extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  // handleFactorInputChange(factor) {
  //   let factors = _.cloneDeep(this.props.factors);
  //   // let baseValues = _.cloneDeep(this.state.baseValues);
  //   for (const curr of factors) {
  //     if (curr.id === factor.id && factor.customizeBase) {
  //       const baseInput = getInputFromFactor(factor);
  //       curr.baseValue = baseInput;

  //       // let uri = new URI();
  //       // uri.removeQuery(curr.id);
  //       // if (curr.input || curr.input === 0) {
  //       //   uri.addQuery(curr.id, encodeURIComponent(curr.input))
  //       // }
  //       // window.history.pushState(null, 'GSV Risk', uri.toString());

  //       break;
  //     }
  //   }

  //   this.setState({
  //     factors: factors,
  //     // baseValues: baseValues
  //   })
  // }

  renderFactors() {
    let factors = [];
    for (const factor of this.props.factors) {
      if (factor.customizeBase && factor.basePrompt) {
        factors.push(
          <Factor isBase={true} factor={factor} key={factor.id}
                  onFactorInputChange={(factor) => this.props.onFactorBaseChange(factor)} />
        );
      }
    }
    return factors;
  }

  render() {
    return (
      <div className="BaseModal">
        <div className="BaseModal-content">
          <h2 className="BaseModal-heading">
            What are your grocery store visits like?
          </h2>
          <div className="BaseModal-factors">
            {this.renderFactors()}
          </div>
        </div>
        <button className="BaseModal-close"
                onClick={() => this.props.onCloseModal()} />
      </div>
    );
  }
}

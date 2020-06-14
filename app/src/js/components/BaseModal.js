import React from 'react';
import Select from 'react-select';

import Factor from './Factor.js';

export default class Input extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

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

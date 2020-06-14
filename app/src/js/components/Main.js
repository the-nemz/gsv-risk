import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import _ from 'lodash';
import URI from 'urijs';

import BaseModal from './BaseModal.js';
import Factor from './Factor.js';
import Results from './Results.js';

import { INITIAL_FACTORS, calculateGsv, getInputFromFactor } from '../util.js';

import logo from '../../assets/gsv-risk.svg';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    const uri = new URI();
    const qParams = uri.query(true);
    let factors = INITIAL_FACTORS;

    for (const factor of factors) {
      if (uri.hasQuery(factor.id)) {
        factor.input = qParams[factor.id];
        factor.input = getInputFromFactor(factor);
        if (factor.input === null) {
          uri.removeQuery(factor.id);
        }
      }

      // TODO: make query params for base values
    }
    window.history.replaceState(null, 'GSV Risk', uri.toString());

    this.state = {
      factors: factors,
      baseModalOpen: false
    };
  }

  handleFactorInputChange(factor) {
    let factors = _.cloneDeep(this.state.factors);
    for (const curr of factors) {
      if (curr.id === factor.id) {
        const input = getInputFromFactor(factor);
        curr.input = input;
        if (factor.overrideBase && (input || input === 0)) {
          curr.baseValue = input
        }

        let uri = new URI();
        uri.removeQuery(curr.id);
        if (curr.input || curr.input === 0) {
          uri.addQuery(curr.id, encodeURIComponent(curr.input))
        }
        window.history.pushState(null, 'GSV Risk', uri.toString());

        break;
      }
    }

    this.setState({
      factors: factors
    })
  }

  handleFactorBaseChange(factor) {
    let factors = _.cloneDeep(this.state.factors);
    for (const curr of factors) {
      if (curr.id === factor.id && factor.customizeBase) {
        const baseInput = getInputFromFactor(factor, true);
        console.log(baseInput, typeof baseInput);
        if (baseInput || baseInput === 0) {
          curr.baseValue = baseInput;
        }

        // TODO: make query params for base values
        break;
      }
    }

    this.setState({
      factors: factors
    })
  }

  handleToggleBaseModal() {
    this.setState({
      baseModalOpen: !this.state.baseModalOpen
    })
  }

  renderFactors() {
    let factors = [];
    for (const factor of this.state.factors) {
      factors.push(
        <Factor factor={factor} key={factor.id}
                onFactorInputChange={(factor) => this.handleFactorInputChange(factor)} />
      );
      if (factor.input === null || factor.input === undefined) {
        break;
      }
    }
    return factors;
  }

  render() {
    const baseModal = (
      <BaseModal factors={this.state.factors}
                 onCloseModal={() => this.handleToggleBaseModal()}
                 onFactorBaseChange={(factor) => this.handleFactorBaseChange(factor)} />
    );

    return (
      <div className="Main">
        <header className="Main-header">
          <div className="Main-titleLogo">
            <img className="Main-logo" src={logo} alt="GSV Risk" />
            <h1 className="Main-title">GSV Risk</h1>
          </div>
          <button className="Main-baseValuesButton"
                  onClick={() => this.handleToggleBaseModal()}>
            <div className="Main-baseValuesText">Update base visit</div>
            <i className="fas fa-sliders-h"></i>
          </button>
        </header>
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
        {this.state.baseModalOpen ? baseModal : ''}
        <footer className="Main-footer l-container">
          <div className="Main-disclaimer">This is for entertainment purposes only. Pleeeeease continue to follow your local health agency's guidelines.</div>
        </footer>
      </div>
    );
  }
}

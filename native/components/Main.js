import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import _ from 'lodash';

import Factor from './Factor.js';

import { INITIAL_FACTORS, calculateGsv, getInputFromFactor } from '../util.js';
import { VARIABLES } from '../style/variables.js';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      factors: INITIAL_FACTORS,
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
        if (baseInput || baseInput === 0) {
          curr.baseValue = baseInput;
        }

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
    return (
      <View style={styles.container}>
        <View style={styles.left}>
          {this.renderFactors()}
        </View>

        <View style={styles.right}>
          <Text style={styles.gsv}>
            {calculateGsv(this.state.factors)}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: VARIABLES.BLUE_DARK,
    alignItems: 'center',
    justifyContent: 'center'
  },

  left: {
    flex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },

  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  gsv: {
    color: VARIABLES.WHITE
  }
});

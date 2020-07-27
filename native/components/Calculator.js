import React from 'react';
import { Keyboard, TouchableWithoutFeedback, StyleSheet, SafeAreaView, View } from 'react-native';
import Button from 'react-native-button';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

import BaseModal from './BaseModal.js';
import Factor from './Factor.js';
import Results from './Results.js';

import { INITIAL_FACTORS, calculateGsv, getInputFromFactor } from '../common/_util.js';
import { VARIABLES } from '../common/style.js';

export default class Calculator extends React.Component {

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

  handleToggleBaseModal() {
    this.setState({
      baseModalOpen: !this.state.baseModalOpen
    })
  }

  handleFactorBaseChange(factor) {
    let base = _.cloneDeep(this.props.base);
    const baseInput = getInputFromFactor(factor, true);
    if (baseInput || baseInput === 0) {
      base[factor.id] = getInputFromFactor(factor, true);
    } else {
      return;
    }

    const updateFactors = (factors) => {
      for (const curr of factors) {
        if (curr.id === factor.id && factor.customizeBase) {
          curr.baseValue = base[factor.id];

          break;
        }
      }
    }

    let factors = _.cloneDeep(this.state.factors);
    updateFactors(factors);

    this.setState({
      factors: factors
    });

    this.props.onFactorBaseChange(factor, base);
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
      <BaseModal factors={this.state.factors} base={this.props.base}
                 onCloseModal={() => this.handleToggleBaseModal()}
                 onFactorBaseChange={(factor) => this.handleFactorBaseChange(factor)} />
    );

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.wrapper}>
          {this.state.baseModalOpen ? baseModal : null}
          <SafeAreaView style={styles.main}>
            <Button containerStyle={styles.baseModalButton}
                    onPress={() => this.handleToggleBaseModal()}>
              <FontAwesomeIcon style={styles.baseModalButtonIcon} name={'sliders'} size={28} color={VARIABLES.BLUE_DARK} />
            </Button>

            <View style={styles.container}>
              <View style={styles.left}>
                {this.renderFactors()}
              </View>

              <View style={styles.right}>
                <Results gsv={calculateGsv(this.state.factors)} />
              </View>
            </View>

            <Button style={styles.save}
                    onPress={() => this.props.onSaveEvent(this.state.factors)}>
              Save
            </Button>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },

  main: {
    flex: 1,
    position: 'relative',
    backgroundColor: VARIABLES.BLUE_DARK,
    padding: VARIABLES.GUTTER_MINI
  },

  baseModalButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    right: VARIABLES.GUTTER,
    top: VARIABLES.GUTTER
  },

  baseModalButtonIcon: {
    backgroundColor: VARIABLES.WHITE,
    paddingVertical: VARIABLES.GUTTER_MINI,
    paddingHorizontal: VARIABLES.GUTTER_MINI + 2
  },

  save: {
    backgroundColor: VARIABLES.WHITE,
    color: VARIABLES.BLUE_DARK,
    width: 100,
    position: 'absolute',
    bottom: VARIABLES.GUTTER*4,
    right: '50%',
    transform: [{translateX: 50}],
    padding: VARIABLES.GUTTER_MINI
  },

  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  left: {
    flex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: VARIABLES.GUTTER
  },

  right: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  gsv: {
    color: VARIABLES.WHITE
  }
});

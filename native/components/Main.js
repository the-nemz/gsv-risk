import React from 'react';
import { Keyboard, TouchableWithoutFeedback, StyleSheet, SafeAreaView, View } from 'react-native';
import Button from 'react-native-button';
import { Pages } from 'react-native-pages';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';

import Factor from './Factor.js';
import History from './History.js';
import Results from './Results.js';

import { INITIAL_FACTORS, calculateGsv, getInputFromFactor } from '../common/_util.js';
import { VARIABLES } from '../common/style.js';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      factors: INITIAL_FACTORS,
      baseModalOpen: false
    };
  }

  componentDidMount() {
    this.getNextEventId();
    this.getHistory();
  }

  async getNextEventId() {
    try {
      const nextEventId = await AsyncStorage.getItem('nextEventId');
      if (nextEventId !== null) {
        this.setState({
          nextEventId: nextEventId
        });
      } else {
        this.saveNextEventId();
      }
    } catch(e) {
      // try again
      this.getNextEventId();
    }
  }

  async saveNextEventId(current = null) {
    let nextEventId;
    if (current === null) {
      nextEventId = '0';
    } else {
      nextEventId = parseInt(current) + 1 + '';
    }

    try {
      this.setState({
        nextEventId: nextEventId
      });
      await AsyncStorage.setItem('nextEventId', nextEventId);
    } catch (e) {
      console.warn('Error saving nextEventId:', e)
    }
  }

  async getHistory() {
    try {
      let history = [];
      const historyJson = await AsyncStorage.getItem('history');
      if (historyJson !== null) {
        history = JSON.parse(historyJson);
      }
      this.setState({
        history: history
      })
    } catch(e) {
      // try again
      this.getHistory();
    }
  }

  async saveEvent() {
    if (!this.state.nextEventId) {
      await this.getNextEventId();
    }
    if (!this.state.history) {
      await this.getHistory();
    }

    let newEvent = {
      id: this.state.nextEventId,
      timestamp: Date.now(),
      factors: this.state.factors
    }

    try {
      let history = _.cloneDeep(this.state.history);
      history.push(newEvent);
      await AsyncStorage.setItem('history', JSON.stringify(history));
      this.saveNextEventId(this.state.nextEventId);
      this.setState({
        history: history
      })
    } catch(e) {
      console.warn('Error saving history:', e)
    }
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
      <Pages>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.main}>
            <View style={styles.container}>
              <View style={styles.left}>
                {this.renderFactors()}
              </View>

              <View style={styles.right}>
                <Results gsv={calculateGsv(this.state.factors)} />
              </View>
            </View>
            <Button style={styles.save}
                    onPress={() => this.saveEvent()}>
              Save
            </Button>
          </SafeAreaView>
        </TouchableWithoutFeedback>
        <History history={this.state.history} />
      </Pages>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    position: 'relative',
    backgroundColor: VARIABLES.BLUE_DARK,
    padding: VARIABLES.GUTTER_MINI
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
    justifyContent: 'center'
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

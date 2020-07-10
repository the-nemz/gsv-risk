import React from 'react';
import { Keyboard, TouchableWithoutFeedback, StyleSheet, SafeAreaView, View, Text } from 'react-native';
import Button from 'react-native-button';
import { Pages } from 'react-native-pages';
import AsyncStorage from '@react-native-community/async-storage';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

import BaseModal from './BaseModal.js';
import Factor from './Factor.js';
import History from './History.js';
import Products from './Products.js';
import Results from './Results.js';

import { INITIAL_FACTORS, calculateGsv, getInputFromFactor } from '../common/_util.js';
import { VARIABLES } from '../common/style.js';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    let base = {};
    for (const factor of INITIAL_FACTORS) {
      if (factor.customizeBase) {
        base[factor.id] = factor.baseValue;
      }
    }

    this.state = {
      factors: INITIAL_FACTORS,
      base: base,
      baseModalOpen: false
    };
  }

  componentDidMount() {
    this.getNextEventId();
    this.getBase();
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

  async getBase() {
    try {
      let base = _.cloneDeep(this.state.base);
      const baseJson = await AsyncStorage.getItem('base');
      if (baseJson !== null) {
        base = JSON.parse(baseJson);
      }
      this.setState({
        base: base
      })
    } catch(e) {
      // try again
      this.getBase();
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
      factors: _.cloneDeep(this.state.factors)
    }

    try {
      let history = _.cloneDeep(this.state.history);
      history.push(newEvent);
      await this.saveHistory(history);
      this.saveNextEventId(this.state.nextEventId);
    } catch(e) {
      console.warn('Error saving history:', e)
    }
  }

  async saveHistory(history) {
    try {
      await AsyncStorage.setItem('history', JSON.stringify(history));
      this.setState({
        history: history
      });
    } catch(e) {
      console.warn('Error saving history:', e)
    }
  }

  async saveBase(base) {
    try {
      await AsyncStorage.setItem('base', JSON.stringify(base));
      this.setState({
        base: base
      });
    } catch(e) {
      console.warn('Error saving base:', e)
    }
  }

  handleUpdateEvent(event) {
    let history = _.cloneDeep(this.state.history);
    for (let i = 0; i < history.length; i++) {
      if (history[i].id === event.id) {
        console.log('found match')
        history[i] = _.cloneDeep(event);
      }
    }

    this.saveHistory(history.sort((a, b) => a.timestamp - b.timestamp));
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
    let base = _.cloneDeep(this.state.base);
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

    let history = _.cloneDeep(this.state.history);
    for (const event of history) {
      updateFactors(event.factors);
    }

    this.setState({
      factors: factors
    });

    this.saveHistory(history);
    this.saveBase(base);
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
      <BaseModal factors={this.state.factors} base={this.state.base}
                 onCloseModal={() => this.handleToggleBaseModal()}
                 onFactorBaseChange={(factor) => this.handleFactorBaseChange(factor)} />
    );

    return (
      <Pages>
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
                      onPress={() => this.saveEvent()}>
                Save
              </Button>
            </SafeAreaView>
          </View>
        </TouchableWithoutFeedback>
        <History history={this.state.history}
                 onUpdateEvent={(event) => this.handleUpdateEvent(event)} />
        <Products />
      </Pages>
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

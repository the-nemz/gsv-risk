import React from 'react';
import { Pages } from 'react-native-pages';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';

import Area from './Area.js';
import Calculator from './Calculator.js';
import History from './History.js';

import { INITIAL_FACTORS } from '../common/_util.js';
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
      base: base
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

  async saveEvent(factors) {
    if (!this.state.nextEventId) {
      await this.getNextEventId();
    }
    if (!this.state.history) {
      await this.getHistory();
    }

    let newEvent = {
      id: this.state.nextEventId,
      timestamp: Date.now(),
      factors: _.cloneDeep(factors)
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
      this.setState({
        history: history
      });
      await AsyncStorage.setItem('history', JSON.stringify(history));
    } catch(e) {
      console.warn('Error saving history:', e)
    }
  }

  async saveBase(base) {
    try {
      this.setState({
        base: base
      });
      await AsyncStorage.setItem('base', JSON.stringify(base));
    } catch(e) {
      console.warn('Error saving base:', e)
    }
  }

  handleUpdateEvent(event) {
    let history = _.cloneDeep(this.state.history);
    for (let i = 0; i < history.length; i++) {
      if (history[i].id === event.id) {
        history[i] = _.cloneDeep(event);
      }
    }

    this.saveHistory(history.sort((a, b) => a.timestamp - b.timestamp));
  }

  handleFactorBaseChange(factor, base) {
    const updateFactors = (factors) => {
      for (const curr of factors) {
        if (curr.id === factor.id && factor.customizeBase) {
          curr.baseValue = base[factor.id];

          break;
        }
      }
    }

    let history = _.cloneDeep(this.state.history);
    for (const event of history) {
      updateFactors(event.factors);
    }

    this.saveBase(base);
    this.saveHistory(history);
  }

  render() {
    return (
      <Pages>
        <Calculator base={this.state.base}
                    onSaveEvent={(factors) => this.saveEvent(factors)}
                    onFactorBaseChange={(factor, base) => this.handleFactorBaseChange(factor, base)} />
        <History history={this.state.history}
                 onUpdateEvent={(event) => this.handleUpdateEvent(event)} />
        <Area />
      </Pages>
    );
  }
}

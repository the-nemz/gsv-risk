import React from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView } from 'react-native';
import _ from 'lodash';

import { calculateGsv, getGsvText, gsvToColor } from '../util.js';
import { VARIABLES } from '../style/variables.js';

export default class History extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  renderEventDetails(factors) {
    let textFactors = []
    for (const factor of factors) {
      if (factor.input !== null) {
        if (factor.options) {
          for (const option of factor.options) {
            if (option.value === factor.input) {
              textFactors.push(
                <Text style={styles.eventDetail} key={factor.id}>
                  {'\u2022 ' + option.label.toLowerCase()}
                </Text>
              );
            }
          }
        } else {
          textFactors.push(
            <Text style={styles.eventDetail} key={factor.id}>
              {'\u2022 ' + factor.meta.replace('[INPUT]', factor.input)}
            </Text>
          );
        }
      }
    }
    return (
      <View style={styles.eventDetails}>
        {textFactors}
      </View>
    );
  }

  renderEvent(event) {
    const gsv = calculateGsv(event.factors);
    const date = new Date(event.timestamp);
    return (
      <View style={styles.event}>
        <Text style={styles.eventDate}>
          {date.toLocaleDateString('en-US')}
        </Text>
        {this.renderEventDetails(event.factors)}
        <Text style={[styles.eventGsv, {color: gsvToColor(gsv)}]}>
          {getGsvText(gsv)}
        </Text>
      </View>
    );
  }

  renderHistory() {
    const history = this.props.history;
    if (!history || !history.length) {
      return (
        <Text style={{color: VARIABLES.WHITE, paddingTop: VARIABLES.GUTTER}}>
          No saved history
        </Text>
      );
    }

    return (
      <FlatList data={history}
                renderItem={({item}) => this.renderEvent(item)}
                keyExtractor={event => event.id} />
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.history}>
        <View>
          <Text style={styles.title}>
            History
          </Text>
        </View>
        <View style={styles.events}>
          {this.renderHistory()}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  history: {
    flex: 1,
    backgroundColor: VARIABLES.BLUE_DARK,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  title: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: VARIABLES.GUTTER_MINI,
    color: VARIABLES.WHITE
  },

  events: {
    flexGrow: 1,
    paddingHorizontal: VARIABLES.GUTTER
  },

  event: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: VARIABLES.GUTTER/2
  },

  eventDate: {
    color: VARIABLES.WHITE,
    flexBasis: '25%',
    fontWeight: 'bold'
  },

  eventDetails: {
    flexGrow: 1
  },

  eventDetail: {
    color: VARIABLES.WHITE
  },

  eventGsv: {
    textAlign: 'center',
    flexBasis: '15%',
    fontSize: 24,
    lineHeight: 32,
  }
});

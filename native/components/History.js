import React from 'react';
import { StyleSheet, Dimensions, View, Text, FlatList, SafeAreaView } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from "victory-native";
import _ from 'lodash';

import { calculateGsv, getGsvText, gsvToColor } from '../common/_util.js';
import { VARIABLES } from '../common/style.js';

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

    const chartData = [{gsv: 0, timestamp: 0}].concat(history.map((event) => {
      return {
        timestamp: event.timestamp,
        gsv: calculateGsv(event.factors)
      }
    }));

    let chartTheme = VictoryTheme.grayscale;
    chartTheme.axis.style.axisLabel.fill = VARIABLES.BLUE_LIGHT;
    chartTheme.axis.style.tickLabels.fill = VARIABLES.BLUE_LIGHT;

    return (
      <View>
        <View style={styles.chart}>
          <VictoryChart theme={chartTheme} scale={{x: "time", y: "sqrt"}}
                        width={Dimensions.get('window').width - VARIABLES.GUTTER*2}
                        height={Dimensions.get('window').height/4}>
            <VictoryAxis
              tickFormat={[]} label="Events Over Time"
              style={{
                axis: {stroke: VARIABLES.BLUE_LIGHT},
                axisLabel: {fontSize: 16, padding: 8},
                grid: {stroke: 'transparent'},
                tickLabels: {fontSize: 0, padding: 0},
                ticks: {
                  size: 0
                }
              }} />
            <VictoryAxis
              dependentAxis
              label="GSVs"
              tickFormat={(gsv) => getGsvText(gsv)}
              axisLabel={{fill: 'white'}}
              style={{
                axis: {stroke: VARIABLES.BLUE_LIGHT},
                axisLabel: {fontSize: 16, padding: 30},
                grid: {stroke: 'transparent'},
                ticks: {
                  stroke: VARIABLES.BLUE_LIGHT,
                  size: 4
                },
                tickLabels: {fontSize: 12, padding: 4}
              }}
            />
            <VictoryBar data={chartData} x="date" y="gsv"
                        alignment="end"
                        style={{
                          data: {
                            fill: ({datum}) => gsvToColor(datum.gsv)
                          }
                        }}
                        animate={{
                          duration: 500,
                          onLoad: { duration: 500 }
                        }} />
          </VictoryChart>
        </View>
        <FlatList style={styles.events} data={history}
                  renderItem={({item}) => this.renderEvent(item)}
                  keyExtractor={event => event.id} />
      </View>
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
        <View style={styles.main}>
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

  main: {
    flexGrow: 1,
    paddingBottom: VARIABLES.GUTTER*3
  },

  chart: {
    paddingHorizontal: VARIABLES.GUTTER
  },

  events: {
    marginTop: -VARIABLES.GUTTER_MINI,
    borderTopColor: VARIABLES.BLUE_MEDIUM,
    borderTopWidth: 2,
    paddingHorizontal: VARIABLES.GUTTER
  },

  event: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: VARIABLES.GUTTER/2,
    borderBottomColor: VARIABLES.BLUE_MEDIUM,
    borderBottomWidth: 1,
  },

  eventDate: {
    textAlign: 'center',
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

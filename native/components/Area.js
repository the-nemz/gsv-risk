import React from 'react';
import { Keyboard, TouchableWithoutFeedback, StyleSheet, Dimensions, View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { Sae } from 'react-native-textinput-effects';
import AsyncStorage from '@react-native-community/async-storage';
import CountryPicker, { DARK_THEME } from 'react-native-country-picker-modal';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { VictoryLine, VictoryBar, VictoryChart, VictoryAxis, VictoryLabel, VictoryTheme } from 'victory-native';
import _ from 'lodash';

import { VARIABLES } from '../common/style.js';

const WORLD_BASEURL = 'https://api.covid19api.com';
const US_BASEURL = 'https://disease.sh/v3/covid-19';

export default class Area extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getArea();
  }

  componentDidUpdate() {
    // const reformat = ([date, num]) => {
    //   return {
    //     date: date,
    //     num: num
    //   }
    // };

    const addRateOfChange = (entries) => {
      let prevCases = 0;
      let prevDeaths = 0;
      for (let i = 0; i < entries.length; i++) {
        entries[i].newCases = entries[i].cases - prevCases;
        entries[i].newDeaths = entries[i].deaths - prevDeaths;
        prevCases = entries[i].cases;
        prevDeaths = entries[i].deaths;
      }
      return entries;
    };

    if (this.state.area && !this.state.requestedData) {
      let area = _.cloneDeep(this.state.area);
      if (area.country.code === 'US' && area.region && area.subregion) {
        // fetch(`${US_BASEURL}/historical/usacounties/${area.region.name.toLowerCase()}`)
        //   .then(res => res.json())
        //   .then(
        //     (result) => {
        //       let timeline = _.cloneDeep(this.state.timeline || {});
        //       for (const entry of result) {
        //         if (entry.county === area.subregion.code.toLowerCase()) {
        //           timeline.cases = Object.entries(entry.timeline.cases).map(reformat);
        //           timeline.deaths = Object.entries(entry.timeline.deaths).map(reformat);
        //           break;
        //         }
        //       }
        //       this.setState({
        //         timeline: timeline
        //       });
        //     },
        //     (error) => {
        //       console.log(error)
        //       reject();
        //     }
        //   );


        fetch(`${US_BASEURL}/nyt/counties/${area.subregion.code}`)
          .then(res => res.json())
          .then(
            (result) => {
              let timeline = _.cloneDeep(this.state.timeline || {});
              let entries = result.filter((entry) => entry.state === area.region.name);
              timeline.subregion = addRateOfChange(entries);
              this.setState({
                timeline: timeline
              });
            },
            (error) => {
              console.log(error)
              reject();
            }
          );

        fetch(`${US_BASEURL}/nyt/states/${area.region.name}`)
          .then(res => res.json())
          .then(
            (result) => {
              let timeline = _.cloneDeep(this.state.timeline || {});
              timeline.region = addRateOfChange(result);
              this.setState({
                timeline: timeline
              });
            },
            (error) => {
              console.log(error)
              reject();
            }
          );

        fetch(`${US_BASEURL}/nyt/usa`)
          .then(res => res.json())
          .then(
            (result) => {
              let timeline = _.cloneDeep(this.state.timeline || {});
              timeline.country = addRateOfChange(result);
              this.setState({
                timeline: timeline
              });
            },
            (error) => {
              console.log(error)
              reject();
            }
          );
      }
      this.setState({
        requestedData: true
      });
    }
  }

  async getArea() {
    try {
      const areaJson = await AsyncStorage.getItem('area');
      if (areaJson !== null) {
        area = JSON.parse(areaJson);
        this.setState({
          area: area
        });
      } else {
        fetch(`${WORLD_BASEURL}/countries`)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                option: {
                  level: 'country',
                  items: result.map(item => item.ISO2)
                }
              });
            },
            (error) => {
              console.log(error)
              reject();
            }
          );
      }
    } catch(e) {
      // try again
      this.getArea();
    }
  }

  async saveArea(area) {
    try {
      await AsyncStorage.setItem('area', JSON.stringify(area));
      this.setState({
        area: area
      });
    } catch(e) {
      console.warn('Error saving area:', e)
    }
  }

  setCountry(country) {
    let tempArea = {};
    if (this.state.tempArea) {
      tempArea = _.cloneDeep(thjis.state.tempArea);
    }

    tempArea.country = {
      code: country.cca2,
      name: country.name
    }

    if (country.cca2 !== 'US') {
      this.setState({area: tempArea});
    } else {
      this.setState({
        tempArea: tempArea,
        option: {
          level: 'zip'
        }
      });
    }
  }

  handleZipChange(value) {
    this.setState({
      input: value,
      inputChanging: true
    });
  }

  handleZipBlur(value) {
    let finalValue = value || value === 0 ? value : null;
    if (finalValue) {
      const reqUrl = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${finalValue}&key=${process.env.REACT_NATIVE_GMAPS_APIKEY}`
      fetch(reqUrl)
        .then(res => res.json())
        .then(
          (result) => {
            if (!result.results || !result.results[0] || !result.results[0].address_components) {
              return;
            }
            let area = _.cloneDeep(this.state.area || this.state.tempArea);
            for (const component of result.results[0].address_components) {
              if ((component.types || []).includes('administrative_area_level_1')) {
                area.region = {
                  code: component.short_name,
                  name: component.long_name
                }
              } else if ((component.types || []).includes('administrative_area_level_2')) {
                area.subregion = {
                  code: component.short_name.replace(' County', ''),
                  name: component.long_name
                }
              }
            }
            this.setState({
              option: null,
              inputChanging: false
            });
            this.saveArea(area);
          },
          (error) => {
            console.log(error)
            reject();
          }
        );
    }
  }

  renderChart(data, label, field) {
    let chartTheme = VictoryTheme.grayscale;
    chartTheme.axis.style.axisLabel.fill = VARIABLES.BLUE_LIGHT;
    chartTheme.axis.style.tickLabels.fill = VARIABLES.BLUE_LIGHT;

    return (
      <VictoryChart theme={chartTheme}
                    height={Dimensions.get('window').height/4}>
        <VictoryAxis
          fixLabelOverlap
          tickFormat={(dateString) => {
            const date = new Date(Date.parse(dateString));
            return date.toLocaleDateString('en-US');
          }}
          tickLabelComponent={<VictoryLabel angle={-20} dy={VARIABLES.GUTTER/4} />}
          style={{
            axis: {stroke: VARIABLES.BLUE_LIGHT},
            // axisLabel: {padding: 32},
            grid: {stroke: 'transparent'},
            ticks: {
              stroke: VARIABLES.BLUE_LIGHT,
              size: 4
            },
            tickLabels: {fontSize: 12, padding: 4}
          }} />
        <VictoryAxis
          dependentAxis
          label={label}
          tickFormat={(val) => {
            const BILLION = 1000000000;
            const TEN_MILLION = 10000000;
            const MILLION = 1000000;
            const TEN_THOUSAND = 10000;
            const THOUSAND = 1000;
            if (val >= BILLION) {
              const sigFigs = (val / BILLION).toFixed(1);
              return `${sigFigs}B`;
            } else if (val >= MILLION) {
              const sigFigs = (val / MILLION).toFixed(val >= TEN_MILLION ? 0 : 1);
              return `${sigFigs}M`;
            } else if (val >= THOUSAND) {
              const sigFigs = (val / THOUSAND).toFixed(val >= TEN_THOUSAND ? 0 : 1);
              return `${sigFigs}K`;
            } else {
              return `${val}`;
            }
          }}
          axisLabel={{fill: 'white'}}
          style={{
            axis: {stroke: VARIABLES.BLUE_LIGHT},
            axisLabel: {padding: 38},
            grid: {stroke: 'transparent'},
            ticks: {
              stroke: VARIABLES.BLUE_LIGHT,
              size: 4
            },
            tickLabels: {fontSize: 12, padding: 4}
          }}
        />
        <VictoryBar data={data} x="date" y={field}
                      alignment="end"
                      style={{
                        data: {
                          fill: VARIABLES.WHITE
                        }
                      }}
                      animate={{
                        duration: 500,
                        onLoad: { duration: 500 }
                      }} />
      </VictoryChart>
    );
  }

  renderMain() {
    if (this.state.option) {
      switch (this.state.option.level) {
        case 'country':
          let theme = DARK_THEME;
          theme.backgroundColor = VARIABLES.BLUE_DARK;
          theme.primaryColorVariant = VARIABLES.BLUE_MEDIUM;
          return (
            <View>
              <CountryPicker theme={theme} countryCodes={this.state.option.items}
                             onSelect={(country) => this.setCountry(country)} />
            </View>
          );
        case 'zip':
          const input = this.state.inputChanging ? this.state.input : null;
          const inputValue = input || input === 0 ? input + '' : '';
          return (
            <View style={styles.zip}>
              <Sae
                label={'Zip Code'}
                value={inputValue}
                iconClass={FontAwesomeIcon}
                iconName={null}
                iconColor={VARIABLES.BLUE_LIGHT}
                inputPadding={16}
                labelHeight={24}
                borderHeight={2}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'numeric'}
                style={styles.inputWrap}
                labelStyle={styles.prompt}
                inputStyle={styles.input}
                onChange={(e) => this.handleZipChange(e.nativeEvent.text)}
                onBlur={(e) => this.handleZipBlur(e.nativeEvent.text)}
              />
            </View>
          );
      }
    } else if (this.state.area && this.state.timeline) {
      let subregionView, regionView, countryView;
      if (this.state.timeline.subregion) {
        subregionView = (
          <View key="subregion">
            <Text style={{color: VARIABLES.WHITE, textAlign: 'center'}}>
              {this.state.area.subregion.name}
            </Text>
            {this.renderChart(this.state.timeline.subregion, 'New Cases', 'newCases')}
          </View>
        );
      }

      if (this.state.timeline.region) {
        regionView = (
          <View key="region">
            <Text style={{color: VARIABLES.WHITE, textAlign: 'center'}}>
              {this.state.area.region.name}
            </Text>
            {this.renderChart(this.state.timeline.region, 'New Cases', 'newCases')}
          </View>
        );
      }

      if (this.state.timeline.country) {
        countryView = (
          <View key="country">
            <Text style={{color: VARIABLES.WHITE, textAlign: 'center'}}>
              {this.state.area.country.name}
            </Text>
            {this.renderChart(this.state.timeline.country, 'New Cases', 'newCases')}
          </View>
        );
      }

      return (
        <ScrollView style={styles.charts}>
          {subregionView}
          {regionView}
          {countryView}
        </ScrollView>
      )
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.wrapper}>
          <SafeAreaView style={styles.area}>
            <View>
              <Text style={styles.title}>
                COVID-19 In Your Area
              </Text>
            </View>
            <View style={styles.main}>
              {this.renderMain()}
            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  area: {
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
    paddingHorizontal: VARIABLES.GUTTER,
    color: VARIABLES.WHITE
  },

  main: {
    width: '100%',
    flexGrow: 1,
    paddingHorizontal: VARIABLES.GUTTER,
    paddingBottom: VARIABLES.GUTTER*3
  },

  zip: {
    width: '100%',
    color: VARIABLES.BLUE_LIGHT,
    marginBottom: 100,
    paddingBottom: 100
  },

  inputWrap: {
    fontSize: 12,
    lineHeight: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    marginTop: VARIABLES.GUTTER,
    marginBottom: VARIABLES.GUTTER
  },

  prompt: {
    fontSize: 24,
    color: VARIABLES.BLUE_LIGHT,
    fontWeight: 'normal',
    textAlign: 'center'
  },

  input: {
    fontSize: 24,
    lineHeight: 32,
    color: VARIABLES.BLUE_LIGHT,
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center'
  },

  charts: {
    flex: 1
  }
});

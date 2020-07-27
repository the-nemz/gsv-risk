import React from 'react';
import { Keyboard, TouchableWithoutFeedback, StyleSheet, Dimensions, View, Text, SafeAreaView, ScrollView, Animated, Easing } from 'react-native';
import Button from 'react-native-button';
import { Sae } from 'react-native-textinput-effects';
import AsyncStorage from '@react-native-community/async-storage';
import CountryPicker, { DARK_THEME } from 'react-native-country-picker-modal';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Select from 'react-native-picker-select';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel, VictoryTheme } from 'victory-native';
import _ from 'lodash';

import { VARIABLES } from '../common/style.js';

const WORLD_BASEURL = 'https://api.covid19api.com';
const COVID_BASEURL = 'https://disease.sh/v3/covid-19';
const PLACEHOLDER = 'PLACEHOLDER';

function toTitleCase(str) {
  return str.replace(
    /\b\w+/g,
    function(s) {
      return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    }
  );
}

export default class Area extends React.Component {

  constructor(props) {
    super(props);
    this.selectAnim = new Animated.Value(0);
    this.state = {};
  }

  componentDidMount() {
    this.getArea();
    this.animateSelect();
  }

  animateSelect() {
    this.selectAnim.setValue(0);
    Animated.timing(
      this.selectAnim,
      {
        toValue: 1,
        duration: 300,
        easing: Easing.linear
      }
    ).start();
  }

  componentDidUpdate() {
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

    const getDateString = (date) => `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')}`;

    if (this.state.area && !this.state.requestedData) {
      let area = _.cloneDeep(this.state.area);
      if (area.country.code === 'US') {
        if (area.subregion) {
          fetch(`${COVID_BASEURL}/nyt/counties/${area.subregion.code}`)
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
                console.warn(error);
              }
            );
        }

        if (area.region) {
          fetch(`${COVID_BASEURL}/nyt/states/${area.region.name}`)
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
                console.warn(error);
              }
            );
        }

        fetch(`${COVID_BASEURL}/nyt/usa`)
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
              console.warn(error);
            }
          );
      } else {
        if (area.region) {
          fetch(`${COVID_BASEURL}/historical/${area.country.code}/${area.region.code}?lastdays=all`)
            .then(res => res.json())
            .then(
              (result) => {
                let timeline = _.cloneDeep(this.state.timeline || {});
                if (!result.timeline) {
                  timeline.region = { error: 'Sorry, data not available.' }
                } else {
                  let entries = [];
                  for (const key in result.timeline.cases) {
                    const date = new Date(Date.parse(key));
                    let entry = {
                      date: getDateString(date),
                      timestamp: date.valueOf(),
                      cases: result.timeline.cases[key],
                      deaths: result.timeline.deaths[key],
                    }
                    entries.push(entry);
                  }

                  timeline.region = addRateOfChange(entries.sort((a, b) => a.timestamp - b.timestamp));
                }

                this.setState({
                  timeline: timeline
                });
              },
              (error) => {
                console.warn(error);
              }
            );
        }

        fetch(`${COVID_BASEURL}/historical/${area.country.code}?lastdays=all`)
          .then(res => res.json())
          .then(
            (result) => {
              let timeline = _.cloneDeep(this.state.timeline || {});
              if (!result.timeline) {
                timeline.country = { error: 'Sorry, data not available.' }
              } else {
                let entries = [];
                for (const key in result.timeline.cases) {
                  const date = new Date(Date.parse(key));
                  let entry = {
                    date: getDateString(date),
                    timestamp: date.valueOf(),
                    cases: result.timeline.cases[key],
                    deaths: result.timeline.deaths[key],
                  }
                  entries.push(entry);
                }

                timeline.country = addRateOfChange(entries.sort((a, b) => a.timestamp - b.timestamp));
              }

              this.setState({
                timeline: timeline
              });
            },
            (error) => {
              console.warn(error);
            }
          );
      }

      fetch(`${COVID_BASEURL}/historical/all?lastdays=all`)
        .then(res => res.json())
        .then(
          (result) => {
            let timeline = _.cloneDeep(this.state.timeline || {});
            let entries = [];
            for (const key in result.cases) {
              const date = new Date(Date.parse(key));
              let entry = {
                date: getDateString(date),
                timestamp: date.valueOf(),
                cases: result.cases[key],
                deaths: result.deaths[key],
              }
              entries.push(entry);
            }

            timeline.world = addRateOfChange(entries.sort((a, b) => a.timestamp - b.timestamp));

            this.setState({
              timeline: timeline
            });
          },
          (error) => {
            console.warn(error);
          }
        );

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
        // fetch(`${WORLD_BASEURL}/countries`)
        //   .then(res => res.json())
        //   .then(
        //     (result) => {
        //       this.setState({
        //         option: {
        //           level: 'country',
        //           items: result.map(item => item.ISO2)
        //         }
        //       });
        //     },
        //     (error) => {
        //       console.warn(error);
        //     }
        //   );
        this.setState({
          option: {
            level: 'country'
          }
        });
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
        area: area,
        tempArea: null
      });
    } catch(e) {
      console.warn('Error saving area:', e)
    }
  }

  async clearArea() {
    try {
      this.setState({
        area: null,
        tempArea: null,
        requestedData: null,
        timeline: null,
        option: {
          level: 'country'
        }
      });
      await AsyncStorage.removeItem('area');
    } catch(e) {
      console.warn('Error saving area:', e)
    }
  }

  async loadRegions(countryCode) {
    fetch(`${COVID_BASEURL}/historical/${countryCode}?lastdays=1`)
      .then(res => res.json())
      .then(
        (result) => {
          if (!result.province || result.province.length < 2) {
            this.saveArea(this.state.tempArea);
            this.setState({
              tempArea: null,
              option: null
            });
            return;
          }

          const mL = 'mainland';
          let provinces = result.province.sort((a, b) => {
            if (a === mL) return -2;
            if (b === mL) return 2;
            return a > b ? 1 : -1;
          });
          let regions = provinces.map((prov) => {
            if (prov === mL) {
              return {
                name: `Mainland ${result.country}`,
                code: prov
              };
            }
            return {
              name: toTitleCase(prov),
              code: prov
            };
          });
          this.setState({
            option: {
              level: 'region',
              choices: regions
            }
          });
        },
        (error) => {
          console.warn(error);
        }
      );
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
      this.loadRegions(country.cca2);
      this.setState({
        tempArea: tempArea,
        option: null
      });
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
                  code: component.short_name.replace(' County', '').replace(' Parish', ''),
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
            console.warn(error);
          }
        );
    }
  }

  handleRegionChange(value) {
    let area = _.cloneDeep(this.state.area || this.state.tempArea);
    for (const choice of this.state.option.choices) {
      if (value === choice.code) {
        area.region = choice;
        break;
      }
    }
    this.setState({
      option: null,
      inputChanging: false
    });
    this.saveArea(area);
  }

  renderRegionPicker() {
    let value = this.state.tempArea && this.state.tempArea.region ? this.state.tempArea.region.name : null;

    const fontSize = this.selectAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 12]
    });
    let promptText = 'Region';
    let prompt = (
      <Animated.Text style={[styles.selectPrompt, {fontSize: fontSize}]}>
        {promptText}
      </Animated.Text>
    );

    const width = this.selectAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    });
    let border = (
      <Animated.View style={{
        borderBottomColor: VARIABLES.BLUE_LIGHT,
        borderBottomWidth: this.state.inputChanging || value !== null ? 2 : 0,
        width: width,
        position: 'absolute',
        bottom: 0,
        right: 0
      }}>
      </Animated.View>
    );

    let selectStyle = {
      placeholder: {
        fontSize: 20,
        height: this.state.inputChanging ? 29 : 110,
        color: !this.state.inputChanging && value === null ? VARIABLES.BLUE_LIGHT : 'transparent',
        fontWeight: 'normal',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      },

      inputIOS: {
        fontSize: 24,
        color: VARIABLES.BLUE_LIGHT,
        fontWeight: 'normal',
        textAlign: 'center',
      }
    }

    const viewStyle = this.state.inputChanging || value !== null ? [styles.selectWrap, styles.selectWrap_bordered] : [styles.selectWrap];

    return (
      <View style={viewStyle}>
        {this.state.inputChanging || value !== null ? prompt : null}
        <Select style={selectStyle} value={value} items={this.state.option.choices.map((item) => { return {label: item.name, value: item.code} })}
                onOpen={() => {
                  this.setState({ inputChanging: true });
                  if (value === null) {
                    this.animateSelect();
                  }
                }}
                onClose={() => {
                  this.setState({ inputChanging: false })
                }}
                onValueChange={(value) => this.handleRegionChange(value)}
                placeholder={!this.state.inputChanging && value === null ? {label: promptText, value: PLACEHOLDER} : {label: promptText, value: PLACEHOLDER}} />
        {border}
      </View>
    );
  }

  renderInput() {
    if (!this.state.option) {
      return;
    }

    switch (this.state.option.level) {
      case 'country':
        let theme = DARK_THEME;
        theme.backgroundColor = VARIABLES.BLUE_DARK;
        theme.primaryColorVariant = VARIABLES.BLUE_MEDIUM;
        theme.fontSize = 20;
        return (
          <View style={styles.countryPicker}>
            <CountryPicker theme={theme} //countryCodes={this.state.option.items}
                           onSelect={(country) => this.setCountry(country)} />
            <FontAwesomeIcon style={styles.editIcon} name={'pencil'} size={20} color={VARIABLES.WHITE} />
          </View>
        );
      case 'region':
        return this.renderRegionPicker();
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
  }

  renderChart(data, label, field, color) {
    let chartTheme = VictoryTheme.grayscale;
    chartTheme.axis.style.axisLabel.fill = VARIABLES.BLUE_LIGHT;
    chartTheme.axis.style.tickLabels.fill = VARIABLES.BLUE_LIGHT;

    return (
      <VictoryChart theme={chartTheme}
                    height={Dimensions.get('window').height/4}
                    style={{}}>
        <VictoryAxis
          fixLabelOverlap
          tickFormat={(dateString) => {
            const date = new Date(Date.parse(dateString));
            return date.toLocaleDateString('en-US');
          }}
          tickLabelComponent={<VictoryLabel angle={-20} dy={VARIABLES.GUTTER/4} />}
          style={{
            axis: {stroke: VARIABLES.BLUE_LIGHT},
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
                          fill: color
                        }
                      }}
                      animate={{
                        duration: 500,
                        onLoad: { duration: 500 }
                      }} />
      </VictoryChart>
    );
  }

  renderCharts(key) {
    if (this.state.timeline[key].error) {
      return (
        <Text style={styles.areaError}>
          {this.state.timeline[key].error}
        </Text>
      );
    } else {
      return (
        <View>
          {this.renderChart(this.state.timeline[key], 'Daily Cases', 'newCases', VARIABLES.YELLOW)}
          {this.renderChart(this.state.timeline[key], 'Daily Deaths', 'newDeaths', VARIABLES.ORANGE)}
        </View>
      );
    }
  }

  renderMain() {
    if (this.state.option || this.state.tempArea) {
      let countryText, regionText;
      if (this.state.tempArea && this.state.tempArea.country) {
        countryText = (
          <Text style={styles.drill}>
            {this.state.tempArea.country.name}
          </Text>
        );
      }
      if (this.state.tempArea && this.state.tempArea.region) {
        regionText = (
          <Text style={styles.drill}>
            {this.state.tempArea.region.name}
          </Text>
        );
      }
      let drilldown = countryText || regionText ? (
          <View style={styles.drilldown}>
            {countryText}
            {regionText}
          </View>
        ) : null;

      return (
        <View>
          {drilldown}
          {this.renderInput()}
        </View>
      );
    } else if (this.state.area && this.state.timeline) {
      let subregionView, regionView, countryView, worldView;
      if (this.state.timeline.subregion) {
        subregionView = (
          <View style={styles.areaWrap} key="subregion">
            <Text style={styles.areaName}>
              {this.state.area.subregion.name}
            </Text>
            {this.renderCharts('subregion')}
          </View>
        );
      }

      if (this.state.timeline.region) {
        regionView = (
          <View style={styles.areaWrap} key="region">
            <Text style={styles.areaName}>
              {this.state.area.region.name}
            </Text>
            {this.renderCharts('region')}
          </View>
        );
      }

      if (this.state.timeline.country) {
        countryView = (
          <View style={styles.areaWrap} key="country">
            <Text style={styles.areaName}>
              {this.state.area.country.name}
            </Text>
            {this.renderCharts('country')}
          </View>
        );
      }

      if (this.state.timeline.world) {
        worldView = (
          <View style={styles.areaWrap} key="world">
            <Text style={styles.areaName}>
              World
            </Text>
            {this.renderCharts('world')}
          </View>
        );
      }

      return (
        <ScrollView style={styles.charts}>
          {subregionView}
          {regionView}
          {countryView}
          {worldView}
          <Button style={styles.changeArea}
                  onPress={() => this.clearArea()}>
            Change Area
          </Button>
        </ScrollView>
      )
    }
  }

  render() {
    const showingCharts = !(this.state.option || this.state.tempArea) && (this.state.area && this.state.timeline);
    const content = (
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
    );

    return showingCharts ? (content) : (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {content}
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
    marginBottom: VARIABLES.GUTTER_MINI,
    paddingHorizontal: VARIABLES.GUTTER,
    color: VARIABLES.WHITE
  },

  main: {
    width: '100%',
    flexGrow: 1,
    paddingHorizontal: VARIABLES.GUTTER,
    paddingBottom: VARIABLES.GUTTER*3
  },

  drilldown: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  drill: {
    fontSize: 20,
    lineHeight: 30,
    color: VARIABLES.WHITE
  },

  countryPicker: {
    width: '100%',
    marginTop: VARIABLES.GUTTER,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  editIcon: {
    marginLeft: VARIABLES.GUTTER_MINI
  },

  selectWrap: {
    display: 'flex',
    flexDirection: 'column'
  },

  selectPrompt: {
    color: VARIABLES.BLUE_LIGHT,
    fontWeight: 'normal',
    textAlign: 'center'
  },

  select: {
    color: 'red'
  },

  selectIconWrap: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22
  },

  zipWrap: {
    display: 'flex',
    flex: 1,
    alignItems: 'center'
  },

  zip: {
    width: '100%'
  },

  inputWrap: {
    fontSize: 12,
    lineHeight: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible'
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

  changeArea: {
    backgroundColor: VARIABLES.WHITE,
    color: VARIABLES.BLUE_DARK,
    width: 140,
    position: 'relative',
    left: '50%',
    transform: [{translateX: -70}],
    padding: VARIABLES.GUTTER_MINI
  },

  charts: {
    flex: 1
  },

  areaWrap: {
    marginBottom: VARIABLES.GUTTER,
    borderBottomColor: VARIABLES.BLUE_MEDIUM,
    borderBottomWidth: 1
  },

  areaName: {
    fontSize: 20,
    lineHeight: 30,
    color: VARIABLES.WHITE,
    textAlign: 'center'
  },

  areaError: {
    color: VARIABLES.WHITE,
    textAlign: 'center',
    paddingVertical: VARIABLES.GUTTER
  }
});

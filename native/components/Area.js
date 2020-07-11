import React from 'react';
import { Keyboard, TouchableWithoutFeedback, StyleSheet, Dimensions, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Sae } from 'react-native-textinput-effects';
import AsyncStorage from '@react-native-community/async-storage';
import CountryPicker, { DARK_THEME } from 'react-native-country-picker-modal';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryLabel, VictoryTheme } from 'victory-native';
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
    const reformat = ([date, num]) => {
      return {
        date: date,
        num: num
      }
    };

    if (this.state.area && !this.state.requestedData) {
      let area = _.cloneDeep(this.state.area);
      if (area.country.code === 'US' && area.region && area.subregion) {
        fetch(`${US_BASEURL}/historical/usacounties/${area.region.name.toLowerCase()}`)
          .then(res => res.json())
          .then(
            (result) => {
              let timeline = {};
              for (const entry of result) {
                if (entry.county === area.subregion.code.toLowerCase()) {
                  timeline.cases = Object.entries(entry.timeline.cases).map(reformat);
                  timeline.deaths = Object.entries(entry.timeline.deaths).map(reformat);
                  break;
                }
              }
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
      let chartTheme = VictoryTheme.grayscale;
      chartTheme.axis.style.axisLabel.fill = VARIABLES.BLUE_LIGHT;
      chartTheme.axis.style.tickLabels.fill = VARIABLES.BLUE_LIGHT;

      return (
        <View>
          <Text style={{color: VARIABLES.WHITE, textAlign: 'center'}}>
            {this.state.area.subregion.name}
          </Text>
          <VictoryChart theme={chartTheme} scale={{x: "date", y: "num"}}
                        width={Dimensions.get('window').width - VARIABLES.GUTTER*2}
                        height={Dimensions.get('window').height/4}>
            <VictoryAxis
              label="Date" fixLabelOverlap
              tickLabelComponent={<VictoryLabel angle={-20} dy={VARIABLES.GUTTER/4} />}
              style={{
                axis: {stroke: VARIABLES.BLUE_LIGHT},
                // axisLabel: {fontSize: 16, padding: 8},
                grid: {stroke: 'transparent'},
                ticks: {
                  stroke: VARIABLES.BLUE_LIGHT,
                  size: 4
                },
                tickLabels: {fontSize: 12, padding: 4}
              }} />
            <VictoryAxis
              dependentAxis
              label="Cases"
              axisLabel={{fill: 'white'}}
              style={{
                axis: {stroke: VARIABLES.BLUE_LIGHT},
                // axisLabel: {fontSize: 16, padding: 30},
                grid: {stroke: 'transparent'},
                ticks: {
                  stroke: VARIABLES.BLUE_LIGHT,
                  size: 4
                },
                tickLabels: {fontSize: 12, padding: 4}
              }}
            />
            <VictoryLine data={this.state.timeline.cases} x="date" y="num"
                         alignment="end"
                         style={{
                           data: {
                             stroke: VARIABLES.WHITE
                           }
                         }}
                         animate={{
                           duration: 500,
                           onLoad: { duration: 500 }
                         }} />
          </VictoryChart>
        </View>
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
  }
});

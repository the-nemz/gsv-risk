import React from 'react';
import { StyleSheet, Dimensions, TouchableWithoutFeedback, View, Text, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import Button from 'react-native-button';
import { Pages } from 'react-native-pages';
import _ from 'lodash';

import Results from './Results.js';
import Factor from './Factor.js';

import { INITIAL_FACTORS, calculateGsv } from '../common/_util.js';
import { VARIABLES } from '../common/style.js';

const NUM_PAGES = 2;
const GSV_WHEEL = [ 0.7, 3.6, 8, 14, 30 ];
const FACTORS_WHEEL = [
  {
    transmission: 25,
    setting: 80,
    interactions: 7,
    masks: 0
  },
  {
    transmission: 5,
    setting: 40,
    interactions: 20,
    masks: 25
  },
  {
    transmission: 10,
    setting: 100,
    interactions: 200,
    masks: 80
  }
];

export default class Landing extends React.Component {

  constructor(props) {
    super(props);

    this.pageRef = React.createRef();

    this.state = {
      gsvPosition: 0,
      factorsPosition: 0,
      pageIndex: 0
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => {
        this.setState({
          gsvPosition: (this.state.gsvPosition + 1) % GSV_WHEEL.length,
          factorsPosition: (this.state.factorsPosition + 1) % FACTORS_WHEEL.length
        });
      },
      5000
    );
  }

  renderGSVContent() {
    return (
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={styles.textSection}>
            A GSV, or grocery store visit, is a unit of measure to help conceptualize an event's exposure risk to COVID-19.
          </Text>
          <Text style={styles.textSection}>
            We calculate this by accounting for several factors including number of people, closeness of interactions, mask wearing, and whether it is outdoors.
          </Text>
          <Text style={styles.textSection}>
            You can also update what your usual grocery store visit is like in settings, so the number of interactions and mask usage matches your experience.
          </Text>
        </View>

        <View style={styles.right}>
          <Results gsv={GSV_WHEEL[this.state.gsvPosition]} />
        </View>
      </View>
    );
  }

  renderSampleFactors(sampleFactors) {
    let factors = [];
    for (const factor of sampleFactors) {
      if (!factor.overrideBase) {
        factors.push(
          <Factor factor={factor} key={factor.id}
                  onFactorInputChange={(factor) => {}} />
        );
      }
    }
    return factors;
  }

  renderFactorsContent() {
    const sampleInputs = FACTORS_WHEEL[this.state.factorsPosition];
    const sampleFactors = _.cloneDeep(INITIAL_FACTORS).map((item) => {
      item.input = sampleInputs[item.id];
      return item;
    });

    return (
      <View style={styles.container}>
        <Text style={styles.textSectionTop}>
          Different events will produce very different GSV values. For example, going to a small dinner party might have the same risk as four visits to the grocery store, the beach could be less than one, and a concert could be dozens.
        </Text>

        <View style={styles.left}>
          {this.renderSampleFactors(sampleFactors)}
        </View>

        <View style={styles.right}>
          <Results gsv={calculateGsv(sampleFactors)} />
        </View>
      </View>
    );
  }

  renderSlide(title, content) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.history}>
          <View>
            <Text style={styles.title}>
              {title}
            </Text>
          </View>
          <View style={styles.main}>
            {content}
            <Button style={styles.save}
                    onPress={() => {
                      if (this.state.pageIndex + 1 < NUM_PAGES) {
                        this.pageRef.current.scrollToPage(this.state.pageIndex + 1);
                      } else {
                        this.props.onClose();
                      }
                    }}>
              {this.state.pageIndex + 1 < NUM_PAGES ? 'Next' : 'Close'}
            </Button>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  render() {
    return (
      <Pages ref={this.pageRef}
             onScrollEnd={() => this.setState({pageIndex: this.pageRef.current.activeIndex})}>
        {this.renderSlide('What is a GSV?', this.renderGSVContent())}
        {this.renderSlide('Do you have examples?', this.renderFactorsContent())}
      </Pages>
    );
  }
}


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

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
    width: '100%',
    flexGrow: 1,
    paddingBottom: VARIABLES.GUTTER*3
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
    flexWrap: 'wrap'
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

  textSection: {
    color: VARIABLES.WHITE,
    fontSize: 16,
    lineHeight: 24,
    marginVertical: VARIABLES.GUTTER_MINI
  },

  textSectionTop: {
    color: VARIABLES.WHITE,
    fontSize: 16,
    lineHeight: 24,
    position: 'absolute',
    top: VARIABLES.GUTTER*2,
    width: '100%',
    paddingHorizontal: VARIABLES.GUTTER
  },
});

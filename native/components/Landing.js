import React from 'react';
import { StyleSheet, Dimensions, TouchableWithoutFeedback, View, Text, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import Button from 'react-native-button';
import { Pages } from 'react-native-pages';
import _ from 'lodash';

import Results from './Results.js';

import { VARIABLES } from '../common/style.js';

export default class Landing extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      gsvWheel: [ 0.7, 3.6, 8, 14, 30 ],
      wheelPosition: 0
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => {
        this.setState({
          wheelPosition: (this.state.wheelPosition + 1) % this.state.gsvWheel.length
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
            We calculate this by accounting several factors including number of people, closeness of interactions, mask wearing, and whether it is outdoors.
          </Text>
          {/* <Text style={styles.textSection}>
            For example, going to a small dinner party might have the same risk as four visits to the grocery store, while going to the beach would be less than one.
          </Text> */}
        </View>

        <View style={styles.right}>
          <Results gsv={this.state.gsvWheel[this.state.wheelPosition]} />
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
                    onPress={() => this.props.onSaveEvent(this.state.factors)}>
              Save
            </Button>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  render() {
    return (
      <Pages>
        {this.renderSlide('What is a GSV?', this.renderGSVContent())}
        {this.renderSlide('item2', null)}
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
});

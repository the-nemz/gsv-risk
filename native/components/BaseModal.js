import React from 'react';
import { StyleSheet, Dimensions, TouchableWithoutFeedback, View, Text, SafeAreaView, Animated, Easing } from 'react-native';
import Button from 'react-native-button';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import Factor from './Factor.js';

import { VARIABLES } from '../common/style.js';

export default class Input extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  renderFactors() {
    let factors = [];
    for (const factor of this.props.factors) {
      if (factor.customizeBase && factor.basePrompt) {
        factors.push(
          <Factor isBase={true} factor={factor} key={factor.id}
                  onFactorInputChange={(factor) => this.props.onFactorBaseChange(factor)} />
        );
      }
    }
    return factors;
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => this.props.onCloseModal()} accessible={false}>
        <SafeAreaView style={styles.baseModal}>
          <View style={styles.content}>
            <Button style={styles.close}
                    onPress={() => this.props.onCloseModal()}>
              <FontAwesomeIcon style={styles.closeIcon} name={'times-circle'} size={22} color={VARIABLES.BLUE_LIGHT} />
            </Button>
            <Text style={styles.heading}>
              What are your grocery store visits like?
            </Text>
            <View style={styles.factors}>
              {this.renderFactors()}
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  baseModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: VARIABLES.BLACK_TRANSPARENT,
    zIndex: 1
  },

  heading: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: VARIABLES.WHITE
  },

  factors: {
    marginTop: VARIABLES.GUTTER
  },

  content: {
    position: 'absolute',
    width: Dimensions.get('window').width - VARIABLES.GUTTER*2,
    left: VARIABLES.GUTTER,
    top: '25%',
    transform: [{translateY: '-50%'}],
    backgroundColor: VARIABLES.BLUE_DARK,
    padding: VARIABLES.GUTTER_MINI*2
  },

  close: {
    position: 'absolute'
  },

  closeIcon: {
    position: 'absolute',
    top: -VARIABLES.GUTTER_MINI*3 - 22,
    right: -VARIABLES.GUTTER_MINI*2
  }
});


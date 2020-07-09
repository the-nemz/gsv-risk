import React from 'react';
import { StyleSheet, Dimensions, TouchableWithoutFeedback, View, Text, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import Button from 'react-native-button';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import _ from 'lodash';

import Factor from './Factor.js';

import { getInputFromFactor } from '../common/_util.js';
import { VARIABLES } from '../common/style.js';

export default class EventModal extends React.Component {

  constructor(props) {
    super(props);
    this.fadeAnim = new Animated.Value(0);
    this.state = {
      showDatePicker: false,
      event: props.event
    };
  }

  componentDidMount() {
    this.fadeIn();
  }

  fadeIn() {
    this.fadeAnim.setValue(0);
    Animated.timing(
      this.fadeAnim,
      {
        toValue: 1,
        duration: 400,
        easing: Easing.ease
      }
    ).start();
  }

  handleChangeDate(date) {
    let event = _.cloneDeep(this.state.event);
    event.timestamp = date.valueOf();
    this.setState({
      event: event,
      showDatePicker: false
    });
  }

  handleFactorInputChange(factor) {
    let event = _.cloneDeep(this.state.event);
    for (const curr of event.factors) {
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
      event: event
    })
  }

  renderDate() {
    const date = new Date(this.state.event.timestamp);

    return (
      <TouchableOpacity style={styles.editDate}
                        onPress={() => this.setState({showDatePicker: true})}>
        <Text style={styles.editDateText}>
          {date.toLocaleDateString('en-US')}
        </Text>
        <FontAwesomeIcon style={styles.editDateIcon} name={'pencil'} size={16} color={VARIABLES.BLUE_LIGHT} />
      </TouchableOpacity>
    );
  }

  renderFactors() {
    let factors = [];
    for (let factor of this.state.event.factors) {
      factors.push(
        <Factor factor={factor} key={factor.id}
                onFactorInputChange={(factor) => this.handleFactorInputChange(factor)} />
      );
    }
    return factors;
  }

  render() {
    const opacity = this.fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    return (
      <TouchableWithoutFeedback onPress={() => this.props.onCloseModal()} accessible={false}>
        <Animated.View style={[styles.eventModal, {opacity: opacity}]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <Button style={styles.close}
                      onPress={() => this.props.onCloseModal()}>
                <FontAwesomeIcon style={styles.closeIcon} name={'times-circle'} size={22} color={VARIABLES.BLUE_LIGHT} />
              </Button>
              <Text style={styles.heading}>
                Edit Event
              </Text>

              {this.renderDate()}

              <View style={styles.factors}>
                {this.renderFactors()}
              </View>

              <Button style={styles.save}
                      onPress={() => this.props.onUpdateEvent(this.state.event)}>
                Save
              </Button>
            </View>
            <DateTimePickerModal isVisible={this.state.showDatePicker} mode="date"
                                 date={new Date(this.state.event.timestamp)}
                                 onConfirm={(date) => this.handleChangeDate(date)}
                                 onCancel={() => this.setState({showDatePicker: false})}
            />
          </SafeAreaView>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  eventModal: {
    backgroundColor: VARIABLES.BLACK_TRANSPARENT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  },

  safeArea: {
    width: '100%',
    height: '100%'
  },

  heading: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: VARIABLES.WHITE
  },

  editDate: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: VARIABLES.GUTTER
  },

  editDateText: {
    marginLeft: VARIABLES.GUTTER_MINI*2,
    fontSize: 20,
    textAlign: 'center',
    color: VARIABLES.BLUE_LIGHT
  },

  editDateIcon: {
    marginLeft: VARIABLES.GUTTER_MINI
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

  save: {
    backgroundColor: VARIABLES.WHITE,
    color: VARIABLES.BLUE_DARK,
    width: 100,
    alignSelf: 'center',
    padding: VARIABLES.GUTTER_MINI,
    marginTop: VARIABLES.GUTTER_MINI
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


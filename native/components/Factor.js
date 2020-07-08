import React from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { Sae } from 'react-native-textinput-effects';
import Select from 'react-native-picker-select';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import { VARIABLES } from '../common/style.js';

const PLACEHOLDER = 'PLACEHOLDER';

export default class Input extends React.Component {

  constructor(props) {
    super(props);
    this.fadeAnim = new Animated.Value(0);
    this.selectAnim = new Animated.Value(0);
    this.state = {
      inputChanging: false
    };
  }

  componentDidMount() {
    this.fadeIn();
    this.animateSelect();
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

  handleInputFocus(value) {
    this.setState({
      input: value,
      inputChanging: true
    });
  }

  handleTextChange(value) {
    this.setState({
      input: value,
      inputChanging: true
    });
  }

  handleKeyPress(e, value) {
    if (e.key === 'Enter') {
      this.handleTextBlur(value);
    }
  }

  handleTextBlur(value) {
    let factor = this.props.factor;
    let finalValue = value || value === 0 ? value : null;
    if (this.props.isBase) {
      factor.baseInput = finalValue;
    } else {
      factor.input = finalValue;
    }
    this.props.onFactorInputChange(factor);
    this.setState({
      input: '',
      inputChanging: false
    });
  }

  handleSelectChange(value) {
    if (value === PLACEHOLDER) {
      return;
    }

    let factor = this.props.factor;
    if (this.props.isBase) {
      factor.baseInput = value;
    } else {
      factor.input = value;
    }
    this.props.onFactorInputChange(factor);
    this.setState({
      input: '',
      inputChanging: false
    });
  }

  handleMenuOpen() {
    this.setState({
      inputChanging: true
    });
  }

  handleMenuClose() {
    this.setState({
      input: '',
      inputChanging: false
    });
  }

  renderPrompt() {
    return (
      <Text style={styles.prompt}>
        {this.props.isBase ? this.props.factor.basePrompt : this.props.factor.prompt}
      </Text>
    );
  }

  renderSelectContent() {
    const inputValue = this.props.isBase ? (this.props.factor.baseInput || this.props.factor.baseValue) : this.props.factor.input;
    let value = null;

    if (inputValue || inputValue === 0) {
      for (const option of this.props.factor.options) {
        if (option.value === inputValue) {
          value = option.value;
          break;
        }
      }
    }

    const fontSize = this.selectAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 12]
    });
    let promptText = this.props.isBase ? this.props.factor.basePrompt : this.props.factor.prompt;
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
        <Select style={selectStyle} value={value} items={this.props.factor.options}
                onOpen={() => {
                  this.setState({ inputChanging: true });
                  if (value === null) {
                    this.animateSelect();
                  }
                }}
                onClose={() => {
                  this.setState({ inputChanging: false })
                }}
                onValueChange={(value) => this.handleSelectChange(value)}
                placeholder={!this.state.inputChanging && value === null ? {label: promptText, value: PLACEHOLDER} : {label: promptText, value: PLACEHOLDER}} />
        {border}
      </View>
    );
  }

  renderNumberContent(value) {
    return (
      <Sae
        label={this.props.isBase ? this.props.factor.basePrompt : this.props.factor.prompt}
        value={value}
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
        onChange={(e) => this.handleTextChange(e.nativeEvent.text)}
        onBlur={(e) => this.handleTextBlur(e.nativeEvent.text)}
      />
    )
  }

  render() {
    const input = this.state.inputChanging ? this.state.input : this.props.factor.input;
    const inputValue = input || input === 0 ? input + '' : '';

    const baseInput = this.state.inputChanging ? this.state.input : this.props.factor.baseInput;
    const baseValue = baseInput || baseInput === 0 ? baseInput + '' : (this.state.inputChanging ? '' : this.props.factor.baseValue + '');

    const value = this.props.isBase ? baseValue : inputValue;

    const content = this.props.factor.options ? this.renderSelectContent() : this.renderNumberContent(value);

    const opacity = this.fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    return (
      <Animated.View style={[styles.factor, {opacity: opacity}]} hasvalue={value ? 'true' : 'false'} ischanging={this.state.inputChanging + ''}>
        {content}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  factor: {
    width: '100%',
    color: VARIABLES.BLUE_LIGHT,
    paddingLeft: 16,
    overflow: 'hidden',
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
  }
});

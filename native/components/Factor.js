import React from 'react';
import { StyleSheet, Keyboard, View, Text, TextInput } from 'react-native';

import { VARIABLES } from '../style/variables.js';

export default class Input extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      inputChanging: false
    };
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
    let factor = this.props.factor;
    if (this.props.isBase) {
      factor.baseInput = value.value;
    } else {
      factor.input = value.value;
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
    // TODO
  }

  renderNumberContent(value) {
    return (
      <View style={styles.label}>
        <TextInput style={styles.input} value={value} //keyboardType={'numeric'}
              onSubmitEditing={Keyboard.dismiss}
              onChange={(e) => this.handleTextChange(e.nativeEvent.text)}
              onBlur={(e) => this.handleTextBlur(e.nativeEvent.text)}>
        </TextInput>
        {this.renderPrompt()}
      </View>
    )
  }

  render() {
    const input = this.state.inputChanging ? this.state.input : this.props.factor.input;
    const inputValue = input || input === 0 ? input + '' : '';

    const baseInput = this.state.inputChanging ? this.state.input : this.props.factor.baseInput;
    const baseValue = baseInput || baseInput === 0 ? baseInput + '' : (this.state.inputChanging ? '' : this.props.factor.baseValue + '');

    const value = this.props.isBase ? baseValue : inputValue;

    // const content = this.props.factor.options ? this.renderSelectContent() : this.renderNumberContent(value);
    const content = this.renderNumberContent(value);
    return (
      <View style={styles.factor} hasvalue={value ? 'true' : 'false'} ischanging={this.state.inputChanging + ''}>
        {content}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  factor: {
    color: VARIABLES.BLUE_LIGHT
  },

  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    color: VARIABLES.WHITE,
    backgroundColor: VARIABLES.BLUE_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // label: {
  //   position: 'relative',
  //   // padding-top: $gutter-mini*2;
  // },

  // prompt: {
  //   position: 'absolute',
  //   textAlign: 'center',
  //   bottom: 0,
  //   width: '100%',
  //   // transition: all $transition-fast;
  // },

  // input: {
  //   width: '50%',
  //   marginLeft: 'auto',
  //   marginRight: 'auto',
  //   textAlign: 'center',
  //   // backgroundColor: 'transparent';
  //   // outline: 0;
  //   // border-bottom: $border-default $blue-light;
  //   // transition: all $transition-fast;
  // }
});

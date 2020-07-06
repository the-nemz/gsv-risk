import React from 'react';
import { StyleSheet, Keyboard, View, Text, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Sae } from 'react-native-textinput-effects';
import Select from 'react-native-picker-select';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import { VARIABLES } from '../style/variables.js';

const PLACEHOLDER = 'PLACEHOLDER';

const FACTOR_ID_TO_ICON = {
  transmission: 'bullseye',
  interactions: 'users',
  masks: 'shield',
  infected: 'line-chart'
}

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

    let promptText = this.props.isBase ? this.props.factor.basePrompt : this.props.factor.prompt;
    let prompt = (
      <Text style={styles.selectPrompt}>
        {promptText}
      </Text>
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

    const iconName = FACTOR_ID_TO_ICON[this.props.factor.id] || 'pencil';
    const icon = (
      <View style={styles.selectIconWrap}>
        <FontAwesomeIcon styles={styles.selectIcon} name={iconName} size={22} color={VARIABLES.BLUE_LIGHT} />
      </View>
    );

    const viewStyle = this.state.inputChanging || value !== null ? [styles.selectWrap, styles.selectWrap_bordered] : [styles.selectWrap];

    return (
      <View style={viewStyle}>
        {this.state.inputChanging || value !== null ? prompt : null}
        <Select style={selectStyle} value={value} items={this.props.factor.options}
                // Icon={() => {
                //   if (value === null) {
                //     const iconName = FACTOR_ID_TO_ICON[this.props.factor.id] || 'pencil';
                //     return <FontAwesomeIcon name={iconName} size={22} color={VARIABLES.BLUE_LIGHT} />;
                //   } else {
                //     return null
                //   }
                // }}
                onOpen={() => {
                  this.setState({ inputChanging: true })
                }}
                onClose={() => {
                  this.setState({ inputChanging: false })
                }}
                onValueChange={(value) => this.handleSelectChange(value)}
                placeholder={!this.state.inputChanging && value === null ? {label: promptText, value: PLACEHOLDER} : {label: promptText, value: PLACEHOLDER}} />
        {/* {value === null ? icon : null} */}
      </View>
    );
  }

  renderNumberContent(value) {
    return (
      <Sae
        label={this.props.isBase ? this.props.factor.basePrompt : this.props.factor.prompt}
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
    return (
      <View style={styles.factor} hasvalue={value ? 'true' : 'false'} ischanging={this.state.inputChanging + ''}>
        {content}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  factor: {
    // flex: 1,
    width: '100%',
    color: VARIABLES.BLUE_LIGHT,
    paddingLeft: 16,
    overflow: 'hidden',
    // display: 'flex',
    // alignItems: 'center'
  },

  // container: {
  //   flex: 1,
  //   display: 'flex',
  //   flexDirection: 'row',
  //   backgroundColor: VARIABLES.BLUE_DARK,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },

  inputWrap: {
    // position: 'relative',
    // paddingTop: VARIABLES.GUTTER_MINI * 2,
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
    // lineHeight: 32,
    color: VARIABLES.BLUE_LIGHT,
    fontWeight: 'normal',
    // position: 'absolute',
    textAlign: 'center',
    // bottom: 0,
    // width: '100%',
    // transition: all $transition-fast;
  },

  input: {
    fontSize: 24,
    lineHeight: 32,
    color: VARIABLES.BLUE_LIGHT,
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    // backgroundColor: 'transparent';
    // outline: 0;
    // border-bottom: $border-default $blue-light;
    // transition: all $transition-fast;
  },

  selectWrap: {
    display: 'flex',
    flexDirection: 'column',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2
  },

  selectWrap_bordered: {
    borderBottomColor: VARIABLES.BLUE_LIGHT
  },

  selectPrompt: {
    fontSize: 12,
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

import React from 'react';
import Select from 'react-select';

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
      <div className="Factor-prompt">
        {this.props.isBase ? this.props.factor.basePrompt : this.props.factor.prompt}
      </div>
    );
  }

  renderSelectContent() {
    const inputValue = this.props.isBase ? (this.props.factor.baseInput || this.props.factor.baseValue) : this.props.factor.input;
    let value = null;

    if (inputValue || inputValue === 0) {
      for (const option of this.props.factor.options) {
        if (option.value === inputValue) {
          value = option;
          break;
        }
      }
    }

    return (
      <label className="Factor-label">
        <Select className="Factor-input Factor-input--select" classNamePrefix="Select"
                options={this.props.factor.options} value={value}
                onMenuOpen={() => this.handleMenuOpen()} onMenuClose={() => this.handleMenuClose()}
                onChange={(values) => this.handleSelectChange(values)} />
        {this.renderPrompt()}
      </label>
    )
  }

  renderNumberContent(value) {
    return (
      <label className="Factor-label">
        <input className={`Factor-input Factor-input--number`}
              type="number" value={value}
              onFocus={(e) => this.handleTextChange(e.target.value)}
              onChange={(e) => this.handleTextChange(e.target.value)}
              onKeyPress={(e) => this.handleKeyPress(e, value)}
              onBlur={(e) => this.handleTextBlur(e.target.value)}>
        </input>
        {this.renderPrompt()}
      </label>
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
      <div className="Factor" hasvalue={value ? 'true' : 'false'} ischanging={this.state.inputChanging + ''}>
        {content}
      </div>
    );
  }
}

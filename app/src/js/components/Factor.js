import React from 'react';
import Select from 'react-select';

export default class Input extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      inputChanging: false
    };
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
    factor.input = value || value === 0 ? value : null;
    this.props.onFactorInputChange(factor);
    this.setState({
      input: '',
      inputChanging: false
    });
  }

  handleSelectChange(value) {
    let factor = this.props.factor;
    factor.input = value.value;
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

  renderSelectContent() {
    let value = null;
    if (this.props.factor.input || this.props.factor.input === 0) {
      for (const option of this.props.factor.options) {
        if (option.value === this.props.factor.input) {
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
        <div className="Factor-prompt">
          {this.props.factor.prompt}
        </div>
      </label>
    )
  }

  renderNumberContent(value) {
    return (
      <label className="Factor-label">
        <input className={`Factor-input Factor-input--number`}
              type="number" value={value}
              onChange={(e) => this.handleTextChange(e.target.value)}
              onKeyPress={(e) => this.handleKeyPress(e, value)}
              onBlur={(e) => this.handleTextBlur(e.target.value)}>
        </input>
        <div className="Factor-prompt">
          {this.props.factor.prompt}
        </div>
      </label>
    )
  }

  render() {
    const input = this.state.inputChanging ? this.state.input : this.props.factor.input;
    const type = this.props.factor.type ? this.props.factor.type : 'text';
    const value = input || input === 0 ? input + '' : '';

    const content = this.props.factor.options ? this.renderSelectContent() : this.renderNumberContent(value);
    return (
      <div className="Factor" hasvalue={value ? 'true' : 'false'} ischanging={this.state.inputChanging + ''}>
        {content}
      </div>
    );
  }
}

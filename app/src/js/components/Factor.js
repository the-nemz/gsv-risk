import React from 'react';

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

  handleTextBlur(value) {
    let factor = this.props.factor;
    factor.input = value || value === 0 ? value : null;
    this.props.onFactorInputChange(factor);
    this.setState({
      input: '',
      inputChanging: false
    });
  }

  render() {
    const input = this.state.inputChanging ? this.state.input : this.props.factor.input;
    const type = this.props.factor.type ? this.props.factor.type : 'text'
    return (
      <div className="Factor">
        <label className="Factor-label">
          <input className={`Factor-input Factor-input--${type}`} type={type}
                value={input ? input : ''} hasvalue={input || input === 0 ? 'true' : 'false'}
                onChange={(e) => this.handleTextChange(e.target.value)}
                onBlur={(e) => this.handleTextBlur(e.target.value)}>
          </input>
          <div className="Factor-prompt">
            {this.props.factor.prompt}
          </div>
        </label>
      </div>
    );
  }
}

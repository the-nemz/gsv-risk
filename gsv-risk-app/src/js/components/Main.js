import React from 'react';

import '../polyfill.js';

import App from '../../App';

export default class Main extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }


  render() {
    return (
      <div className="Main">
        <App />
      </div>
    );
  }
}

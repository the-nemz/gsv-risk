import React from 'react';

import { MAX_GSV } from '../util.js';

const RED_GSV = 25; // GSV value at which point bar color should be fully red
const RED_HUE = 9;
const GREEN_HUE = 123;

export default class Results extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      gsv: 1
    };
  }

  fractionToColor(frac) {
    var hue = (frac * (RED_HUE - GREEN_HUE)) + GREEN_HUE;
    return `hsl(${hue}, 100%, 43%)`;
  }

  gsvToColor(gsv) {
    let frac = this.calculateLogFraction(gsv, RED_GSV);
    return this.fractionToColor(frac)
  }

  calculateLogFraction(gsv, maxGsv = MAX_GSV) {
    return Math.log10(Math.min(gsv + 1, maxGsv)) / Math.log10(maxGsv);
  }

  getGsvText(gsv) {
    if (gsv === 50) {
      return `${gsv}+`;
    } else if (gsv === 0.1) {
      return `< ${gsv}`;
    } else if (gsv < 5) {
      return gsv.toFixed(1);
    } else {
      return gsv.toFixed(0);
    }
  }

  render() {
    let gsv = this.props.gsv || this.state.gsv;
    const heightPercent = `${100 * this.calculateLogFraction(gsv)}%`;
    const color = this.gsvToColor(gsv);
    return (
      <div className="Results">
        <div className="Results-bar" style={{height: heightPercent, backgroundColor: color}}>
          <div className="Results-num">
            {this.getGsvText(gsv)}
          </div>
        </div>
      </div>
    );
  }
}

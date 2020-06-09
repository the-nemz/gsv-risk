import React from 'react';

import { getGsvText, calculateLogFraction, gsvToColor } from '../util.js';

export default class Results extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      gsv: 1
    };
  }

  // gsvToColor(gsv) {
  //   let frac = this.calculateLogFraction(gsv, RED_GSV);
  //   var hue = (frac * (RED_HUE - GREEN_HUE)) + GREEN_HUE;
  //   return `hsl(${hue}, 100%, 43%)`;
  // }

  // calculateLogFraction(gsv, maxGsv = MAX_GSV) {
  //   return Math.log10(Math.min(gsv + 1, maxGsv)) / Math.log10(maxGsv);
  // }

  render() {
    let gsv = this.props.gsv || this.state.gsv;
    const heightPercent = `${100 * calculateLogFraction(gsv)}%`;
    const color = gsvToColor(gsv);
    return (
      <div className="Results">
        <div className="Results-bar" style={{height: heightPercent, backgroundColor: color}}>
          <div className="Results-num">
            {getGsvText(gsv)}
          </div>
        </div>
      </div>
    );
  }
}

import React from 'react';
import { Helmet } from 'react-helmet';

import { calculateGsv, getGsvText } from '../_util.js';

export default class Meta extends React.Component {

  constructor(props) {
    super(props);
  }

  getDescription(factors, gsv) {
    let textFactors = []
    for (const factor of factors) {
      if (factor.input !== null) {
        if (factor.options) {
          for (const option of factor.options) {
            if (option.value === factor.input) {
              textFactors.push(option.label.toLowerCase());
            }
          }
        } else {
          textFactors.push(factor.meta.replace('[INPUT]', factor.input));
        }
      }
    }

    let allTextFactors = '';
    if (textFactors.length === 1) {
      allTextFactors = textFactors[0];
    } else if (textFactors.length === 2) {
      allTextFactors = `${textFactors[0]} and ${textFactors[1]}`;
    } else if (textFactors.length >= 3) {
      allTextFactors = `${textFactors.slice(0, -1).join(', ')}, and ${textFactors[textFactors.length - 1]}`;
    }

    return `GSV Risk | An event with ${allTextFactors} has COVID-19 risk comparable to ${getGsvText(gsv)} grocery store visits.`;
  }

  render() {
    let title = 'Grocery Store Visits | Calculate COVID-19 risk in terms we all know - going to the grocery store.';
    let description = 'GSV Risk is a web application that allows you to approximate an event\'s COVID-19 risk in units we all know - grocery store visits.';
    let logoPath = `${this.props.host}/images/default.svg`;

    if (!this.props.useDefaults) {
      let gsv = calculateGsv(this.props.factors);
      title = `GSV Risk | ${getGsvText(gsv)} grocery store visits!`;
      description = this.getDescription(this.props.factors, gsv);

      if (gsv < 4.95) {
        logoPath = `${this.props.host}/images/${gsv.toFixed(1)}.svg`;
      } else {
        logoPath = `${this.props.host}/images/${gsv.toFixed(0)}.svg`;
      }
    }

    return (
      <Helmet
        title={title}
        meta={[
          {
            name: 'og:site_name',
            content: 'GSV Risk'
          },
          {
            name: 'og:title',
            content: title
          },
          {
            name: 'description',
            content: description
          },
          {
            name: 'og:description',
            content: description
          },
          {
            name: 'og:image',
            content: logoPath
          }
        ]}
      />
    );
  }
}

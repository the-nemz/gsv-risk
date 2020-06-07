import React from 'react';
import { Helmet } from 'react-helmet';

export default class Meta extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Helmet
        title="Grocery Store Visits | Calculate COVID-19 risk in terms we all know - going to the grocery store."
        meta={[
          {
            name: 'og:site_name',
            content: 'GSV Risk'
          },
          {
            name: 'og:title',
            content: 'Grocery Store Visits | Calculate COVID-19 risk in terms we all know - going to the grocery store.'
          },
          {
            name: 'description',
            content: 'GSV Risk is a web application that allows you to approximate an event\'s COVID-19 risk in units we all know - grocery store visits.'
          },
          {
            name: 'og:description',
            content: 'GSV Risk is a web application that allows you to approximate an event\'s COVID-19 risk in units we all know - grocery store visits.'
          }
        ]}
      />
    );
  }
}

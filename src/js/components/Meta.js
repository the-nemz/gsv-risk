import React from 'react';

export default class Meta extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const facts = this.props.facts.map((fact, i) => {
      return <li key={i}>{fact.text}</li>
    });
    return (
      <title>LMAO Could this work??</title>
    );
  }
}

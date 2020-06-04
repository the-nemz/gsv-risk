import React from 'react';

export default class Main extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const facts = this.props.facts.map((fact, i) => {
      return <li key={i}>{fact.text}</li>
    });
    return (
      <ul>
        {facts}
      </ul>
    );
  }
}

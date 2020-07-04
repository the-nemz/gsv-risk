import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import _ from 'lodash';

import { VARIABLES } from '../style/variables.js';

export default class History extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  render() {
    return (
      <View style={styles.history}>
        <Text style={{color: VARIABLES.WHITE}}>
          No saved history
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  history: {
    flex: 1,
    backgroundColor: VARIABLES.BLUE_DARK,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

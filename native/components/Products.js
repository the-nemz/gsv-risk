import React from 'react';
import { StyleSheet, Dimensions, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { ProductAdvertising } from 'paapi5-nodejs-sdk';
import _ from 'lodash';

import { VARIABLES } from '../common/style.js';

const PRODUCT_IDS = ['059035342X', 'B00X4WHP5E', 'B00ZV9RDKK'];

export default class Products extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.history}>
          <View>
            <Text style={styles.title}>
              COVID-19 Products
            </Text>
          </View>
          <View style={styles.main}>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  history: {
    flex: 1,
    backgroundColor: VARIABLES.BLUE_DARK,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },

  title: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: VARIABLES.GUTTER_MINI,
    color: VARIABLES.WHITE
  },

  main: {
    flexGrow: 1,
    paddingBottom: VARIABLES.GUTTER*3
  }
});

import React from 'react';
import { StyleSheet, Keyboard, View, Text, Animated, Easing } from 'react-native';
import _ from 'lodash';
import Svg, { G, Path } from 'react-native-svg';

import { VARIABLES } from '../style/variables.js';

import {
  getGsvText, calculateLogFraction, gsvToColor, getRandomInt,
  RED_GSV, RED_HUE, GREEN_HUE
} from '../_util.js';

const MAX_LAT = 102;
const BAR_WIDTH = VARIABLES.GUTTER_MINI*6;

export default class Results extends React.Component {

  constructor(props) {
    super(props);
    this.virusAnim = new Animated.Value(0);
    this.barAnim = new Animated.Value(0);
    this.heightPercent = `0%`;
    this.state = {
      viruses: [],
      nextVirusId: 0
    };
  }

  componentDidMount() {
    this.moveCoronas();
    this.animateBar();
    this.timerID = setInterval(
      () => this.updateCoronas(),
      500
    );
  }

  moveCoronas() {
    this.virusAnim.setValue(0);
    Animated.timing(
      this.virusAnim,
      {
        toValue: 1,
        duration: 500,
        easing: Easing.linear
      }
    ).start();
  }

  animateBar() {
    this.barAnim.setValue(0);
    Animated.timing(
      this.barAnim,
      {
        toValue: 1,
        duration: 400,
        easing: Easing.linear
      }
    ).start();
  }

  updateCoronas() {
    const coronaHSLObjectFromFrac = (frac) => {
      var hue = (frac * (RED_HUE - GREEN_HUE)) + GREEN_HUE;
      return { h: hue, s: 100, l: getRandomInt(100) };
    }

    const coronaMaxSizeFromFrac = (frac) => {
      // Max size is max of 20 * frac and 4 (note: 2 is added after this is called)
      return Math.max(Math.round(20 * frac), 4);
    }

    const gsv = this.props.gsv;
    const frac = calculateLogFraction(gsv, RED_GSV);
    let viruses = _.cloneDeep(this.state.viruses);

    _.remove(viruses, (v) => {
      // Remove if lat is beyond the top or if size is too large (because GSV decreased)
      return v.lat > MAX_LAT || v.size > coronaMaxSizeFromFrac(frac) + 2;
    });

    for (const virus of viruses) {
      if (virus.size === 1) {
        // All viruses start at size = 1 and grow on first movement
        virus.size = getRandomInt(coronaMaxSizeFromFrac(frac)) + 2
      }
      virus.latPrev = virus.lat;
      virus.lat += virus.speed;
      if (virus.lat > MAX_LAT) {
        // Decrease size when virus passes top of bar
        virus.size = 0
      }
      virus.color.h = coronaHSLObjectFromFrac(frac).h
    }

    if (Math.random() < calculateLogFraction(gsv)) {
      let newVirus = {
        id: this.state.nextVirusId,
        color: coronaHSLObjectFromFrac(frac),
        latPrev: 0,
        lat: 0,
        lng: getRandomInt(BAR_WIDTH*1.1) - BAR_WIDTH*0.05, // [-5, 105)% of BAR_WDITH allows virsuses to be slightly outside bar
        size: 1,
        speed: (getRandomInt(12) / 4) + 1.5 // [1.5, 4.5) in 0.25 intervals
      }
      viruses.push(newVirus)

      this.setState({
        viruses: viruses,
        nextVirusId: newVirus.id + 1
      });
    } else {
      this.setState({
        viruses: viruses
      });
    }
  }

  renderVirusSVG(color) {
    return (
      <Svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="100%" height="100%" viewBox="0 0 900.000000 900.000000" preserveAspectRatio="xMidYMid meet">
        <G transform="translate(0.000000,900.000000) scale(0.100000,-0.100000)" fill={`hsl(${color.h}, ${color.s}%, ${color.l}%)`} stroke="none">
          <Path d="M3415 8604 c-123 -17 -336 -90 -504 -173 -172 -84 -241 -187 -197 -292 26 -61 86 -97 186 -109 172 -22 316 -172 374 -390 37 -140 49 -178 75 -247 33 -85 33 -86 -69 -128 -36 -15 -69 -31 -74 -36 -19 -18 -56 -10 -65 14 -14 36 -72 90 -119 111 -41 19 -45 19 -100 2 -140 -43 -271 -135 -312 -221 -20 -40 -21 -51 -11 -90 6 -24 11 -48 11 -54 0 -6 -33 -32 -72 -57 -40 -26 -84 -58 -98 -70 -99 -90 -126 -114 -135 -114 -13 0 -136 126 -189 193 -51 65 -98 134 -120 177 -20 39 -56 196 -56 242 0 17 -10 62 -21 100 -16 52 -32 81 -60 109 -36 36 -43 39 -97 39 -166 0 -457 -177 -565 -344 -71 -109 -85 -233 -36 -331 37 -73 63 -83 165 -62 113 23 204 22 252 -3 73 -40 382 -349 382 -383 0 -7 -15 -28 -33 -47 -63 -69 -134 -157 -212 -260 -43 -58 -81 -109 -85 -113 -9 -11 -56 10 -102 45 -49 38 -77 100 -88 194 -7 64 -13 82 -31 97 -57 46 -189 -14 -279 -126 -78 -96 -150 -268 -150 -356 0 -50 40 -107 81 -116 34 -8 121 0 183 17 45 11 108 -2 164 -35 29 -17 32 -23 26 -51 -3 -17 -12 -38 -20 -47 -8 -8 -14 -20 -14 -25 0 -8 -47 -112 -72 -158 -6 -11 -14 -31 -18 -45 -5 -14 -18 -51 -30 -81 -47 -122 -52 -136 -60 -170 -4 -19 -13 -48 -19 -65 -6 -16 -13 -42 -16 -56 -2 -15 -11 -29 -19 -32 -8 -3 -56 3 -107 14 -50 10 -104 19 -118 19 -39 0 -124 32 -162 62 -19 14 -41 41 -50 59 -9 19 -31 64 -49 101 -35 74 -75 108 -127 108 -58 0 -170 -102 -209 -190 -64 -144 -91 -349 -61 -461 23 -88 93 -149 169 -149 40 0 119 41 182 94 77 66 126 96 155 96 25 0 94 -21 129 -39 9 -5 36 -16 60 -25 99 -37 122 -50 122 -65 0 -9 -7 -65 -16 -125 -13 -88 -15 -164 -11 -400 3 -160 9 -308 13 -330 6 -37 6 -38 -17 -31 -13 5 -58 33 -99 64 -98 73 -125 88 -181 96 -127 19 -199 -50 -244 -233 -40 -166 24 -406 160 -596 103 -144 155 -178 218 -144 12 7 77 66 143 132 67 65 127 117 134 114 7 -2 25 -40 40 -83 15 -44 35 -100 44 -125 9 -25 21 -57 25 -71 5 -14 13 -34 18 -45 6 -10 17 -35 25 -54 9 -19 36 -77 62 -128 44 -90 54 -122 39 -122 -5 -1 -37 -28 -72 -60 -101 -93 -133 -106 -271 -102 -146 3 -202 -10 -241 -57 -39 -48 -44 -81 -23 -169 52 -223 259 -452 407 -452 81 0 147 71 187 203 12 39 29 90 38 112 33 84 140 225 170 225 10 -1 56 -53 105 -119 126 -169 313 -367 474 -504 40 -34 73 -67 73 -74 0 -6 -13 -32 -30 -56 -16 -25 -30 -48 -30 -53 0 -4 -9 -27 -21 -50 -31 -66 -73 -96 -162 -118 -92 -23 -133 -58 -161 -136 -22 -61 -18 -97 21 -176 28 -58 105 -132 163 -156 116 -49 224 -78 289 -78 49 0 112 20 140 44 31 27 61 92 61 135 0 18 -7 61 -17 95 -9 34 -16 100 -17 151 0 75 4 97 22 132 29 53 44 58 90 30 20 -13 44 -27 52 -30 8 -4 29 -16 45 -26 31 -20 275 -142 333 -167 18 -7 47 -20 65 -27 51 -23 110 -45 136 -53 13 -3 39 -13 58 -20 33 -14 33 -15 19 -43 -17 -31 -118 -128 -150 -142 -103 -46 -214 -138 -245 -203 -50 -109 -13 -167 193 -301 173 -112 284 -155 402 -155 153 0 261 56 337 174 29 46 31 56 32 141 0 104 -16 152 -75 225 -72 89 -109 163 -87 177 16 9 80 5 162 -11 83 -17 340 -36 480 -36 127 0 344 16 460 35 164 26 195 28 196 13 3 -37 -4 -87 -17 -117 -8 -18 -14 -40 -14 -47 0 -8 -13 -42 -29 -76 -54 -119 -60 -151 -39 -221 15 -49 88 -123 143 -145 87 -33 217 -26 350 19 17 6 44 15 60 19 85 24 212 86 256 126 19 16 50 49 69 74 34 43 35 46 35 135 -1 106 -18 147 -94 221 -41 41 -208 134 -240 134 -5 0 -13 4 -16 10 -6 10 16 22 195 96 115 48 139 60 280 137 109 59 246 147 394 252 26 19 52 35 56 35 15 0 134 -148 167 -207 46 -81 46 -162 2 -260 -25 -53 -32 -83 -33 -135 -1 -60 2 -70 30 -104 37 -46 113 -86 174 -92 54 -5 174 25 257 64 117 55 245 171 296 268 50 96 60 137 61 256 1 105 -1 118 -22 147 -12 17 -37 39 -55 48 -42 22 -159 55 -195 55 -43 0 -168 44 -213 76 -63 43 -149 136 -149 159 1 11 32 53 71 94 101 106 175 199 317 396 16 22 59 91 96 153 37 61 71 112 75 112 5 0 14 -7 21 -15 7 -8 16 -15 21 -15 31 0 214 -133 278 -203 47 -50 51 -57 91 -134 55 -107 126 -173 187 -173 79 0 253 78 320 145 56 55 131 258 154 418 10 72 10 98 -1 140 -21 81 -42 103 -114 117 -54 10 -68 9 -121 -10 -202 -70 -265 -74 -346 -20 -24 16 -62 42 -84 57 -51 34 -150 83 -168 83 -8 0 -22 9 -32 21 -17 18 -17 24 -6 52 7 18 18 49 23 70 6 21 24 50 41 65 98 86 124 127 151 234 15 61 15 69 0 115 -9 26 -25 59 -36 72 -16 21 -18 35 -13 95 10 117 25 209 37 223 18 22 237 17 323 -7 93 -26 143 -44 157 -58 7 -7 17 -12 23 -12 7 0 31 -14 53 -30 23 -17 45 -30 50 -30 4 0 13 -5 19 -11 7 -7 35 -20 63 -30 49 -17 52 -17 115 3 89 27 126 54 154 113 35 73 52 155 58 283 5 100 3 119 -17 172 -23 61 -56 104 -103 133 -38 25 -142 57 -182 57 -38 0 -101 -43 -168 -116 -30 -32 -68 -60 -100 -74 -47 -21 -61 -22 -152 -15 -55 4 -143 10 -195 14 l-95 6 -12 100 c-6 55 -15 143 -19 195 l-6 95 33 14 c42 18 106 76 127 115 77 142 70 340 -15 455 -72 98 -180 136 -267 95 -41 -20 -62 -14 -77 23 -12 29 -20 49 -64 148 -42 95 -68 146 -98 199 -36 63 -33 84 18 102 79 29 141 45 190 50 45 5 59 1 140 -42 89 -47 91 -47 185 -47 96 0 121 7 186 53 32 23 54 74 54 127 0 63 -23 202 -38 230 -7 12 -12 29 -12 38 0 20 -84 192 -105 215 -8 9 -15 20 -15 24 0 16 -151 205 -210 263 -82 80 -132 101 -206 83 -41 -10 -65 -24 -98 -57 -63 -62 -84 -109 -131 -293 -34 -130 -71 -200 -137 -252 -63 -51 -101 -64 -139 -48 -56 23 -88 122 -52 162 24 27 23 125 -2 164 -45 70 -154 167 -235 209 -33 17 -136 18 -171 2 -10 -5 -25 1 -43 18 -15 14 -72 59 -127 101 -54 41 -99 79 -99 84 0 8 56 97 101 162 10 15 19 29 19 32 0 10 99 151 127 181 67 72 160 125 221 125 43 1 107 35 136 72 70 92 -7 250 -189 389 -33 25 -67 49 -75 52 -8 4 -28 16 -45 27 -115 74 -241 119 -330 119 -130 0 -151 -53 -124 -311 6 -57 17 -120 25 -141 8 -20 14 -52 14 -70 0 -65 -70 -265 -120 -342 -10 -16 -29 -50 -42 -74 -12 -24 -28 -45 -34 -48 -6 -2 -38 9 -70 26 -33 16 -85 41 -117 55 l-57 27 6 69 c9 98 -8 153 -66 211 -69 69 -148 93 -307 93 -119 1 -122 0 -164 -29 -35 -25 -46 -41 -64 -95 l-22 -65 -74 3 c-123 6 -132 13 -118 107 5 33 14 125 18 205 15 225 45 364 93 420 7 9 42 38 78 65 73 55 90 74 108 124 21 60 -13 131 -83 169 -55 30 -148 42 -370 49 -209 5 -223 5 -266 -15 -57 -26 -97 -78 -105 -134 -10 -77 26 -123 118 -148 72 -20 117 -99 118 -205 0 -66 -17 -239 -35 -345 -8 -47 -17 -107 -20 -134 -3 -27 -12 -60 -21 -73 -13 -21 -21 -24 -72 -21 -55 3 -58 4 -74 40 -26 55 -78 78 -173 78 -45 0 -90 -6 -112 -15 -19 -8 -44 -15 -54 -15 -21 0 -89 -56 -89 -74 0 -35 -73 -63 -206 -81 -48 -6 -52 -5 -70 22 -28 42 -54 122 -54 168 0 22 -7 65 -15 95 -8 30 -15 72 -15 93 0 21 -8 52 -17 70 -12 24 -16 58 -16 142 0 108 1 111 45 210 80 180 82 286 6 348 -32 25 -45 29 -114 32 -44 2 -92 1 -109 -1z" />
        </G>
      </Svg>
    );
  }

  renderViruses(heightPercent) {
    let viruses = [];
    for (const virus of this.state.viruses) {
      const distance = this.virusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [`${virus.latPrev}%`, `${virus.lat}%`]
      });
      const virusStyle = {
        position: 'absolute',
        bottom: distance,
        left: virus.lng - virus.size/2,
        width: virus.size,
        height: virus.size,
      }
      viruses.push(
        <Animated.View key={virus.id} style={virusStyle}>
          {this.renderVirusSVG(virus.color)}
        </Animated.View>
      );
    }
    this.moveCoronas();
    return viruses;
  }

  render() {
    let gsv = this.props.gsv;
    const heightPercent = `${100 * calculateLogFraction(gsv)}%`;
    // const heightPercent = 100 * calculateLogFraction(gsv);
    const color = gsvToColor(gsv);
    const height = this.barAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [this.heightPercent, heightPercent]
    });

    let barStyle = {
      height: height,
      backgroundColor: color
    };

    this.heightPercent = heightPercent;
    this.animateBar();

    return (
      <View style={styles.results}>
        <Animated.View style={[styles.bar, barStyle]}>
          <Text style={styles.num} numberOfLines={1}>
            {getGsvText(gsv)}
          </Text>
          <Text style={styles.label}>
            Grocery Store Visits
          </Text>
          {this.renderViruses()}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  results: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '50%'
  },

  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    transform: [{translateX: -BAR_WIDTH/2}],
    width: BAR_WIDTH
  },

  num: {
    fontSize: 32,
    lineHeight: 48,
    color: VARIABLES.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    bottom: '100%',
    width: '100%',
    zIndex: 1
  },

  label: {
    fontSize: 12,
    lineHeight: 16,
    color: VARIABLES.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    top: '100%',
    width: '100%',
    zIndex: 1
  }
});

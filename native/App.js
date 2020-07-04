import React from 'react';
import { Pages } from 'react-native-pages';

import Main from './components/Main.js';
import History from './components/History.js';

export default function App() {
  return (
    <Pages>
      <Main />
      <History />
    </Pages>
  );
}

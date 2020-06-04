import React from 'react';
import ReactDOM from 'react-dom';

import Main from './js/components/Main.js';
import getFacts from './js/facts.js';

getFacts().then(facts => {
  ReactDOM.render(<Main facts={facts} />, document.getElementById('root'));
})

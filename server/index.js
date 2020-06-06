import React from 'react';
import ReactDOM from 'react-dom';

import Meta from './js/components/Meta.js';
import getFacts from './js/facts.js';

getFacts().then(facts => {
  ReactDOM.render(<Meta facts={facts} />, document.getElementById('root'));
})

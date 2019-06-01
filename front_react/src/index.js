import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from "react-router-dom"

import axios from 'axios';

import {start} from './actions/func'
import {APIURL} from './util'

import './styles/index.css';
import App from './App';


axios.defaults.headers.common['Access-Control-Request-Headers'] = null
axios.defaults.headers.common['Access-Control-Request-Method'] = null

start();


ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

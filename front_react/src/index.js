import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from "react-router-dom"

import { createMuiTheme, withStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import {start} from './actions/func';
import './styles/index.css';
import App from './App';

start();

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#f5f5f5'
    },
    secondary: {
      main: '#9c27b0'
    } 
  },
  status: {
    danger: 'orange',
  },
});


ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MuiThemeProvider>, 
document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
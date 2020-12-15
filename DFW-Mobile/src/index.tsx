import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './resources/mobile.css';
import * as serviceWorker from './serviceWorker';
import MainPage from './components/mainpage';
import Admin from './components/admin';
import E404 from './components/404';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'


const ALL = (
  <Router>
    <Switch>
      <Route exact path="/"><MainPage/></Route>
      <Route exact path="/admin"><Admin/></Route>
      <Route><E404/></Route>
    </Switch>
  </Router>
);

ReactDOM.render(
  ALL,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

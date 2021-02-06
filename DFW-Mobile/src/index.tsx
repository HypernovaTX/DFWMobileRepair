import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './resources/mobile.css';
import * as serviceWorker from './serviceWorker';
import MainPage from './components/mainpage';
import Quote from './components/quote';
import Admin from './components/admin';
import E404 from './components/404';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';

function helmet(title: string, urltext: string, info: string) {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <meta name="description" content={info} />
      <link rel="canonical" href={`https://dfwmobilerepair.com/${urltext}`} />
    </Helmet>
  );
}

const ALL = (
  <Router>
    <Switch>
      <Route exact path="/">
        {helmet('DFW Mobile Repair - Home', '', 'Dallas Fort Worth Mobile Mechanic - We come to you!')}
        <MainPage/>
      </Route>
      <Route exact path="/quote">
        {helmet('DFW Mobile Repair - Quotes', '', 'Get an estimated quote for the service needed for your car!')}
        <Quote/>
      </Route>
      <Route exact path="/admin">
        {helmet('DFW Mobile Repair - Admin CP', '', 'Admin Control Panel - Manages users and quotes.')}
        <Admin/>
      </Route>
      <Route>
      {helmet('DFW Mobile Repair - NOT FOUND', '', '404 - Page not found!')}
        <E404/>
      </Route>
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

import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import Login from './Login/Login';
import App from '../containers/App';

function logPageView() {
  window.googleAnalytics.set({ page: window.location.pathname });
  window.googleAnalytics.pageview(window.location.pathname);
}

export default class Auth extends Component {

  render() {
    return (
      <Router onUpdate={logPageView}>
        {this.props.user ?
          <Switch>
            <Redirect from="/login" to="/" />
            <Route path="/" component={App} />
          </Switch>
          :
          <Switch>
            <Route path="/login" component={Login} />
            <Redirect to="/login" />
          </Switch>
        }
      </Router>
    );
  }

}

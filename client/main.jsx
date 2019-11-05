import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { render } from 'react-dom';
import Auth from '../imports/ui/containers/Auth';
import ga from 'react-ga';

Meteor.startup(() => {
  ga.initialize('UA-104394589-1');
  window.googleAnalytics = ga;

  Accounts.onLogin(() => {
    if (Meteor.user().services) {
      window.googleAnalytics.event({
        category: 'User',
        action: 'Logged in',
        label: Meteor.user().services.google.name,
      });
    }
  });

  render(<Auth />, document.getElementById('app'));
});

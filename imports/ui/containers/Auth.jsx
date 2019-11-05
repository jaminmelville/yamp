import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import Auth from '../components/Auth';

class AuthContainer extends Component {

  render() {
    if (this.props.loading) {
      return (<div>Loading...</div>);
    }
    else {
      return (
        <Auth
          user={this.props.user}
        />
      );
    }
  }
}

export default createContainer(() => {
  const handle = Meteor.subscribe('user');
  const loading = !handle.ready();
  let user;
  if (!loading) {
    user = Meteor.user();
  }
  return {
    loading,
    user,
  };
}, AuthContainer);

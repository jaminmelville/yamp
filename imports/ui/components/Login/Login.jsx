import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button/Button';

export default class Login extends Component {

  render() {
    return (
      <div className="login">
        <div className="login__content">
          <h1 className="login__title">Yamp</h1>
          <h2 className="login__subtitle">How music should look</h2>
          <div className="login__button">
            <Button
              size="large"
              onClick={() => {
                Meteor.loginWithGoogle((err) => {
                  console.log(err)
                });
              }}
            >
              Begin
            </Button>
          </div>
        </div>
        <a className="login__contact" href="mailto:benmelville87+yamp@gmail.com">contact</a>
      </div>
    );
  }

}

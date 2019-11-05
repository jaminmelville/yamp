import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export default class Button extends Component {

  render() {
    return (
      <div
        className={classNames('button', {
          'button--large': this.props.size === 'large',
        })}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </div>
    );
  }

}

Button.propTypes = {
  size: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  size: '',
  onClick: () => {},
};

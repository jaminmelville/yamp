import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export default class Cover extends Component {

  render() {
    const hasCoverArt = this.props.release['cover-art-archive'][0].artwork[0] === 'true';
    return (
      <div
        className={classNames('cover', {
          'cover--focused': this.props.focused,
        })}
        style={{ height: this.props.size, width: this.props.size }}
        onClick={this.props.onClick}
      >
        {hasCoverArt ?
          <div
            className="cover__image"
            title={this.props.release.title[0]}
            style={{
              backgroundImage: `url(https://coverartarchive.org/release/${this.props.release['@'].id}/front-250)`,
            }}
          />
          :
          <div className="cover__text">
            {this.props.release.title[0]}
          </div>
        }
      </div>
    );
  }
}

Cover.propTypes = {
  size: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  focused: PropTypes.bool.isRequired,
  release: PropTypes.object.isRequired,
};

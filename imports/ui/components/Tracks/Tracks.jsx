import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export default class Tracks extends Component {

  render() {
    const tracks = this.props.tracks.map((track, index) => (
      <li key={`${track['@'].id}${index}`} className="tracks__item">
        <i
          className={`tracks__button fa fa-${this.props.icon}`}
          onClick={() => {
            this.props.onButtonClick(track, index);
          }}
        />
        <a
          className={classNames('tracks__name', {
            'tracks__name--active': track === this.props.active,
          })}
          onClick={() => {
            this.props.onNameClick(track);
          }}
          title={track.recording[0].title[0]}
        >
          {track.recording[0].title[0]}
        </a>
      </li>
    ));
    return (
      <div className={classNames('tracks', `tracks--${this.props.align}`)}>
        <div>
          <div className="tracks__heading" title={this.props.heading}>
            {this.props.heading}
          </div>
          <div className="tracks__sub-heading" title={this.props.subHeading}>
            {this.props.subHeading}
          </div>
          <ul>
            {tracks}
          </ul>
        </div>
      </div>
    );
  }

}

Tracks.propTypes = {
  tracks: PropTypes.array.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  onNameClick: PropTypes.func,
  active: PropTypes.object.isRequired,
  heading: PropTypes.string.isRequired,
  subHeading: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  align: PropTypes.string.isRequired,
};

Tracks.defaultProps = {
  onNameClick: () => {},
};

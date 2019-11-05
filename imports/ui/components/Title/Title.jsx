import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Title extends Component {

  render() {
    const recordingName = this.props.track.recording[0].title[0];
    const releaseName = this.props.track.release.title[0];
    const artistName = this.props.track.release.artist.name[0];
    return (
      <div className="title">
        {recordingName} | {releaseName} | {artistName}
      </div>
    );
  }

}

Title.propTypes = {
  track: PropTypes.object.isRequired,
};

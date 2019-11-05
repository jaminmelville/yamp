import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Artists } from '../../../api/Artists';

export default class Track extends Component {

  render() {
    const track = this.props.track;
    const release = track.release;
    const trackIndex = release.tracks.indexOf(track);
    const releaseIndex = release.artist.releases.indexOf(release);
    const artist = track.release.artist;
    const title = track.recording[0].title[0];
    const artistName = artist.name[0];
    return (
      <div className="add-modal">
        <div className="add-modal-inner">
          <h1>Edit track</h1>
          <hr />
          <h3>Youtube ID</h3>
          <input
            defaultValue={this.props.track.youtubeId}
            ref={(e) => { this.youtubeId = e; }}
          />
          <button
            onClick={() => {
              Artists.update({ _id: artist._id }, { $set: {
                [`releases.${releaseIndex}.tracks.${trackIndex}.youtubeId`]: this.youtubeId.value,
              } });
            }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

}

Track.propTypes = {
  track: PropTypes.object.isRequired,
};

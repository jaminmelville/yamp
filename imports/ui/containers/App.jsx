/*eslint no-param-reassign: ["error", { "props": false }]*/
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Artists } from '../../api/Artists';
import { State } from '../../api/State';
import App from '../components/App';

window.Artists = Artists;
window.State = State;

class AppContainer extends Component {

  render() {
    if (this.props.loading) {
      return (<div>Loading...</div>);
    }
    else {
      return (
        <App {...this.props} />
      );
    }
  }
}

export default createContainer(() => {
  const handle = Meteor.subscribe('appData');
  const loading = !handle.ready() || !State.findOne();
  if (loading) {
    return { loading };
  }
  const state = State.findOne();
  const artistsData = Artists.find({}, { sort: { 'sort-name': 1 } }).fetch();

  let activeTrackId;
  const artists = [];
  const artistsById = {};
  const tracksById = {};
  const releasesById = {};
  const tracks = [];

  artistsData.forEach((artist, artistIndex) => {
    artist.index = artistIndex;
    artist.releases.forEach((release, releaseIndex) => {
      release.artist = artist;
      release.index = releaseIndex;
      release.tracks.forEach((track) => {
        track.release = release;
        if (track['@'].id === state.activeTrackId) {
          activeTrackId = track['@'].id;
        }
        tracks.push(track);
        tracksById[track['@'].id] = track;
      });
      releasesById[release['@'].id] = release;
    });
    artists.push(artist);
    artistsById[artist['@'].id] = artist;
  });
  if (!activeTrackId && artists.length) {
    activeTrackId = artists[0].releases[0].tracks[0]['@'].id;
  }
  return {
    loading,
    state,
    artists,
    activeTrackId,
    tracksById,
    releasesById,
    artistsById,
    tracks,
  };
}, AppContainer);

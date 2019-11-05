import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import fullScreen from 'fullscreen';
import classNames from 'classnames';
import Matrix from './Matrix/Matrix';
import Track from './Track/Track';
import Tracks from './Tracks/Tracks';
import Title from './Title/Title';
import Video from './Video/Video';
import Controls from './Controls/Controls';
import AddModal from './AddModal/AddModal';
import { State } from '../../api/State';

export default class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.fadeTimeout = null;
    this.fadeDelay = 60000;
    this.state = {
      isFullScreen: false,
      isRemote: false,
      focusedReleaseId: null,
      adding: props.artists.length === 0,
      isFaded: false,
      isEditing: false,
    };
  }

  componentWillMount() {
    document.addEventListener('click', this.resetFade);
    document.addEventListener('keydown', this.resetFade);
    document.addEventListener('keydown', this.onKeyPress);
  }

  componentDidMount() {
    this.fullScreen = fullScreen(document.documentElement);
    this.fullScreen.on('attain', () => {
      this.setState({ isFullScreen: true });
    });
    this.fullScreen.on('release', () => {
      this.setState({ isFullScreen: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.artists.length === 0) {
      this.setState({ adding: true });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.resetFade);
    document.removeEventListener('keydown', this.resetFade);
    document.removeEventListener('keydown', this.onKeyPress);
  }

  resetFade = () => {
    clearTimeout(this.fadeTimeout);
    this.setState({ isFaded: false });
    this.fadeTimeout = setTimeout(() => {
      if (this.props.state.playing) {
        this.setState({ isFaded: true });
      }
    }, this.fadeDelay);
  }

  onKeyPress = (e) => {
    if (this.state.adding) {
      switch (e.keyCode) {
        case 27:
          this.closeAddModal();
          break;
        default:
          console.log(e.keyCode);
      }
    } else {
      switch (e.keyCode) {
        case 32:
          this.playPause();
          break;
        case 69:
          if (e.ctrlKey) {
            e.preventDefault();
            this.setState({ isEditing: !this.state.isEditing });
          }
          break;
        default:
          console.log(e.keyCode);
      }
    }
  }

  getActiveTrack = () => this.props.tracksById[this.props.activeTrackId];

  getFocusedRelease = () => this.props.releasesById[this.state.focusedReleaseId];

  getPlaylistTracks = () => this.props.state.playlist.map(id => this.props.tracksById[id]);

  addToPlaylist = (track) => {
    if (!this.props.state.playlist) {
      State.update({ _id: this.props.state._id }, { $set: { playlist: [] } });
    }
    State.update({ _id: this.props.state._id }, { $push: { playlist: track['@'].id } });
  }

  removeFromPlaylist = (track, index) => {
    State.update({ _id: this.props.state._id }, { $unset: { [`playlist.${index}`]: 1 } });
    State.update({ _id: this.props.state._id }, { $pull: { playlist: null } });
  }

  logout = () => {
    window.googleAnalytics.event({
      category: 'User',
      action: 'Logged out',
      label: Meteor.user().services.google.name,
    });
    Meteor.logout();
  }

  toggleShuffle = () => {
    this.updateSharedState({ shuffle: !this.props.state.shuffle });
  }

  toggleFullScreen = () => {
    if (this.state.isFullScreen) {
      this.fullScreen.release();
    } else {
      this.fullScreen.request();
    }
  }

  toggleRemote = () => {
    this.setState({ isRemote: !this.state.isRemote });
  }

  play = (track) => {
    window.googleAnalytics.event({
      category: 'Control',
      action: 'Played track',
      label: `${track.release.artist.name[0]} | ${track.recording[0].title[0]}`,
    });
    const trackId = track['@'].id;
    this.updateSharedState({ activeTrackId: trackId, playing: true });
  }

  playPause = () => {
    this.updateSharedState({ playing: !this.props.state.playing });
  }

  updateSharedState(fields) {
    State.update({ _id: this.props.state._id }, { $set: fields });
  }

  increaseVolume = () => {
    if (this.props.state.volume < 100) {
      this.updateSharedState({ volume: this.props.state.volume + 5 });
    }
  }

  decreaseVolume = () => {
    if (this.props.state.volume > 0) {
      this.updateSharedState({ volume: this.props.state.volume - 5 });
    }
  }

  next = () => {
    let index;
    const count = this.props.tracks.length;
    if (this.props.state.playlist && this.props.state.playlist.length) {
      const nextTrack = this.props.tracksById[this.props.state.playlist[0]];
      index = this.props.tracks.indexOf(nextTrack);
      this.removeFromPlaylist(nextTrack, 0);
    } else if (this.props.state.shuffle) {
      index = parseInt(Math.random() * count, 10);
    } else {
      const currentIndex = this.props.tracks.indexOf(this.getActiveTrack());
      index = (currentIndex + 1) % count;
    }
    const track = this.props.tracks[index];
    this.play(track);
  }

  previous = () => {
    let index;
    const count = this.props.tracks.length;
    if (this.props.state.shuffle) {
      index = parseInt(Math.random() * count, 10);
    } else {
      const currentIndex = this.props.tracks.indexOf(this.getActiveTrack());
      index = ((count + currentIndex) - 1) % count;
    }
    const track = this.props.tracks[index];
    this.play(track);
  }

  remove = () => {
    Meteor.call('removeRelease', this.getFocusedRelease()['@'].id);
  }

  closeAddModal = () => {
    this.setState({ adding: this.props.artists.length === 0 });
  }

  render() {
    return (
      <div className="app" key="app">
        {this.props.artists.length > 0 &&
          <div>
            <Route
              exact
              path="/"
              render={() => (
                <Video
                  track={this.getActiveTrack()}
                  state={this.props.state}
                  next={this.next}
                />
              )}
            />
            <div className={classNames('app__ui', { 'app__ui--faded': this.state.isFaded })}>
              {this.state.isEditing && <Track track={this.getActiveTrack()} />}
              <Matrix
                ref={(e) => { this.matrix = e; }}
                onChange={(focusedReleaseId) => {
                  this.setState({ focusedReleaseId });
                }}
                play={this.play}
                artists={this.props.artists}
                activeTrack={this.getActiveTrack()}
                releasesById={this.props.releasesById}
                artistsById={this.props.artistsById}
                hasFocus={!this.state.adding}
              />
              <Title track={this.getActiveTrack()} />
              {this.getFocusedRelease() &&
                <Tracks
                  tracks={this.getFocusedRelease().tracks}
                  onNameClick={this.play}
                  onButtonClick={this.addToPlaylist}
                  active={this.getActiveTrack()}
                  align="left"
                  heading={this.getFocusedRelease().artist.name[0]}
                  subHeading={this.getFocusedRelease().title[0]}
                  icon="chevron-right"
                />
              }
              {this.props.state.playlist && this.props.state.playlist.length > 0 &&
                <Tracks
                  tracks={this.getPlaylistTracks()}
                  onButtonClick={this.removeFromPlaylist}
                  active={this.getActiveTrack()}
                  align="right"
                  heading="Queue"
                  subHeading="Tracks"
                  icon="chevron-left"
                />
              }
            </div>
          </div>
        }
        <div className={classNames('app__ui', { 'app__ui--faded': this.state.isFaded })}>
          <Controls
            setAdding={() => { this.setState({ adding: true }); }}
            zoomIn={() => { this.matrix.zoomIn(); }}
            zoomOut={() => { this.matrix.zoomOut(); }}
            increaseVolume={this.increaseVolume}
            decreaseVolume={this.decreaseVolume}
            next={this.next}
            previous={this.previous}
            isPlaying={this.props.state.playing}
            playPause={this.playPause}
            logout={this.logout}
            remove={this.remove}
            isFullScreen={this.state.isFullScreen}
            isShuffle={this.props.state.shuffle || false}
            isRemote={this.state.isRemote}
            toggleShuffle={this.toggleShuffle}
            toggleFullScreen={this.toggleFullScreen}
            toggleRemote={this.toggleRemote}
            fade={() => this.setState({ isFaded: true })}
          />
        </div>
        {this.state.adding &&
          <AddModal
            close={this.closeAddModal}
            artists={this.props.artists}
          />
        }
      </div>
    );
  }
}

App.propTypes = {
  artists: PropTypes.array.isRequired,
  state: PropTypes.object.isRequired,
};

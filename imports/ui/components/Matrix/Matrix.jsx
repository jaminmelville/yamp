import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Swipeable from 'react-swipeable';
import clone from 'clone';
import Column from '../Column/Column';

export default class Matrix extends Component {

  constructor(props, context) {
    super(props, context);
    this.lastInteraction = 0;
    this.state = {
      swiping: false,
      transitions: true,
      offset: { x: 0, y: 0 },
      size: this.getPersistentState().size || 200,
      selectedReleaseIds: this.generateSelectedReleaseIds(props.artists),
    };
  }

  componentWillMount() {
    document.addEventListener('keydown', this.onKeyPress);
    this.interval = setInterval(this.autoFocus, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const selectedReleaseIds = this.generateSelectedReleaseIds(nextProps.artists);
    this.setState({ selectedReleaseIds });
  }

  componentDidUpdate() {
    this.autoFocus();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPress);
    clearInterval(this.interval);
  }

  onKeyPress = (e) => {
    if (this.props.hasFocus) {
      switch (e.keyCode) {
        case 13:
          this.props.play(this.getFocusedRelease().tracks[0]);
          break;
        case 39:
          this.focusNextArtist();
          break;
        case 37:
          this.focusPreviousArtist();
          break;
        case 38:
          this.focusPreviousRelease();
          break;
        case 40:
          this.focusNextRelease();
          break;
        case 189:
          this.zoomOut();
          break;
        case 187:
          this.zoomIn();
          break;
        default:
      }
    }
  }

  getFocusedRelease = () =>
    this.props.releasesById[this.state.selectedReleaseIds[this.state.focusedArtistId]];

  getPersistentState = () => {
    if (localStorage.getItem('yamp-persistent-state')) {
      return JSON.parse(localStorage.getItem('yamp-persistent-state'));
    }
    return { selectedReleaseIds: {} };
  };

  setPersistentState = (data) => {
    const state = Object.assign({}, this.getPersistentState(), data);
    localStorage.setItem('yamp-persistent-state', JSON.stringify(state));
    this.setState(data);
  }

  generateSelectedReleaseIds = (artists) => {
    const persistentState = this.getPersistentState();
    const selectedReleaseIds = {};
    artists.forEach((artist) => {
      const selectedReleaseId = persistentState.selectedReleaseIds[artist['@'].id];
      if (selectedReleaseId && this.props.releasesById[selectedReleaseId]) {
        selectedReleaseIds[artist['@'].id] = selectedReleaseId;
      } else {
        selectedReleaseIds[artist['@'].id] = artist.releases[0]['@'].id;
      }
    });
    return selectedReleaseIds;
  }

  autoFocus = () => {
    const isIdle = this.lastInteraction < new Date().getTime() - 10000;
    if (isIdle && this.getFocusedRelease() !== this.props.activeTrack.release) {
      this.focus(this.props.activeTrack.release);
    }
  }

  focus = (release, manual = true) => {
    if (manual) {
      this.lastInteraction = (new Date()).getTime();
    }
    const selectedReleaseIds = clone(this.state.selectedReleaseIds);
    selectedReleaseIds[release.artist['@'].id] = release['@'].id;
    this.setPersistentState({
      focusedArtistId: release.artist['@'].id,
      selectedReleaseIds,
    });
    this.props.onChange(release['@'].id);
  }

  zoomIn = () => {
    if (this.state.size < 250) {
      this.setPersistentState({ size: this.state.size + 5 });
    }
  }

  zoomOut = () => {
    if (this.state.size > 20) {
      this.setPersistentState({ size: this.state.size - 5 });
    }
  }

  focusNextArtist = () => {
    const currentIndex = this.props.artistsById[this.state.focusedArtistId].index;
    const nextIndex = (currentIndex + 1) % this.props.artists.length;
    const focusedArtistId = this.props.artists[nextIndex]['@'].id;
    this.focus(this.props.releasesById[this.state.selectedReleaseIds[focusedArtistId]]);
  }

  focusPreviousArtist = () => {
    const currentIndex = this.props.artistsById[this.state.focusedArtistId].index;
    const nextIndex = ((this.props.artists.length + currentIndex) - 1) % this.props.artists.length;
    const focusedArtistId = this.props.artists[nextIndex]['@'].id;
    this.focus(this.props.releasesById[this.state.selectedReleaseIds[focusedArtistId]]);
  }

  focusPreviousRelease = () => {
    const currentRelease = this.getFocusedRelease();
    const currentArtist = currentRelease.artist;
    if (currentRelease.index > 0) {
      const nextRelease = currentArtist.releases[currentRelease.index - 1];
      this.focus(nextRelease);
    }
  }

  focusNextRelease = () => {
    const currentRelease = this.getFocusedRelease();
    const currentArtist = currentRelease.artist;
    if (currentRelease.index < currentArtist.releases.length - 1) {
      const nextRelease = currentArtist.releases[currentRelease.index + 1];
      this.focus(nextRelease);
    }
  }

  swiped = (e, deltaX, deltaY, isFlick, velocity) => {
    if (!isFlick) {
      velocity = 1;
    }
    this.setState({ transitions: true, offset: { x: 0, y: 0 } });
    setTimeout(() => {
      this.setState({ swiping: false });
    }, 200);
    let artistIndex = this.props.artistsById[this.state.focusedArtistId].index;
    artistIndex += parseInt(((deltaX / this.state.size) * velocity) + (0.5 * Math.sign(deltaX)), 10);
    if (artistIndex < 0) {
      artistIndex = 0;
    } else if (artistIndex > this.props.artists.length - 1) {
      artistIndex = this.props.artists.length - 1;
    }
    const artist = this.props.artists[artistIndex];
    const releaseId = this.state.selectedReleaseIds[artist['@'].id];
    let releaseIndex = this.props.releasesById[releaseId].index;
    releaseIndex += parseInt(((deltaY / this.state.size) * velocity) + (0.5 * Math.sign(deltaY)), 10);
    if (releaseIndex < 0) {
      releaseIndex = 0;
    } else if (releaseIndex > artist.releases.length - 1) {
      releaseIndex = artist.releases.length - 1;
    }
    const release = artist.releases[releaseIndex];
    this.focus(release);
  }

  swipingLeft = (e, absX) => {
    this.setState({ swiping: true, transitions: false, offset: { x: absX, y: 0 } });
  }

  swipingRight = (e, absX) => {
    this.setState({ swiping: true, transitions: false, offset: { x: -absX, y: 0 } });
  }

  swipingUp = (e, absY) => {
    this.setState({ swiping: true, transitions: false, offset: { x: 0, y: absY } });
  }

  swipingDown = (e, absY) => {
    this.setState({ swiping: true, transitions: false, offset: { x: 0, y: -absY } });
  }

  render() {
    let focusedIndex = 0;
    const artists = this.props.artists.map((artist, index) => {
      const focused = this.state.focusedArtistId === artist['@'].id;
      if (focused) {
        focusedIndex = index;
      }
      return (
        <Column
          size={this.state.size}
          artist={artist}
          key={artist['@'].id}
          play={this.props.play}
          activeTrack={this.props.activeTrack}
          selectedReleaseIds={this.state.selectedReleaseIds}
          focused={focused}
          focus={this.focus}
          offset={focused ? this.state.offset.y : 0}
          swiping={this.state.swiping}
          transitions={this.state.transitions}
        />
      );
    });
    return (
      <Swipeable
        trackMouse
        onSwiped={this.swiped}
        onSwipingLeft={this.swipingLeft}
        onSwipingRight={this.swipingRight}
        onSwipingUp={this.swipingUp}
        onSwipingDown={this.swipingDown}
        style={{ touchAction: 'none' }}
      >
        <div className="matrix">
          <div
            className={classNames('matrix__inner', {
              'matrix__inner--transitions': this.state.transitions,
            })}
            style={{
              marginLeft: -this.state.offset.x - ((0.5 + focusedIndex) * this.state.size),
            }}
          >
            {artists}
          </div>
        </div>
      </Swipeable>
    );
  }

}

Matrix.propTypes = {
  activeTrack: PropTypes.object.isRequired,
  artists: PropTypes.array.isRequired,
  releasesById: PropTypes.object.isRequired,
  artistsById: PropTypes.object.isRequired,
  play: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  hasFocus: PropTypes.bool.isRequired,
};

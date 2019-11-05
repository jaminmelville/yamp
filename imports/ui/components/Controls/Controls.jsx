import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import YouTube from 'react-youtube';
import PropTypes from 'prop-types';

export default class Controls extends Component {

  render() {
    return (
      <div className="controls">
        <div
          className="controls__button"
          onClick={this.props.setAdding}
          title="Search and add more music"
        >
          <i className="controls__icon fa fa-plus" />
        </div>
        <div
          className="controls__button"
          onClick={this.props.remove}
          title="Remove current release"
        >
          <i className="controls__icon fa fa-minus" />
        </div>
        {/* {this.props.isRemote ?
          <div
            className="controls__button"
            onClick={this.props.toggleRemote}
            title="Use this device as a player"
          >
            <i className="controls__icon fa fa-mobile" />
          </div>
          :
          <div
            className="controls__button"
            onClick={this.props.toggleRemote}
            title="Use this device as a remote"
          >
            <i className="controls__icon fa fa-music" />
          </div>
        } */}
        {/* {this.props.isFullScreen ?
          <div
            className="controls__button"
            onClick={this.props.toggleFullScreen}
            title="Exit full screen"
          >
            <i className="controls__icon fa fa-compress" />
          </div>
          :
          <div
            className="controls__button"
            onClick={this.props.toggleFullScreen}
            title="Go full screen"
          >
            <i className="controls__icon fa fa-expand" />
          </div>
        } */}
        <div
          className="controls__button"
          onClick={this.props.zoomOut}
          title="Zoom out and make covers smaller"
        >
          <i className="controls__icon fa fa-search-minus" />
        </div>
        <div
          className="controls__button"
          onClick={this.props.zoomIn}
          title="Zoom in and make covers bigger"
        >
          <i className="controls__icon fa fa-search-plus" />
        </div>
        <div
          className="controls__button"
          onClick={this.props.previous}
          title="Go back a track"
        >
          <i className="controls__icon fa fa-backward" />
        </div>
        {this.props.isPlaying ?
          <div
            className="controls__button"
            onClick={this.props.playPause}
            title="Pause"
          >
            <i className="controls__icon fa fa-pause" />
          </div>
          :
          <div
            className="controls__button"
            onClick={this.props.playPause}
            title="Play"
          >
            <i className="controls__icon fa fa-play" />
          </div>
        }
        {this.props.isShuffle ?
          <div
            className="controls__button"
            onClick={this.props.toggleShuffle}
            title="Unshuffle"
          >
            <i className="controls__icon fa fa-random" />
          </div>
          :
          <div
            className="controls__button"
            onClick={this.props.toggleShuffle}
            title="Shuffle"
          >
            <i className="controls__icon fa fa-long-arrow-right" />
          </div>
        }
        <div
          className="controls__button"
          onClick={this.props.next}
          title="Go forward a track"
        >
          <i className="controls__icon fa fa-forward" />
        </div>
        <div
          className="controls__button"
          onClick={this.props.decreaseVolume}
          title="Turn down the volume"
          >
            <i className="controls__icon fa fa-volume-down" />
          </div>
        <div
          className="controls__button"
          onClick={this.props.increaseVolume}
          title="Turn up the volume"
        >
          <i className="controls__icon fa fa-volume-up" />
        </div>
        <div
          className="controls__button"
          onClick={this.props.fade}
          title="Fade out the UI"
        >
          <i className="controls__icon fa fa-television" />
        </div>
        <div
          className="controls__button"
          onClick={this.props.logout}
          title="Log out"
        >
          <i className="controls__icon fa fa-sign-out" />
        </div>
      </div>
    );
  }

}

Controls.propTypes = {
  setAdding: PropTypes.func.isRequired,
  zoomIn: PropTypes.func.isRequired,
  zoomOut: PropTypes.func.isRequired,
  increaseVolume: PropTypes.func.isRequired,
  decreaseVolume: PropTypes.func.isRequired,
  next: PropTypes.func.isRequired,
  previous: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  playPause: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  isFullScreen: PropTypes.bool.isRequired,
  isShuffle: PropTypes.bool.isRequired,
  isRemote: PropTypes.bool.isRequired,
  toggleShuffle: PropTypes.func.isRequired,
  toggleFullScreen: PropTypes.func.isRequired,
  toggleRemote: PropTypes.func.isRequired,
  fade: PropTypes.func.isRequired,
};

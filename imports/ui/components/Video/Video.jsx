import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import YouTube from 'react-youtube';
import fetchJsonp from 'fetch-jsonp';
import PropTypes from 'prop-types';
import { Artists } from '../../../api/Artists';

export default class Video extends Component {

  constructor(props, context) {
    super(props, context);
    if (!props.track.youtubeId) {
      this.getYoutubeId(props.track);
    }
    this.state = {
      youtubeId: props.track.youtubeId,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.track.youtubeId) {
      this.getYoutubeId(nextProps.track);
    } else if (nextProps.track.youtubeId !== this.state.youtubeId) {
      this.setState({ youtubeId: nextProps.track.youtubeId }, this.setTrack);
    }
    if (this.youtube) {
      if (nextProps.state.playing && nextProps.track.youtubeId) {
        this.youtube.playVideo();
      } else {
        this.youtube.pauseVideo();
      }
      this.youtube.setVolume(nextProps.state.volume);
    }
  }

  getYoutubeId = (track) => {
    const release = track.release;
    const trackIndex = release.tracks.indexOf(track);
    const releaseIndex = release.artist.releases.indexOf(release);
    const artist = track.release.artist;
    const title = track.recording[0].title[0];
    const artistName = artist.name[0];

    const searchAndSave = () => {
      Meteor.call('youtubeSearch', `${artistName} ${title}`, this.regionCode, (err, youtubeId) => {
        if (err) {
          this.props.next();
        } else {
          Artists.update({ _id: artist._id }, { $set: {
            [`releases.${releaseIndex}.tracks.${trackIndex}.youtubeId`]: youtubeId,
          } });
        }
      });
    };

    if (this.regionCode) {
      searchAndSave();
    } else {
      fetchJsonp('https://ipinfo.io')
        .then(response => response.json())
        .then((response) => {
          this.regionCode = response.country;
          searchAndSave();
        });
    }
  }

  setTrack = () => {
    if (this.youtube) {
      if (this.props.state.playing) {
        this.youtube.loadVideoById(this.state.youtubeId);
      } else {
        this.youtube.cueVideoById(this.state.youtubeId);
      }
    }
  }

  render() {
    if (!this.state.youtubeId) {
      return null;
    }
    return (
      <YouTube
        className="video"
        videoId={this.state.youtubeId}
        opts={{
          playerVars: {
            autoplay: this.props.state.playing,
            rel: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            showinfo: 0,
          },
        }}
        onReady={(e) => {
          this.youtube = e.target;
          this.youtube.setVolume(this.props.state.volume);
        }}
        onStateChange={(state) => {
          if (state.data === YouTube.PlayerState.ENDED) {
            this.props.next();
          }
          if (state.data === YouTube.PlayerState.CUED) {
            if (this.props.state.playing) {
              this.youtube.playVideo();
            }
          }
        }}
        onError={() => {
          this.props.next();
        }}
      />
    );
  }

}

Video.propTypes = {
  track: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  next: PropTypes.func.isRequired,
};

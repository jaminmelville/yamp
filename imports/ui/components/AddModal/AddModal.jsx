import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import async from 'async';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import classNames from 'classnames';
import { parseString } from 'xml2js';
import clone from 'clone';
import { Artists } from '../../../api/Artists';
import Button from '../Button/Button';
import Cover from '../Cover/Cover';

function xml2js(str) {
  return new Promise((resolve, reject) => {
    parseString(str, { attrkey: '@' }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export default class AddModal extends Component {

  constructor(props, context) {
    super(props, context);
    this.stages = { search: 0, releases: 1, tracks: 2 };
    this.state = {
      tracks: [],
      releases: [],
      release: null,
      artists: [],
      artist: null,
      recording: null,
      loading: false,
      stage: this.stages.search,
    };
    this.search = this.search.bind(this);
    this.selectArtist = this.selectArtist.bind(this);
    this.selectRelease = this.selectRelease.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.addAlbumToLibrary = this.addAlbumToLibrary.bind(this);
    this.prefix = 'add-modal-';
  }

  componentDidMount() {
    this.term.focus();
  }

  search() {
    const term = this.term.value;
    if (term) {
      this.setState({ loading: true });
      fetch(`https://musicbrainz.org/ws/2/artist/?query=artist:${term}&limit=10`)
        .then(response => response.text())
        .then(xml2js)
        .then((data) => {
          const artists = data.metadata['artist-list'][0].artist;
          this.setState({ artists, loading: false, releases: [], tracks: [] }, () => {
            if (artists.length) {
              this.selectArtist(artists[0]);
            }
          });
        });
    }
  }

  selectArtist(artist) {
    this.setState({ loading: true, stage: this.stages.releases, tracks: [], releases: [] });
    const arid = artist['@'].id;
    let allReleases = [];
    let offset = 0;
    let fetching = true;
    async.whilst(
      () => fetching,
      (callback) => {
        fetch(`https://musicbrainz.org/ws/2/release?artist=${arid}&type=album&inc=release-groups&limit=100&offset=${offset}`)
          .then(response => response.text())
          .then(xml2js)
          .then((data) => {
            const releases = data.metadata['release-list'][0].release || [];
            fetching = releases.length === 100;
            offset += 100;
            allReleases = allReleases.concat(releases);
            callback(null, fetching);
          });
      },
      () => {
        this.setState({ artist, releases: allReleases, loading: false, tracks: [] });
      },
    );
  }

  selectRelease(release) {
    this.setState({ loading: true, stage: this.stages.tracks, tracks: [] });
    fetch(`https://musicbrainz.org/ws/2/release/${release['@'].id}?inc=recordings`)
      .then(response => response.text())
      .then(xml2js)
      .then((data) => {
        let tracks = [];
        data.metadata.release[0]['medium-list'][0].medium.forEach((medium) => {
          tracks = tracks.concat(medium['track-list'][0].track);
        });
        this.setState({ tracks, release, loading: false });
      });
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      this.search();
    }
  }

  addAlbumToLibrary() {
    const artist = clone(this.state.artist);
    artist.owner = Meteor.userId();
    artist.releases = [clone(this.state.release)];
    artist.releases[0].tracks = clone(this.state.tracks);
    Meteor.call('insertRelease', artist);
  }

  render() {
    const recordings = [];
    for (let i = 0; i < this.state.tracks.length; i += 1) {
      const recording = this.state.tracks[i].recording[0];
      const title = recording.title[0];
      recordings.push(
        <div
          key={recording['@'].id}
          className={classNames(`${this.prefix}recording`, {
            [`${this.prefix}recording--active`]: i === this.state.recording,
          })}
        >
          {title}
        </div>,
      );
    }
    const releases = [];
    const releaseGroups = new Set();
    // Releases with cover art get priority.
    this.state.releases.forEach((release) => {
      const releaseGroup = release['release-group'][0]['@'].id;
      if (!releaseGroups.has(releaseGroup)) {
        const hasCoverArt = release['cover-art-archive'][0].artwork[0] === 'true';
        if (hasCoverArt) {
          releaseGroups.add(releaseGroup);
          const releaseId = release['@'].id;
          releases.push(
            <Cover
              key={releaseId}
              focused={this.state.release === release}
              size={250}
              onClick={() => {
                this.selectRelease(release);
              }}
              release={release}
            />,
          );
        }
      }
    });
    this.state.releases.forEach((release) => {
      const releaseGroup = release['release-group'][0]['@'].id;
      if (!releaseGroups.has(releaseGroup)) {
        releaseGroups.add(releaseGroup);
        const releaseId = release['@'].id;
        releases.push(
          <Cover
            key={releaseId}
            focused={this.state.release === release}
            size={250}
            onClick={() => {
              this.selectRelease(release);
            }}
            release={release}
          />,
        );
      }
    });
    const artists = [];
    this.state.artists.forEach((artist, index) => {
      const artistId = artist['@'].id;
      artists.push(
        <option
          key={artistId}
          value={index}
        >
          {artist.name[0]} {artist.disambiguation && `| ${artist.disambiguation}`}
        </option>,
      );
    });
    const albumInLibrary = recordings.length && Artists.find({ 'releases.@.id': this.state.release['@'].id }).count();
    return (
      <div
        className={classNames('add-modal', {
          'add-modal--loading': this.state.loading,
        })}
        onClick={this.props.close}
      >
        <div
          className={`${this.prefix}inner`}
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <div className={`${this.prefix}header`}>
            <h2>What are you into?</h2>
          </div>
          <div className={`${this.prefix}content`}>
            <div
              className={classNames(`${this.prefix}search ${this.prefix}column`, {
                [`${this.prefix}column--selected`]: this.state.stage === this.stages.search,
              })}
            >
              <input
                type="text"
                className={`${this.prefix}search__input`}
                ref={(e) => { this.term = e; }}
                onKeyPress={this.handleKeyPress}
                placeholder="Search for Artist"
              />
              <span className={`${this.prefix}search__icon`} onClick={this.search}>
                <i className="fa fa-search" />
              </span>
            </div>
            {artists.length && this.state.artist ?
              <div
                className={classNames(`${this.prefix}releases ${this.prefix}column`, {
                  [`${this.prefix}column--selected`]: this.state.stage === this.stages.releases,
                })}
              >
                <Scrollbars>
                  <select
                    className={`${this.prefix}artists`}
                    onChange={(e) => {
                      const artist = this.state.artists[parseInt(e.target.value, 10)];
                      this.selectArtist(artist);
                    }}
                    value={this.state.artist}
                  >
                    {artists}
                  </select>
                  {releases}
                </Scrollbars>
              </div>
              :
              null
            }
            {recordings.length ?
              <div
                className={classNames(`${this.prefix}recordings ${this.prefix}column`, {
                  [`${this.prefix}column--selected`]: this.state.stage === this.stages.tracks,
                })}
              >
                {recordings}
                {!albumInLibrary ?
                  <Button
                    onClick={this.addAlbumToLibrary}
                  >
                    I want
                  </Button>
                  :
                  <Button>
                    <i className="fa fa-check" /> You have
                  </Button>
                }
              </div>
              :
              null
            }
          </div>
          <div className={`${this.prefix}footer`}>
            {this.state.stage !== this.stages.search ?
              <i
                className={`${this.prefix}back fa fa-arrow-circle-left`}
                onClick={() => {
                  this.setState({ stage: this.state.stage - 1 });
                }}
              />
              :
              null
            }

            {this.props.artists.length ?
              <Button
                onClick={this.props.close}
              >
                That&#39;s it!
              </Button>
              :
              null
            }
          </div>
        </div>
      </div>
    );
  }
}

AddModal.propTypes = {
  close: PropTypes.func.isRequired,
  artists: PropTypes.array.isRequired,
};

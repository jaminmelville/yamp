import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Cover from '../Cover/Cover';

export default class Column extends Component {

  render() {
    let selectedIndex;
    const selectedReleaseId = this.props.selectedReleaseIds[this.props.artist['@'].id];
    const releases = this.props.artist.releases.map((release, index) => {
      const isSelected = selectedReleaseId === release['@'].id;
      if (isSelected) {
        selectedIndex = index;
      }
      return (
        <Cover
          key={release['@'].id}
          focused={this.props.focused && isSelected}
          size={this.props.size}
          onClick={() => {
            if (!this.props.swiping) {
              if (this.props.focused && isSelected) {
                this.props.play(release.tracks[0]);
              } else {
                this.props.focus(release);
              }
            }
          }}
          release={release}
        />
      );
    });
    return (
      <div
        className={classNames('column', {
          'column--transitions': this.props.transitions,
        })}
        style={{
          width: this.props.size,
          marginTop: -this.props.offset - ((0.5 + selectedIndex) * this.props.size),
        }}
      >
        {releases}
      </div>
    );
  }
}

Column.propTypes = {
  size: PropTypes.number.isRequired,
  play: PropTypes.func.isRequired,
  focus: PropTypes.func.isRequired,
  focused: PropTypes.bool.isRequired,
  swiping: PropTypes.bool.isRequired,
  transitions: PropTypes.bool.isRequired,
  artist: PropTypes.object.isRequired,
  selectedReleaseIds: PropTypes.object.isRequired,
  offset: PropTypes.number.isRequired,
};

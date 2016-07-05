class Library {

  constructor(tracksData) {
    this.tracks = []
    this.artists = []
    this.insert = this.insert.bind(this)
    this.update(tracksData)
  }

  update(tracksData) {
    // @todo Delete removed tracks and add only new tracks, ordering is important.
    tracksData.forEach((trackData) => {
      this.insert(trackData)
    })
  }

  insert(trackData) {
    if (this.artists.length === 0 || this.artists[this.artists.length - 1].name !== trackData.artist) {
      this.artists.push({
        index: this.artists.length,
        name: trackData.artist,
        albums: []
      })
    }
    var artist = this.artists[this.artists.length - 1]

    if (artist.albums.length === 0 || artist.albums[artist.albums.length - 1].name !== trackData.album) {
      if (!trackData.picture) {
        trackData.picture = '../missing-art.png'
      }
      artist.albums.push({
        index: artist.albums.length,
        name: trackData.album,
        picture: trackData.picture,
        year: trackData.year,
        tracks: [],
        artist: artist
      })
    }
    var album = artist.albums[artist.albums.length - 1]

    var track = {
      id: trackData.id,
      title: trackData.title,
      disk: trackData.disk,
      track: trackData.track,
      duration: trackData.duration,
      album: album,
      artist: artist,
      path: trackData.path
    }
    track.next = () => {
      var index = this.tracks.indexOf(track) + 1
      index = index < this.tracks.length -1 ? index : 0
      return this.tracks[index]
    }
    track.previous = () => {
      var index = this.tracks.indexOf(track) - 1
      index = index > 0 ? index : this.tracks.length
      return this.tracks[index]
    }

    this.tracks.push(track)
    album.tracks.push(track)
  }

  getTracks() {
    return this.tracks
  }

  getTrackById(trackId) {
    var track = this.tracks.reduce((track, item) => {
      if (item.id === trackId) {
        track = item
      }
      return track
    }, false)
    return track
  }

  getArtists() {
    return this.artists
  }

}

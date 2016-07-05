class Yamp extends React.Component {

  constructor(props, context) {
    super(props, context)
    this.library = new Library([])
    this.state = {
      currentTracks: [],
      track: null,
      size: 150
    }
    socket.on('state', (state) => {
      if ('tracks' in state) {
        // @todo Support library updates.
        if (this.library.tracks.length === 0) {
          this.library = new Library([])
          this.library.update(state.tracks)
          this.forceUpdate()
        }
      }
      if ('trackId' in state) {
        var track = this.library.getTrackById(state.trackId)
        this.setState({
          track: track,
          tracks: track.album.tracks
        })
      }
    })

    this.setCurrentTracks = this.setCurrentTracks.bind(this)
    socket.emit('request', ['tracks', 'trackId'])
  }

  setCurrentTracks(tracks) {
    this.setState({currentTracks: tracks})
  }

  render() {
    if (!this.state.track) {
      return (<div>loading..</div>)
    }
    return (
      <div className='yamp'>
        <Matrix size={this.state.size} artists={this.library.getArtists()} setCurrentTracks={this.setCurrentTracks} track={this.state.track}/>
        <Tracks track={this.state.track} tracks={this.state.currentTracks}/>
        <Info track={this.state.track}/>
        <Playlist library={this.library}/>
        <Controls track={this.state.track}/>
      </div>
    )
  }

}
ReactDOM.render(
  <Yamp/>,
  $('#yamp')[0]
)

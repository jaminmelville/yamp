class Tracks extends React.Component {

  // @todo shouldComponentUpdate could be used to see if tracks have changed.
  constructor(props, context) {
    super(props, context)
    this.state = {
      playlist: []
    }
    socket.on('state', (state) => {
      if ('playlist' in state) {
        this.setState({playlist: state.playlist})
      }
    })
    socket.emit('request', ['playlist'])
  }

  componentDidMount() {
    window.jQuery('.js-tracklist').perfectScrollbar()
  }

  componentWillUpdate() {
    window.jQuery('.js-tracklist').perfectScrollbar('destroy')
  }

  componentDidUpdate() {
    window.jQuery('.js-tracklist').perfectScrollbar()
  }

  render() {
    var tracks = this.props.tracks.map((track, key) => {
      var play = () => {
        socket.emit('remote', {
          command: 'play',
          trackId: track.id
        })
      }
      var queue = () => {
        this.state.playlist.push(track.id)
        socket.emit('remote', {
          command: 'playlist',
          playlist: this.state.playlist
        })
      }
      var className = (track === this.props.track) ? 'tracks__track tracks__track--active' : 'tracks__track'
      return (
        <li className={className} key={key}>
          <i onClick={queue} className='tracks__icon fi-plus'></i>
          <span className='tracks__name tracks__name--clickable' onClick={play}>{track.title}</span>
        </li>
      )
    })

    return (
      <div className='side-bar side-bar--left show-for-large'>
        <div className='side-bar__content js-tracklist'>
          <ul className='tracks'>
            {tracks}
          </ul>
        </div>
      </div>
    )
  }

}

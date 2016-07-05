class Playlist extends React.Component {

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
    $('.js-playlist').perfectScrollbar()
  }

  componentWillUpdate() {
    $('.js-playlist').perfectScrollbar('destroy')
  }

  componentDidUpdate() {
    $('.js-playlist').perfectScrollbar()
  }

  render() {
    var tracks = this.state.playlist.map((trackId, key) => {
      var track = this.props.library.getTrackById(trackId)
      var remove = () => {
        this.state.playlist.splice(key, 1)
        socket.emit('remote', {
          command: 'playlist',
          playlist: this.state.playlist
        })
      }
      return (
        <li className='tracks__track' key={key}>
          <span className='tracks__name'>{track.title}</span>
          <i onClick={remove} className='tracks__icon fi-minus'></i>
        </li>
      )
    })

    return (
      <div className='side-bar side-bar--right show-for-large'>
        <div className='side-bar__content js-playlist'>
          <ul className='tracks'>
            {tracks}
          </ul>
        </div>
      </div>
    )
  }

}

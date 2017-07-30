class Controls extends React.Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      currentTime: 0,
      paused: true,
      shuffled: false,
      volume: 0.5
    }
    socket.on('state', (state) => {
      if ('currentTime' in state) {
        this.setState({currentTime: state.currentTime})
      }
      if ('paused' in state) {
        this.setState({paused: state.paused})
      }
      if ('shuffled' in state) {
        this.setState({shuffled: state.shuffled})
      }
      if ('volume' in state) {
        this.setState({volume: state.volume})
      }
    })
    socket.emit('request', ['currentTime', 'paused', 'shuffled', 'volume'])
    this.previous = this.previous.bind(this)
    this.next = this.next.bind(this)
    this.pause = this.pause.bind(this)
    this.shuffle = this.shuffle.bind(this)
    this.volumeUp = this.volumeUp.bind(this)
    this.volumeDown = this.volumeDown.bind(this)
    this.progressTime()
  }

  progressTime() {
    var previousTime = new Date().getTime()
    setInterval(() => {
      if (!this.state.paused) {
        var currentTime = new Date().getTime()
        var elapsedTime = (currentTime - previousTime) / 1000
        previousTime = currentTime
        this.setState({
          currentTime: this.state.currentTime + elapsedTime
        })
      }
      else {
        previousTime = new Date().getTime()
      }
    }, 100)
  }

  componentDidMount() {
    window.jQuery('.controls .progress').click((e) => {
      var time = e.offsetX / window.jQuery('.controls .progress').width() * this.props.track.duration
      socket.emit('remote', {
        command: 'seek',
        position: time
      })
    })
  }

  previous() {
    socket.emit('remote', {
      command: 'previous'
    })
  }

  next() {
    socket.emit('remote', {
      command: 'next'
    })
  }

  pause() {
    socket.emit('remote', {
      command: 'pause'
    })
  }

  shuffle() {
    socket.emit('remote', {
      command: 'shuffle'
    })
  }

  volumeUp() {
    var volume = this.state.volume + 0.05
    volume = volume < 1 ? volume : 1
    socket.emit('remote', {
      command: 'volume',
      level: volume
    })
  }

  volumeDown() {
    var volume = this.state.volume - 0.05
    volume = volume > 0 ? volume : 0
    socket.emit('remote', {
      command: 'volume',
      level: volume
    })
  }

  toggleTracks() {
    window.jQuery('.side-bar--left').toggleClass('show-for-large')
    window.jQuery('.side-bar--right').addClass('show-for-large')
  }

  togglePlaylist() {
    window.jQuery('.side-bar--right').toggleClass('show-for-large')
    window.jQuery('.side-bar--left').addClass('show-for-large')
  }

  render() {
    var playPauseText = this.state.paused ? 'play' : 'pause'
    var width = (this.state.currentTime / this.props.track.duration) * 100
    var shuffleClass = this.state.shuffled ? '' : 'controls__icon--disabled'
    return (
      <div className='controls'>
        <i onClick={this.toggleTracks} className='hide-for-large controls__icon fi-list float-left'></i>
        <i onClick={this.previous} className='controls__icon fi-previous'></i>
        <i onClick={this.pause} className={'controls__icon fi-' + playPauseText}></i>
        <i onClick={this.next} className='controls__icon fi-next'></i>
        <i onClick={this.shuffle} className={'controls__icon fi-shuffle ' + shuffleClass} ></i>
        <i onClick={this.volumeDown} className='controls__icon fi-volume-none'></i>
        <span className='controls__volume-percent'>{parseInt(this.state.volume * 100 + 0.5)}%</span>
        <i onClick={this.volumeUp} className='controls__icon fi-volume'></i>
        <i onClick={this.togglePlaylist} className='hide-for-large controls__icon fi-list float-right'></i>
        <div className="progress controls__progress">
          <div className="progress-meter" style={{width: width + '%'}}></div>
        </div>
      </div>
    )
  }

}

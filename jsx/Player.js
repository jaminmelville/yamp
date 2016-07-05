class Player {

  constructor() {
    this.tracks = []
    this.playlist = []
    this.trackId = null
    this.shuffled = false

    this.next = this.next.bind(this)
    
    this.audio = new Audio()
    this.audio.volume = 0.5
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)
    this.source = this.audioCtx.createMediaElementSource(this.audio)
    this.streamData = new Uint8Array(256)
    this.analysers = [
      this.audioCtx.createAnalyser(),
      this.audioCtx.createAnalyser()
    ]
    this.analysers.forEach((analyser) => {
      analyser.fftSize = 256
    })
    this.splitter = this.audioCtx.createChannelSplitter();
    this.splitter.connect(this.analysers[0], 0, 0);
    this.splitter.connect(this.analysers[1], 1, 0);
    this.source.connect(this.splitter);
    this.analysers.forEach((analyser) => {
      analyser.connect(this.audioCtx.destination)
    })

    this.sendAudioLevel()
    this.audio.addEventListener('ended', this.next)

    socket.on('tracks', (tracks) => {
      this.tracks = tracks
      if (!this.trackId) {
        this.trackId = this.tracks[0].id
      }
    })

    socket.on('remote', (data) => {
      switch (data.command) {
        case 'pause':
          this.pause()
          break
        case 'next':
          this.next()
          break
        case 'previous':
          this.previous()
          break
        case 'shuffle':
          this.shuffle()
          break
        case 'volume':
          this.volume(data.level)
          break
        case 'play':
          var track = this.getTrackById(data.trackId)
          this.play(track)
          break
        case 'seek':
          this.seek(data.position)
          break
        case 'playlist':
          this.setPlaylist(data.playlist)
          break
      }

    })

    socket.on('request', (properties) => {
      var state = {}
      properties.forEach((property) => {
        var value = false
        switch (property) {
          case 'tracks':
            value = this.tracks
            break
          case 'currentTime':
            value = this.audio.currentTime
            break
          case 'paused':
            value = this.audio.paused
            break
          case 'shuffled':
            value = this.shuffled
            break
          case 'volume':
            value = this.audio.volume
            break
          case 'playlist':
            value = this.playlist
            break
          case 'trackId':
            value = this.trackId
            break
        }
        state[property] = value
      })
      socket.emit('state', state)
    })

  }

  setPlaylist(playlist) {
    this.playlist = playlist

    socket.emit('state', {
      playlist: this.playlist
    })
  }

  seek(position) {
    this.audio.currentTime = position

    socket.emit('state', {
      currentTime: this.audio.currentTime
    })
  }

  volume(level) {
    this.audio.volume = level

    socket.emit('state', {
      volume: this.audio.volume
    })
  }

  shuffle() {
    this.shuffled = !this.shuffled

    socket.emit('state', {
      shuffled: this.shuffled
    })
  }

  pause() {
    if (this.audio.paused) {
      this.audio.play()
    }
    else {
      this.audio.pause()
    }

    socket.emit('state', {
      paused: this.audio.paused
    })
  }

  play(track) {
    this.audio.src = track.path
    this.audio.load()
    this.audio.play()

    // @TODO Only send changed values to optimise.
    this.trackId = track.id
    socket.emit('state', {
      trackId: this.trackId,
      paused: this.audio.paused,
      currentTime: 0,
      playlist: this.playlist
    })
  }

  previous() {
    var nextIndex = this.tracks.indexOf(this.trackId) - 1
    if (nextIndex < 0) {
      nextIndex = 0
    }
    var nextTrack = this.tracks[nextIndex]
    this.play(nextTrack)
  }

  next() {
    if (this.playlist.length) {
      var trackId = this.playlist.shift()
      var track = this.getTrackById(trackId)
      var nextIndex = this.tracks.indexOf(track)
    }
    else if (this.shuffled) {
      var nextIndex = Math.floor(Math.random() * this.tracks.length)
    }
    else {
      var track = this.getTrackById(this.trackId)
      var index = this.tracks.indexOf(track)
      var nextIndex = index + 1 < this.tracks.length -1 ? index + 1 : 0
    }
    var nextTrack = this.tracks[nextIndex]
    this.play(nextTrack)
  }

  getTrackById(trackId) {
    return this.tracks.reduce((track, item) => {
      if (item.id === trackId) {
        track = item
      }
      return track
    }, false)
  }

  getAudioLevel() {
    var volume = {left: 0, right: 0};
    this.analysers.forEach((analyser, index) => {
      analyser.getByteFrequencyData(this.streamData);
       // this.analyserLeft.getByteTimeDomainData(this.streamData)
       var total = 0;
       for (var i = 0; i < 256; i++){//this.streamData.length; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
           total += this.streamData[i];
       }
       var level = parseInt(total / 256)
       if (index == 0) {
         volume.left = Math.min(parseInt(level), 255)
       }
       if (index == 1) {
         volume.right = Math.min(parseInt(level), 255)
       }
    })
    return volume;
  }

  sendAudioLevel() {
    socket.emit('audioLevel', {audioLevel: this.getAudioLevel()})
    setTimeout(() => {
      this.sendAudioLevel()
    }, 50)
  }

}

var player = new Player()

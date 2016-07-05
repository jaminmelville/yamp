'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Player = function () {
  function Player() {
    var _this = this;

    _classCallCheck(this, Player);

    this.tracks = [];
    this.playlist = [];
    this.trackId = null;
    this.shuffled = false;

    this.next = this.next.bind(this);

    this.audio = new Audio();
    this.audio.volume = 0.5;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.audioCtx.createMediaElementSource(this.audio);
    this.streamData = new Uint8Array(256);
    this.analysers = [this.audioCtx.createAnalyser(), this.audioCtx.createAnalyser()];
    this.analysers.forEach(function (analyser) {
      analyser.fftSize = 256;
    });
    this.splitter = this.audioCtx.createChannelSplitter();
    this.splitter.connect(this.analysers[0], 0, 0);
    this.splitter.connect(this.analysers[1], 1, 0);
    this.source.connect(this.splitter);
    this.analysers.forEach(function (analyser) {
      analyser.connect(_this.audioCtx.destination);
    });

    this.sendAudioLevel();
    this.audio.addEventListener('ended', this.next);

    socket.on('tracks', function (tracks) {
      _this.tracks = tracks;
      if (!_this.trackId) {
        _this.trackId = _this.tracks[0].id;
      }
    });

    socket.on('remote', function (data) {
      switch (data.command) {
        case 'pause':
          _this.pause();
          break;
        case 'next':
          _this.next();
          break;
        case 'previous':
          _this.previous();
          break;
        case 'shuffle':
          _this.shuffle();
          break;
        case 'volume':
          _this.volume(data.level);
          break;
        case 'play':
          var track = _this.getTrackById(data.trackId);
          _this.play(track);
          break;
        case 'seek':
          _this.seek(data.position);
          break;
        case 'playlist':
          _this.setPlaylist(data.playlist);
          break;
      }
    });

    socket.on('request', function (properties) {
      var state = {};
      properties.forEach(function (property) {
        var value = false;
        switch (property) {
          case 'tracks':
            value = _this.tracks;
            break;
          case 'currentTime':
            value = _this.audio.currentTime;
            break;
          case 'paused':
            value = _this.audio.paused;
            break;
          case 'shuffled':
            value = _this.shuffled;
            break;
          case 'volume':
            value = _this.audio.volume;
            break;
          case 'playlist':
            value = _this.playlist;
            break;
          case 'trackId':
            value = _this.trackId;
            break;
        }
        state[property] = value;
      });
      socket.emit('state', state);
    });
  }

  _createClass(Player, [{
    key: 'setPlaylist',
    value: function setPlaylist(playlist) {
      this.playlist = playlist;

      socket.emit('state', {
        playlist: this.playlist
      });
    }
  }, {
    key: 'seek',
    value: function seek(position) {
      this.audio.currentTime = position;

      socket.emit('state', {
        currentTime: this.audio.currentTime
      });
    }
  }, {
    key: 'volume',
    value: function volume(level) {
      this.audio.volume = level;

      socket.emit('state', {
        volume: this.audio.volume
      });
    }
  }, {
    key: 'shuffle',
    value: function shuffle() {
      this.shuffled = !this.shuffled;

      socket.emit('state', {
        shuffled: this.shuffled
      });
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (this.audio.paused) {
        this.audio.play();
      } else {
        this.audio.pause();
      }

      socket.emit('state', {
        paused: this.audio.paused
      });
    }
  }, {
    key: 'play',
    value: function play(track) {
      this.audio.src = track.path;
      this.audio.load();
      this.audio.play();

      // @TODO Only send changed values to optimise.
      this.trackId = track.id;
      socket.emit('state', {
        trackId: this.trackId,
        paused: this.audio.paused,
        currentTime: 0,
        playlist: this.playlist
      });
    }
  }, {
    key: 'previous',
    value: function previous() {
      var nextIndex = this.tracks.indexOf(this.trackId) - 1;
      if (nextIndex < 0) {
        nextIndex = 0;
      }
      var nextTrack = this.tracks[nextIndex];
      this.play(nextTrack);
    }
  }, {
    key: 'next',
    value: function next() {
      if (this.playlist.length) {
        var trackId = this.playlist.shift();
        var track = this.getTrackById(trackId);
        var nextIndex = this.tracks.indexOf(track);
      } else if (this.shuffled) {
        var nextIndex = Math.floor(Math.random() * this.tracks.length);
      } else {
        var track = this.getTrackById(this.trackId);
        var index = this.tracks.indexOf(track);
        var nextIndex = index + 1 < this.tracks.length - 1 ? index + 1 : 0;
      }
      var nextTrack = this.tracks[nextIndex];
      this.play(nextTrack);
    }
  }, {
    key: 'getTrackById',
    value: function getTrackById(trackId) {
      return this.tracks.reduce(function (track, item) {
        if (item.id === trackId) {
          track = item;
        }
        return track;
      }, false);
    }
  }, {
    key: 'getAudioLevel',
    value: function getAudioLevel() {
      var _this2 = this;

      var volume = { left: 0, right: 0 };
      this.analysers.forEach(function (analyser, index) {
        analyser.getByteFrequencyData(_this2.streamData);
        // this.analyserLeft.getByteTimeDomainData(this.streamData)
        var total = 0;
        for (var i = 0; i < 256; i++) {
          //this.streamData.length; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
          total += _this2.streamData[i];
        }
        var level = parseInt(total / 256);
        if (index == 0) {
          volume.left = Math.min(parseInt(level), 255);
        }
        if (index == 1) {
          volume.right = Math.min(parseInt(level), 255);
        }
      });
      return volume;
    }
  }, {
    key: 'sendAudioLevel',
    value: function sendAudioLevel() {
      var _this3 = this;

      socket.emit('audioLevel', { audioLevel: this.getAudioLevel() });
      setTimeout(function () {
        _this3.sendAudioLevel();
      }, 50);
    }
  }]);

  return Player;
}();

var player = new Player();
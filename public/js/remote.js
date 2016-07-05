'use strict';

var camera;
var scene;
var renderer;
var cubeMesh;
var light;
var clock;
var deltaTime;

var particleSystem;
var ambient;
var audioLevel = {
    left: 0,
    right: 0
};

init();
animate();

socket.on('state', function (state) {
    if ('audioLevel' in state) {
        audioLevel = state.audioLevel;
    }
});
function init() {
    clock = new THREE.Clock(true);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 50;
    ambient = new THREE.AmbientLight(0x111111, 0.1);
    scene.add(ambient);
    light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(1, -1, 1).normalize();
    scene.add(light);
    var geometry = new THREE.CubeGeometry(10, 10, 10);
    var material = new THREE.MeshPhongMaterial({ color: 0x0033ff, specular: 0x555555, shininess: 30 });

    cubeMesh = new THREE.Mesh(geometry, material);
    cubeMesh.position.z = -30;
    //  scene.add( cubeMesh );

    particleSystem = createParticleSystem();
    scene.add(particleSystem);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    $('.background').append(renderer.domElement).addClass('background');

    window.addEventListener('resize', onWindowResize, false);

    render();
}

function animate() {
    deltaTime = clock.getDelta();
    cubeMesh.rotation.x += 1 * deltaTime;
    cubeMesh.rotation.y += 2 * deltaTime;
    animateParticles();
    render();
    requestAnimationFrame(animate);
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function createParticleSystem() {

    // The number of particles in a particle system is not easily changed.
    var particleCount = 2000;

    // Particles are just individual vertices in a geometry
    // Create the geometry that will hold all of the vertices
    var particles = new THREE.Geometry();

    // Create the vertices and add them to the particles geometry
    for (var p = 0; p < particleCount; p++) {

        // This will create all the vertices in a range of -200 to 200 in all directions
        var x = Math.random() * 400 - 200;
        var y = Math.random() * 400 - 200;
        var z = Math.random() * 400 - 200;

        // Create the vertex
        var particle = new THREE.Vector3(x, y, z);

        // Add the vertex to the geometry
        particles.vertices.push(particle);
    }

    // Create the material that will be used to render each vertex of the geometry
    var particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 4,
        map: THREE.ImageUtils.loadTexture("/images/Smoke.png"),
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    // Create the particle system
    particleSystem = new THREE.Points(particles, particleMaterial);

    return particleSystem;
}
function animateParticles() {
    var verts = particleSystem.geometry.vertices;
    for (var i = 0; i < verts.length; i++) {
        var vert = verts[i];
        if (vert.y < -200) {
            vert.y = Math.random() * 400 - 200;
        }
        if (i < verts.length / 2) {
            vert.y = vert.y - audioLevel.left / 256;
        } else {
            vert.y = vert.y - audioLevel.right / 256;
        }
    }
    particleSystem.material.color.setRGB((audioLevel.left + audioLevel.right) / 256, (audioLevel.left + audioLevel.right) / 256, (audioLevel.left + audioLevel.right) / 256);
    particleSystem.geometry.verticesNeedUpdate = true;
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Library = function () {
  function Library(tracksData) {
    _classCallCheck(this, Library);

    this.tracks = [];
    this.artists = [];
    this.insert = this.insert.bind(this);
    this.update(tracksData);
  }

  _createClass(Library, [{
    key: 'update',
    value: function update(tracksData) {
      var _this = this;

      // @todo Delete removed tracks and add only new tracks, ordering is important.
      tracksData.forEach(function (trackData) {
        _this.insert(trackData);
      });
    }
  }, {
    key: 'insert',
    value: function insert(trackData) {
      var _this2 = this;

      if (this.artists.length === 0 || this.artists[this.artists.length - 1].name !== trackData.artist) {
        this.artists.push({
          index: this.artists.length,
          name: trackData.artist,
          albums: []
        });
      }
      var artist = this.artists[this.artists.length - 1];

      if (artist.albums.length === 0 || artist.albums[artist.albums.length - 1].name !== trackData.album) {
        if (!trackData.picture) {
          trackData.picture = '../missing-art.png';
        }
        artist.albums.push({
          index: artist.albums.length,
          name: trackData.album,
          picture: trackData.picture,
          year: trackData.year,
          tracks: [],
          artist: artist
        });
      }
      var album = artist.albums[artist.albums.length - 1];

      var track = {
        id: trackData.id,
        title: trackData.title,
        disk: trackData.disk,
        track: trackData.track,
        duration: trackData.duration,
        album: album,
        artist: artist,
        path: trackData.path
      };
      track.next = function () {
        var index = _this2.tracks.indexOf(track) + 1;
        index = index < _this2.tracks.length - 1 ? index : 0;
        return _this2.tracks[index];
      };
      track.previous = function () {
        var index = _this2.tracks.indexOf(track) - 1;
        index = index > 0 ? index : _this2.tracks.length;
        return _this2.tracks[index];
      };

      this.tracks.push(track);
      album.tracks.push(track);
    }
  }, {
    key: 'getTracks',
    value: function getTracks() {
      return this.tracks;
    }
  }, {
    key: 'getTrackById',
    value: function getTrackById(trackId) {
      var track = this.tracks.reduce(function (track, item) {
        if (item.id === trackId) {
          track = item;
        }
        return track;
      }, false);
      return track;
    }
  }, {
    key: 'getArtists',
    value: function getArtists() {
      return this.artists;
    }
  }]);

  return Library;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var bentest;

var Matrix = function (_React$Component) {
  _inherits(Matrix, _React$Component);

  function Matrix(props, context) {
    _classCallCheck(this, Matrix);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Matrix).call(this, props, context));

    _this.alignMatrix = _this.alignMatrix.bind(_this);
    _this.animate = _this.animate.bind(_this);
    _this.column = props.track.artist.index;
    _this.columns = props.artists.map(function (artist, index) {
      var artistId = 'artist-' + artist.albums[0].tracks[0].id;
      var row = 0;
      if (localStorage.getItem(artistId) !== null) {
        row = parseInt(localStorage.getItem(artistId));
      }
      return row;
    });
    _this.columns[_this.column] = props.track.album.index;
    _this.term = '';
    _this.state = {
      paused: true
    };
    socket.on('state', function (state) {
      if ('paused' in state) {
        _this.setState({ paused: state.paused });
      }
    });
    return _this;
  }

  _createClass(Matrix, [{
    key: 'alignMatrix',
    value: function alignMatrix() {
      $('.matrix').css({
        'padding-top': ($(window).innerHeight() - this.props.size) / 2,
        'padding-left': ($(window).width() - this.props.size) / 2
      });
    }
  }, {
    key: 'animate',
    value: function animate() {
      var _this2 = this;

      this.columns.forEach(function (row, column) {
        if (column !== _this2.column) {
          $('.matrix__column').eq(column).stop(true).css({ 'margin-top': -_this2.props.size * row });
        }
      });
      $('.matrix__column').eq(this.column).stop(true).animate({ 'margin-top': -this.props.size * this.columns[this.column] });
      $('.matrix').stop(true).animate({ 'margin-left': -this.props.size * this.column });
      $('.picture--selected').removeClass('picture--selected');
      $('.matrix__column').eq(this.column).find('.matrix__row').eq(this.columns[this.column]).find('.picture').addClass('picture--selected').focus();
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (nextProps.track !== this.props.track) {
        this.column = nextProps.track.artist.index;
        this.columns[this.column] = nextProps.track.album.index;
        this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks);
        this.animate();
      }
      // @todo Return true only if albums have changed.
      return false;
    }
  }, {
    key: 'moveToColumn',
    value: function moveToColumn(column) {
      if (column < 0) {
        column = 0;
      } else if (column > this.props.artists.length - 1) {
        column = this.props.artists.length - 1;
      }
      this.column = column;
      this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks);
      this.animate();
    }
  }, {
    key: 'moveToRow',
    value: function moveToRow(column, row) {
      var artistId = 'artist-' + this.props.artists[column].albums[0].tracks[0].id;
      var albums = this.props.artists[column].albums;
      if (row < 0) {
        row = 0;
      } else if (row > albums.length - 1) {
        row = albums.length - 1;
      }
      this.columns[column] = row;
      localStorage.setItem(artistId, row);
      this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks);
      this.animate();
    }
  }, {
    key: 'moveTo',
    value: function moveTo(column, row) {
      this.moveToColumn(column);
      this.moveToRow(column, row);
      this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks);
      this.animate();
    }
  }, {
    key: 'findColumnIndexByArtistName',
    value: function findColumnIndexByArtistName(term) {
      var columnIndex = -1;
      this.props.artists.forEach(function (artist, index) {
        if (columnIndex < 0) {
          if (artist.name.toUpperCase().startsWith(term)) {
            columnIndex = index;
          }
        }
      });
      return columnIndex;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      $(window).on('resize', this.alignMatrix);
      $('.matrix__column').css({ width: this.props.size + 'px' });
      this.alignMatrix();
      this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks);
      this.animate();
      $('body').keydown(function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        switch (code) {
          case 32:
            socket.emit('remote', {
              command: 'pause'
            });
            break;
          case 37:
            _this3.moveToColumn(_this3.column - 1);
            break;
          case 39:
            _this3.moveToColumn(_this3.column + 1);
            break;
          case 38:
            _this3.moveToRow(_this3.column, _this3.columns[_this3.column] - 1);
            break;
          case 40:
            _this3.moveToRow(_this3.column, _this3.columns[_this3.column] + 1);
            break;
          case 13:
            // Play selected album.
            var track = _this3.props.artists[_this3.column].albums[_this3.columns[_this3.column]].tracks[0];
            socket.emit('remote', {
              command: 'play',
              trackId: track.id
            });
            break;
          default:
            clearTimeout(_this3.termTimeout);
            _this3.termTimeout = setTimeout(function () {
              _this3.term = '';
            }, 500);
            _this3.term += String.fromCharCode(code);
            var artistIndex = _this3.findColumnIndexByArtistName(_this3.term);
            if (artistIndex >= 0) {
              _this3.moveToColumn(artistIndex);
            }
            break;
        }
      });

      var columnSwipe = new Hammer($('.matrix__wrap')[0]); //, myOptions);
      columnSwipe.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      columnSwipe.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

      columnSwipe.on('pan', function (e) {
        var oldMarginLeft = -_this3.props.size * _this3.column;
        var newMarginLeft = oldMarginLeft + e.deltaX;
        if (e.isFinal) {
          if (e.velocityX < 0.65) {
            var newColumn = Math.floor(-newMarginLeft / _this3.props.size + 0.5);
            _this3.moveToColumn(newColumn);
          }
        } else {
          $('.matrix').stop(true).css({ 'margin-left': newMarginLeft });
        }
      });

      columnSwipe.on('swipe', function (e) {
        if (e.isFinal) {
          var newColumn = _this3.column - Math.floor(3 * e.velocityX);
          _this3.moveToColumn(newColumn);
        }
      });

      var rowSwipe = new Hammer($('.matrix__wrap')[0]);
      rowSwipe.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
      rowSwipe.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL });

      rowSwipe.on('pan', function (e) {
        var oldMarginTop = -_this3.props.size * _this3.columns[_this3.column];
        var newMarginTop = oldMarginTop + e.deltaY;
        if (e.isFinal) {
          if (e.velocityY < 0.65) {
            var newRow = Math.floor(-newMarginTop / _this3.props.size + 0.5);
            _this3.moveToRow(_this3.column, newRow);
          }
        } else {
          $('.matrix__column').eq(_this3.column).stop(true).css({ 'margin-top': newMarginTop });
        }
      });

      rowSwipe.on('swipe', function (e) {
        if (e.isFinal) {
          var newRow = _this3.columns[_this3.column] - Math.floor(3 * e.velocityY);
          _this3.moveToRow(_this3.column, newRow);
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var columns = this.props.artists.map(function (artist, key) {
        var moveToRow = function moveToRow(row) {
          _this4.moveTo(key, row);
        };
        return React.createElement(Column, { artist: artist, key: key, moveToRow: moveToRow });
      });
      return React.createElement(
        'div',
        { className: 'matrix__wrap' },
        React.createElement(
          'div',
          { className: 'matrix' },
          columns
        )
      );
    }
  }]);

  return Matrix;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Column = function (_React$Component) {
  _inherits(Column, _React$Component);

  function Column() {
    _classCallCheck(this, Column);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Column).apply(this, arguments));
  }

  _createClass(Column, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var rows = this.props.artist.albums.map(function (album, key) {
        var onClick = function onClick() {
          _this2.props.moveToRow(key);
          $('.tracks').toggleClass('hide-for-small-only');
        };
        return React.createElement(Row, { album: album, key: key, onClick: onClick });
      });
      return React.createElement(
        'div',
        { className: 'matrix__column' },
        rows
      );
    }
  }]);

  return Column;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Row = function (_React$Component) {
  _inherits(Row, _React$Component);

  function Row() {
    _classCallCheck(this, Row);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Row).apply(this, arguments));
  }

  _createClass(Row, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'matrix__row' },
        React.createElement(
          'div',
          { className: 'picture', onClick: this.props.onClick },
          React.createElement('div', { className: 'picture__content', style: { backgroundImage: 'url(/pictures/' + this.props.album.picture + ')' } })
        )
      );
    }
  }]);

  return Row;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracks = function (_React$Component) {
  _inherits(Tracks, _React$Component);

  // @todo shouldComponentUpdate could be used to see if tracks have changed.

  function Tracks(props, context) {
    _classCallCheck(this, Tracks);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Tracks).call(this, props, context));

    _this.state = {
      playlist: []
    };
    socket.on('state', function (state) {
      if ('playlist' in state) {
        _this.setState({ playlist: state.playlist });
      }
    });
    socket.emit('request', ['playlist']);
    return _this;
  }

  _createClass(Tracks, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      $('.js-tracklist').perfectScrollbar();
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate() {
      $('.js-tracklist').perfectScrollbar('destroy');
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      $('.js-tracklist').perfectScrollbar();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var tracks = this.props.tracks.map(function (track, key) {
        var play = function play() {
          socket.emit('remote', {
            command: 'play',
            trackId: track.id
          });
        };
        var queue = function queue() {
          _this2.state.playlist.push(track.id);
          socket.emit('remote', {
            command: 'playlist',
            playlist: _this2.state.playlist
          });
        };
        var className = track === _this2.props.track ? 'tracks__track tracks__track--active' : 'tracks__track';
        return React.createElement(
          'li',
          { className: className, key: key },
          React.createElement('i', { onClick: queue, className: 'tracks__icon fi-plus' }),
          React.createElement(
            'span',
            { className: 'tracks__name tracks__name--clickable', onClick: play },
            track.title
          )
        );
      });

      return React.createElement(
        'div',
        { className: 'side-bar side-bar--left show-for-large' },
        React.createElement(
          'div',
          { className: 'side-bar__content js-tracklist' },
          React.createElement(
            'ul',
            { className: 'tracks' },
            tracks
          )
        )
      );
    }
  }]);

  return Tracks;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Info = function (_React$Component) {
  _inherits(Info, _React$Component);

  function Info() {
    _classCallCheck(this, Info);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Info).apply(this, arguments));
  }

  _createClass(Info, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'info' },
        React.createElement(
          'span',
          { className: 'info__track' },
          this.props.track.title
        ),
        React.createElement(
          'span',
          { className: 'info__album' },
          '  / ',
          this.props.track.album.name
        ),
        React.createElement(
          'span',
          { className: 'info__artist' },
          ' / ',
          this.props.track.artist.name
        )
      );
    }
  }]);

  return Info;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Playlist = function (_React$Component) {
  _inherits(Playlist, _React$Component);

  // @todo shouldComponentUpdate could be used to see if tracks have changed.

  function Playlist(props, context) {
    _classCallCheck(this, Playlist);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Playlist).call(this, props, context));

    _this.state = {
      playlist: []
    };
    socket.on('state', function (state) {
      if ('playlist' in state) {
        _this.setState({ playlist: state.playlist });
      }
    });
    socket.emit('request', ['playlist']);
    return _this;
  }

  _createClass(Playlist, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      $('.js-playlist').perfectScrollbar();
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate() {
      $('.js-playlist').perfectScrollbar('destroy');
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      $('.js-playlist').perfectScrollbar();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var tracks = this.state.playlist.map(function (trackId, key) {
        var track = _this2.props.library.getTrackById(trackId);
        var remove = function remove() {
          _this2.state.playlist.splice(key, 1);
          socket.emit('remote', {
            command: 'playlist',
            playlist: _this2.state.playlist
          });
        };
        return React.createElement(
          'li',
          { className: 'tracks__track', key: key },
          React.createElement(
            'span',
            { className: 'tracks__name' },
            track.title
          ),
          React.createElement('i', { onClick: remove, className: 'tracks__icon fi-minus' })
        );
      });

      return React.createElement(
        'div',
        { className: 'side-bar side-bar--right show-for-large' },
        React.createElement(
          'div',
          { className: 'side-bar__content js-playlist' },
          React.createElement(
            'ul',
            { className: 'tracks' },
            tracks
          )
        )
      );
    }
  }]);

  return Playlist;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Controls = function (_React$Component) {
  _inherits(Controls, _React$Component);

  function Controls(props, context) {
    _classCallCheck(this, Controls);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Controls).call(this, props, context));

    _this.state = {
      currentTime: 0,
      paused: true,
      shuffled: false,
      volume: 0.5
    };
    socket.on('state', function (state) {
      if ('currentTime' in state) {
        _this.setState({ currentTime: state.currentTime });
      }
      if ('paused' in state) {
        _this.setState({ paused: state.paused });
      }
      if ('shuffled' in state) {
        _this.setState({ shuffled: state.shuffled });
      }
      if ('volume' in state) {
        _this.setState({ volume: state.volume });
      }
    });
    socket.emit('request', ['currentTime', 'paused', 'shuffled', 'volume']);
    _this.previous = _this.previous.bind(_this);
    _this.next = _this.next.bind(_this);
    _this.pause = _this.pause.bind(_this);
    _this.shuffle = _this.shuffle.bind(_this);
    _this.volumeUp = _this.volumeUp.bind(_this);
    _this.volumeDown = _this.volumeDown.bind(_this);
    _this.progressTime();
    return _this;
  }

  _createClass(Controls, [{
    key: 'progressTime',
    value: function progressTime() {
      var _this2 = this;

      var previousTime = new Date().getTime();
      setInterval(function () {
        if (!_this2.state.paused) {
          var currentTime = new Date().getTime();
          var elapsedTime = (currentTime - previousTime) / 1000;
          previousTime = currentTime;
          _this2.setState({
            currentTime: _this2.state.currentTime + elapsedTime
          });
        } else {
          previousTime = new Date().getTime();
        }
      }, 100);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      $('.controls .progress').click(function (e) {
        var time = e.offsetX / $('.controls .progress').width() * _this3.props.track.duration;
        socket.emit('remote', {
          command: 'seek',
          position: time
        });
      });
    }
  }, {
    key: 'previous',
    value: function previous() {
      socket.emit('remote', {
        command: 'previous'
      });
    }
  }, {
    key: 'next',
    value: function next() {
      socket.emit('remote', {
        command: 'next'
      });
    }
  }, {
    key: 'pause',
    value: function pause() {
      socket.emit('remote', {
        command: 'pause'
      });
    }
  }, {
    key: 'shuffle',
    value: function shuffle() {
      socket.emit('remote', {
        command: 'shuffle'
      });
    }
  }, {
    key: 'volumeUp',
    value: function volumeUp() {
      var volume = this.state.volume + 0.05;
      volume = volume < 1 ? volume : 1;
      socket.emit('remote', {
        command: 'volume',
        level: volume
      });
    }
  }, {
    key: 'volumeDown',
    value: function volumeDown() {
      var volume = this.state.volume - 0.05;
      volume = volume > 0 ? volume : 0;
      socket.emit('remote', {
        command: 'volume',
        level: volume
      });
    }
  }, {
    key: 'toggleTracks',
    value: function toggleTracks() {
      $('.side-bar--left').toggleClass('show-for-large');
      $('.side-bar--right').addClass('show-for-large');
    }
  }, {
    key: 'togglePlaylist',
    value: function togglePlaylist() {
      $('.side-bar--right').toggleClass('show-for-large');
      $('.side-bar--left').addClass('show-for-large');
    }
  }, {
    key: 'render',
    value: function render() {
      var playPauseText = this.state.paused ? 'play' : 'pause';
      var width = this.state.currentTime / this.props.track.duration * 100;
      var shuffleClass = this.state.shuffled ? '' : 'controls__icon--disabled';
      return React.createElement(
        'div',
        { className: 'controls' },
        React.createElement('i', { onClick: this.toggleTracks, className: 'hide-for-large controls__icon fi-list float-left' }),
        React.createElement('i', { onClick: this.previous, className: 'controls__icon fi-previous' }),
        React.createElement('i', { onClick: this.pause, className: 'controls__icon fi-' + playPauseText }),
        React.createElement('i', { onClick: this.next, className: 'controls__icon fi-next' }),
        React.createElement('i', { onClick: this.shuffle, className: 'controls__icon fi-shuffle ' + shuffleClass }),
        React.createElement('i', { onClick: this.volumeDown, className: 'controls__icon fi-volume-none' }),
        React.createElement(
          'span',
          { className: 'controls__volume-percent' },
          parseInt(this.state.volume * 100 + 0.5),
          '%'
        ),
        React.createElement('i', { onClick: this.volumeUp, className: 'controls__icon fi-volume' }),
        React.createElement('i', { onClick: this.togglePlaylist, className: 'hide-for-large controls__icon fi-list float-right' }),
        React.createElement(
          'div',
          { className: 'progress controls__progress' },
          React.createElement('div', { className: 'progress-meter', style: { width: width + '%' } })
        )
      );
    }
  }]);

  return Controls;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Yamp = function (_React$Component) {
  _inherits(Yamp, _React$Component);

  function Yamp(props, context) {
    _classCallCheck(this, Yamp);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Yamp).call(this, props, context));

    _this.library = new Library([]);
    _this.state = {
      currentTracks: [],
      track: null,
      size: 150
    };
    socket.on('state', function (state) {
      if ('tracks' in state) {
        // @todo Support library updates.
        if (_this.library.tracks.length === 0) {
          _this.library = new Library([]);
          _this.library.update(state.tracks);
          _this.forceUpdate();
        }
      }
      if ('trackId' in state) {
        var track = _this.library.getTrackById(state.trackId);
        _this.setState({
          track: track,
          tracks: track.album.tracks
        });
      }
    });

    _this.setCurrentTracks = _this.setCurrentTracks.bind(_this);
    socket.emit('request', ['tracks', 'trackId']);
    return _this;
  }

  _createClass(Yamp, [{
    key: 'setCurrentTracks',
    value: function setCurrentTracks(tracks) {
      this.setState({ currentTracks: tracks });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state.track) {
        return React.createElement(
          'div',
          null,
          'loading..'
        );
      }
      return React.createElement(
        'div',
        { className: 'yamp' },
        React.createElement(Matrix, { size: this.state.size, artists: this.library.getArtists(), setCurrentTracks: this.setCurrentTracks, track: this.state.track }),
        React.createElement(Tracks, { track: this.state.track, tracks: this.state.currentTracks }),
        React.createElement(Info, { track: this.state.track }),
        React.createElement(Playlist, { library: this.library }),
        React.createElement(Controls, { track: this.state.track })
      );
    }
  }]);

  return Yamp;
}(React.Component);

ReactDOM.render(React.createElement(Yamp, null), $('#yamp')[0]);
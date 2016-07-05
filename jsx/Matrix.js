var bentest

class Matrix extends React.Component {

  constructor(props, context) {
    super(props, context)
    this.alignMatrix = this.alignMatrix.bind(this)
    this.animate = this.animate.bind(this)
    this.column = props.track.artist.index
    this.columns = props.artists.map((artist, index) => {
      var artistId = 'artist-' + artist.albums[0].tracks[0].id
      var row = 0
      if (localStorage.getItem(artistId) !== null) {
        row = parseInt(localStorage.getItem(artistId))
      }
      return row
    })
    this.columns[this.column] = props.track.album.index
    this.term = ''
    this.state = {
      paused: true
    }
    socket.on('state', (state) => {
      if ('paused' in state) {
        this.setState({paused: state.paused})
      }
    })
  }

  alignMatrix() {
    $('.matrix').css({
      'padding-top': ($(window).innerHeight() - this.props.size) / 2,
      'padding-left': ($(window).width() - this.props.size) / 2
    })
  }

  animate() {
    this.columns.forEach((row, column) => {
      if (column !== this.column) {
        $('.matrix__column').eq(column).stop(true).css({'margin-top': - this.props.size * row})
      }
    })
    $('.matrix__column').eq(this.column).stop(true).animate({'margin-top': - this.props.size * this.columns[this.column]})
    $('.matrix').stop(true).animate({'margin-left': - this.props.size * this.column})
    $('.picture--selected').removeClass('picture--selected')
    $('.matrix__column').eq(this.column).find('.matrix__row').eq(this.columns[this.column]).find('.picture').addClass('picture--selected').focus()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.track !== this.props.track) {
      this.column = nextProps.track.artist.index
      this.columns[this.column] = nextProps.track.album.index
      this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks)
      this.animate()
    }
    // @todo Return true only if albums have changed.
    return false
  }

  moveToColumn(column) {
    if (column < 0){
      column = 0
    }
    else if (column > this.props.artists.length - 1) {
      column = this.props.artists.length - 1
    }
    this.column = column
    this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks)
    this.animate()
  }

  moveToRow(column, row) {
    var artistId = 'artist-' + this.props.artists[column].albums[0].tracks[0].id
    var albums = this.props.artists[column].albums
    if (row < 0) {
      row = 0
    }
    else if (row > albums.length - 1) {
      row = albums.length - 1
    }
    this.columns[column] = row
    localStorage.setItem(artistId, row)
    this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks)
    this.animate()
  }

  moveTo(column, row) {
    this.moveToColumn(column)
    this.moveToRow(column, row)
    this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks)
    this.animate()
  }

  findColumnIndexByArtistName(term) {
    var columnIndex = -1
    this.props.artists.forEach((artist, index) => {
      if (columnIndex < 0) {
        if (artist.name.toUpperCase().startsWith(term)) {
          columnIndex = index
        }
      }
    })
    return columnIndex
  }

  componentDidMount() {
    $(window).on('resize', this.alignMatrix)
    $('.matrix__column').css({width: this.props.size + 'px'})
    this.alignMatrix()
    this.props.setCurrentTracks(this.props.artists[this.column].albums[this.columns[this.column]].tracks)
    this.animate()
    $('body').keydown((e) => {
      var code = (e.keyCode ? e.keyCode : e.which);
      switch(code) {
        case 32:
          socket.emit('remote', {
            command: 'pause'
          })
          break;
        case 37:
          this.moveToColumn(this.column - 1)
          break;
        case 39:
          this.moveToColumn(this.column + 1)
          break;
        case 38:
          this.moveToRow(this.column, this.columns[this.column] - 1)
          break;
        case 40:
          this.moveToRow(this.column, this.columns[this.column] + 1)
          break;
        case 13:
          // Play selected album.
          var track = this.props.artists[this.column].albums[this.columns[this.column]].tracks[0]
          socket.emit('remote', {
            command: 'play',
            trackId: track.id
          })
          break;
        default:
          clearTimeout(this.termTimeout)
          this.termTimeout = setTimeout(() => {
            this.term = ''
          }, 500)
          this.term += String.fromCharCode(code)
          var artistIndex = this.findColumnIndexByArtistName(this.term)
          if (artistIndex >= 0) {
            this.moveToColumn(artistIndex)
          }
          break;
      }
    })

    var columnSwipe = new Hammer($('.matrix__wrap')[0]);//, myOptions);
    columnSwipe.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    columnSwipe.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

    columnSwipe.on('pan', (e) => {
      var oldMarginLeft = - this.props.size * this.column
      var newMarginLeft = oldMarginLeft + e.deltaX
      if (e.isFinal) {
        if (e.velocityX < 0.65) {
        var newColumn = Math.floor(-newMarginLeft / this.props.size + 0.5)
          this.moveToColumn(newColumn)
        }
      }
      else {
        $('.matrix').stop(true).css({'margin-left': newMarginLeft })
      }
    })

    columnSwipe.on('swipe', (e) => {
      if (e.isFinal) {
        var newColumn = this.column - Math.floor(3 * e.velocityX)
        this.moveToColumn(newColumn)
      }
    })


    var rowSwipe = new Hammer($('.matrix__wrap')[0]);
    rowSwipe.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
    rowSwipe.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL });

    rowSwipe.on('pan', (e) => {
      var oldMarginTop = - this.props.size * this.columns[this.column]
      var newMarginTop = oldMarginTop + e.deltaY
      if (e.isFinal) {
        if (e.velocityY < 0.65) {
        var newRow = Math.floor(- newMarginTop / this.props.size + 0.5)
          this.moveToRow(this.column, newRow)
        }
      }

      else {
        $('.matrix__column').eq(this.column).stop(true).css({'margin-top': newMarginTop})
      }
    })

    rowSwipe.on('swipe', (e) => {
      if (e.isFinal) {
        var newRow = this.columns[this.column] - Math.floor(3 * e.velocityY)
        this.moveToRow(this.column, newRow)
      }
    })
  }

  render() {
    var columns = this.props.artists.map((artist, key) => {
      var moveToRow = (row) => {
        this.moveTo(key, row)
      }
      return (
        <Column artist={artist} key={key} moveToRow={moveToRow}/>
      )
    })
    return (
      <div className='matrix__wrap'>
        <div className='matrix'>
          {columns}
        </div>
      </div>
    )
  }

}

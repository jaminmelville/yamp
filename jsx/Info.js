class Info extends React.Component {

  render() {
    return (
      <div className='info'>
        <span className='info__track'>{this.props.track.title}</span>
        <span className='info__album'>  / {this.props.track.album.name}</span>
        <span className='info__artist'> / {this.props.track.artist.name}</span>
      </div>
    )
  }

}

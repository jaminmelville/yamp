class Row extends React.Component {

  render() {
    return (
      <div className='matrix__row'>
        <div className='picture' onClick={this.props.onClick}>
          <div className='picture__content' style={{backgroundImage: 'url(/pictures/' + this.props.album.picture + ')'}} />
        </div>
      </div>
    )
  }

}

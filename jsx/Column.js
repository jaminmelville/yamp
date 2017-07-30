class Column extends React.Component {

  render() {
    var rows = this.props.artist.albums.map((album, key) => {
      var onClick = () => {
        this.props.moveToRow(key)
        window.jQuery('.tracks').toggleClass('hide-for-small-only')
      }
      return (
        <Row album={album} key={key} onClick={onClick}/>
      )
    })
    return (
      <div className='matrix__column'>
        {rows}
      </div>
    )
  }

}

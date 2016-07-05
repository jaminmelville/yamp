var express = require('express')
var http = require('http')
var hbs = require('hbs')
var socket = require('socket.io')
var config = require('./config.json')
var Library = require('./Library.js')

var app = express()
var server = http.Server(app)
var io = socket(server)
var library = new Library(config.root).on('change', (tracks) => {
  io.emit('tracks', tracks)
})
var playerSocket = null

io.on('connection', function (socket) {

  if (playerSocket === null) {
    playerSocket = socket
    playerSocket.on('disconnect', () => {
      playerSocket = null
      // @todo Disconnect all socket connections.
    })
    playerSocket.on('audioLevel', (data) => {
      io.volatile.emit('state', data)
    })
    playerSocket.on('state', (data) => {
      io.emit('state', data)
    })
    playerSocket.emit('tracks', library.get())
  }
  socket.on('request', (data) => {
    playerSocket.emit('request', data)
  })
  socket.on('remote', (data) => {
    playerSocket.emit('remote', data)
  })
})

app.set('views', './views')
app.set('view engine', 'hbs')
app.use(express.static('./public'))
app.use(config.root, express.static(config.root))

app.get('/', (req, res) => {
  var type = playerSocket ? 'remote' : 'player'
  res.render('index', {type: type, isPlayer: !playerSocket})
})

app.get('/player', (req, res) => {
  if (playerSocket) {
    res.status(403).send('Forbidden - there is a player already')
  }
  else {
    res.render('player')
  }
})

server.listen(config.port)

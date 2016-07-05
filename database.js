var mysql = require('mysql')

exports.query = (query, cb) => {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'ben',
    password: 'password',
    database: 'yamp'
  })
  connection.connect()
  connection.query(query, (err, results) => {
    cb(err, results)
    connection.end()
  })
}

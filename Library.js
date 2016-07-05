'use strict'

var fs = require('fs')
var util = require('util')
var mm = require('musicmetadata')
var async = require('async')
var Database = require('./database.js')
var squel = require("squel")

class Library {

  constructor(root) {
    var self = this
    this.root = root
    this.tracks = []
    this.generateTrackFileDiff = this.generateTrackFileDiff.bind(this)
    this.createTracks = this.createTracks.bind(this)
    this.createTrack = this.createTrack.bind(this)
    this.updateTracks = this.updateTracks.bind(this)
    this.insertTrack = this.insertTrack.bind(this)
    this.deleteTracks = this.deleteTracks.bind(this)
    this.deleteOrphanedPictures = this.deleteOrphanedPictures.bind(this)
    this.sync = this.sync.bind(this)
    this.events = {
      change: () => {}
    }
    async.series([
      self.updateTracks,
      self.sync
    ])
    return this
  }

  updateTracks(cb) {
    var self = this
    var query = squel.select().from('Tracks')
      .order('artist')
      .order('album')
      .order('disk')
      .order('track')
      .toString()
    Database.query(query, (err, tracks) => {
      self.tracks = tracks
      self.events.change(tracks)
      cb()
    })
  }

  sync(cb) {
    var self = this
    async.waterfall([
      self.generateTrackFileDiff,
      (diff, cb) => {
        async.series([
          (cb) => {
            self.deleteTracks(diff.removed, cb)
          },
          (cb) => {
            self.createTracks(diff.added, cb)
          },
          self.deleteOrphanedPictures
        ], cb)
      }
    ], cb)
  }

  generateTrackFileDiff(cb) {
    var self = this
    this.getTrackFilesFromFilesystem((err, trackFilesFromFilesystem) => {
      var diff = {
        added: trackFilesFromFilesystem.filter((x) => {
          var isAdded = true
          self.tracks.forEach((y) => {
            if (x.path === y.path && x.mtime === y.mtime) {
              isAdded = false
            }
          })
          return isAdded
        }),
        removed: self.tracks.filter((x) => {
          var isRemoved = true
          trackFilesFromFilesystem.forEach((y) => {
            if (x.path === y.path && x.path === y.path) {
              isRemoved = false
            }
          })
          return isRemoved
        })
      }
      cb(null, diff)
    })
  }

  getTrackFilesFromFilesystem(cb) {
    var trackFiles = []
    var getTrackFilesFromFilesystemRecursively = (root) => {
      var items = fs.readdirSync(root)
      items.forEach((item) => {
        var path = root + '/' + item
        var stat = fs.statSync(path)
        if (stat.isDirectory()) {
          getTrackFilesFromFilesystemRecursively(path)
        }
        else if(stat.isFile() && path.endsWith('.mp3')) {
          var mtime = new Date(util.inspect(stat).match(/mtime: (.*),/)[1]).getTime()
          trackFiles.push({path: path, mtime: mtime})
        }
      })
    }
    getTrackFilesFromFilesystemRecursively(this.root)
    cb(null, trackFiles)
  }

  getMetadata(file, cb) {
    var stream = fs.createReadStream(file.path)
    var parser = mm(stream, {duration: true}, (err, result) => {
      stream.destroy()
      cb(err, result)
    })
  }

  createPicture(trackFile, metadata, cb) {
    var metadataHasPicture = (typeof(metadata.picture) !== 'undefined' && metadata.picture.length)
    var picture  = ''
    if (metadataHasPicture) {
      picture = (new Date().getTime()) + '.' + metadata.picture[0].format
      fs.writeFileSync('./public/pictures/' + picture, metadata.picture[0].data, 'base64')
    }
    else {
      // check if there's a picture in same directory as trackFile
      var tracksDirectory = require('path').dirname(trackFile.path)
      var filesInTracksDirectory = fs.readdirSync(tracksDirectory)
      filesInTracksDirectory.forEach((fileInTracksDirectory) => {
        if (fileInTracksDirectory.match(/\.(jpg|png|jpeg|JPG|PNG)$/)) {
          picture = (new Date().getTime()) + '.' + require('path').extname(fileInTracksDirectory)
          fs.createReadStream(tracksDirectory + '/' + fileInTracksDirectory)
            .pipe(fs.createWriteStream('./public/pictures/'+ picture))
        }
      })
    }
    cb(null, picture)
  }

  createTracks(trackFiles, cb) {
    var self = this
    async.eachSeries(trackFiles, self.createTrack, cb)
  }

  createTrack(trackFile, cb) {
    var self = this
    async.waterfall([
      (cb) => {
        self.getMetadata(trackFile, cb)
      },
      (metadata, cb) => {
        self.createPicture(trackFile, metadata, (err, picture) => {
          cb(null, metadata, picture)
        })
      },
      (metadata, picture, cb) => {
        var track = {
          path: trackFile.path.replace(new RegExp("'", 'g'), "\\'"),
          mtime: trackFile.mtime,
          title: metadata.title.replace(new RegExp("'", 'g'), "\\'"),
          artist: metadata.artist[0].replace(new RegExp("'", 'g'), "\\'"),
          album: metadata.album.replace(new RegExp("'", 'g'), "\\'"),
          track: metadata.track.no,
          disk: metadata.disk.no,
          duration: metadata.duration,
          picture: picture,
          year: parseInt(metadata.year) ? parseInt(metadata.year) : 0
        }
        cb(null, track)
      },
      self.insertTrack
    ], cb)
  }

  insertTrack(track, cb) {
    var self = this
    var query = squel.insert().into("Tracks").setFields(track).toString()
    Database.query(query, (err) => {
      if (err) {
        console.log(err)
      }
      self.updateTracks(cb)
    })
  }

  deleteTracks(tracks, cb) {
    var self = this
    if (tracks.length === 0) {
      cb()
    }
    else {
      var ids = tracks.map((track) => {
        return track.id
      })
      var query = squel.delete().from("Tracks").where('id IN (' + ids.join(',') + ')').toString()
      Database.query(query, (err) => {
        if (err) {
          console.log(err)
        }
        self.updateTracks(cb)
      })
    }
  }

  deleteOrphanedPictures(cb) {
    var self = this
    var picturesFromFilesystem = fs.readdirSync('./public/pictures')
    var picturesToRemove = picturesFromFilesystem.filter((pictureFromFilesystem) => {
      var toRemove = true
      self.tracks.forEach((track) => {
        if (pictureFromFilesystem === track.picture) {
          toRemove = false
        }
      })
      return toRemove
    })
    picturesToRemove.forEach((picture) => {
      fs.unlinkSync('./public/pictures/' + picture)
    })
    cb()
  }

  get() {
    return this.tracks
  }

  on(event, fn) {
    this.events[event] = fn
    return this
  }

}

module.exports = Library

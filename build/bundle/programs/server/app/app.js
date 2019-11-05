var require = meteorInstall({"imports":{"api":{"Artists.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// imports/api/Artists.js                                            //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.export({
  Artists: () => Artists
});
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const Artists = new Mongo.Collection('artists');
Artists.allow({
  insert: (userId, doc) => userId === doc.owner,
  remove: (userId, doc) => userId === doc.owner,
  update: (userId, doc) => userId === doc.owner,
  fetch: ['owner']
});
module.exportDefault(Artists);
///////////////////////////////////////////////////////////////////////

},"State.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// imports/api/State.js                                              //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.export({
  State: () => State
});
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const State = new Mongo.Collection('state');
State.allow({
  remove: (userId, doc) => userId === doc.owner,
  update: (userId, doc) => userId === doc.owner,
  fetch: ['owner']
});
module.exportDefault(State);
///////////////////////////////////////////////////////////////////////

}}},"server":{"google-oauth.js":function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// server/google-oauth.js                                            //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
const settings = Meteor.settings.google;

if (settings) {
  ServiceConfiguration.configurations.remove({
    service: 'google'
  });
  ServiceConfiguration.configurations.insert({
    service: 'google',
    clientId: settings.clientId,
    secret: settings.secret
  });
}
///////////////////////////////////////////////////////////////////////

},"main.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// server/main.js                                                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let google;
module.watch(require("googleapis"), {
  google(v) {
    google = v;
  }

}, 1);
let Future;
module.watch(require("fibers/future"), {
  default(v) {
    Future = v;
  }

}, 2);
let Accounts;
module.watch(require("meteor/accounts-base"), {
  Accounts(v) {
    Accounts = v;
  }

}, 3);
let Artists;
module.watch(require("../imports/api/Artists"), {
  Artists(v) {
    Artists = v;
  }

}, 4);
let State;
module.watch(require("../imports/api/State"), {
  State(v) {
    State = v;
  }

}, 5);
Meteor.startup(() => {
  // code to run on server at startup
  const auth = 'AIzaSyC0IOZksTukz8kfTmrB59V90oPCs4l5GPs';
  const youtube = google.youtube({
    version: 'v3',
    auth
  });
  Meteor.methods({
    youtubeSearch: (term, regionCode) => {
      const myFuture = new Future();
      youtube.search.list({
        part: 'id,snippet',
        q: term,
        type: 'video',
        regionCode,
        videoSyndicated: 'true'
      }, (err, result) => {
        myFuture.return(result.data.items[0].id.videoId);
      });
      return myFuture.wait();
    },
    insertRelease: artist => {
      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }

      console.log('yee');
      const selector = {
        owner: Meteor.userId(),
        '@.id': artist['@'].id
      };
      const artistExists = Artists.find(selector).count();

      if (artistExists) {
        Artists.update(selector, {
          $push: {
            releases: artist.releases[0]
          }
        });
      } else {
        Artists.insert(artist);
      }
    },
    removeRelease: releaseId => {
      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }

      const selector = {
        owner: Meteor.userId(),
        'releases.@.id': releaseId
      };
      const artist = Artists.findOne(selector);

      if (artist.releases.length === 1) {
        Artists.remove(selector);
      } else {
        Artists.update(selector, {
          $pull: {
            releases: {
              '@.id': releaseId
            }
          }
        });
      }
    }
  });
});
Meteor.publish('appData', () => [Artists.find({
  owner: Meteor.userId()
}, {
  sort: {
    'sort-name': 1
  },
  fields: {
    name: 1,
    'sort-name': 1,
    '@.id': 1,
    'releases.@.id': 1,
    'releases.title': 1,
    'releases.cover-art-archive.artwork': 1,
    'releases.tracks.youtubeId': 1,
    'releases.tracks.@.id': 1,
    'releases.tracks.recording.title': 1
  }
}), State.find({
  owner: Meteor.userId()
})]);
Meteor.publish('user', () => Meteor.users.find({
  _id: Meteor.userId()
}));
Accounts.onCreateUser((options, user) => {
  if (!user.services.google) {
    throw new Error('Expected login with Google only.');
  }

  State.insert({
    owner: user._id,
    volume: 100,
    playing: false,
    playlist: []
  });
  return user;
});
///////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".jsx"
  ]
});
require("/server/google-oauth.js");
require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvQXJ0aXN0cy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvU3RhdGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9nb29nbGUtb2F1dGguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIkFydGlzdHMiLCJNb25nbyIsIndhdGNoIiwicmVxdWlyZSIsInYiLCJDb2xsZWN0aW9uIiwiYWxsb3ciLCJpbnNlcnQiLCJ1c2VySWQiLCJkb2MiLCJvd25lciIsInJlbW92ZSIsInVwZGF0ZSIsImZldGNoIiwiZXhwb3J0RGVmYXVsdCIsIlN0YXRlIiwic2V0dGluZ3MiLCJNZXRlb3IiLCJnb29nbGUiLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwic2VydmljZSIsImNsaWVudElkIiwic2VjcmV0IiwiRnV0dXJlIiwiZGVmYXVsdCIsIkFjY291bnRzIiwic3RhcnR1cCIsImF1dGgiLCJ5b3V0dWJlIiwidmVyc2lvbiIsIm1ldGhvZHMiLCJ5b3V0dWJlU2VhcmNoIiwidGVybSIsInJlZ2lvbkNvZGUiLCJteUZ1dHVyZSIsInNlYXJjaCIsImxpc3QiLCJwYXJ0IiwicSIsInR5cGUiLCJ2aWRlb1N5bmRpY2F0ZWQiLCJlcnIiLCJyZXN1bHQiLCJyZXR1cm4iLCJkYXRhIiwiaXRlbXMiLCJpZCIsInZpZGVvSWQiLCJ3YWl0IiwiaW5zZXJ0UmVsZWFzZSIsImFydGlzdCIsIkVycm9yIiwiY29uc29sZSIsImxvZyIsInNlbGVjdG9yIiwiYXJ0aXN0RXhpc3RzIiwiZmluZCIsImNvdW50IiwiJHB1c2giLCJyZWxlYXNlcyIsInJlbW92ZVJlbGVhc2UiLCJyZWxlYXNlSWQiLCJmaW5kT25lIiwibGVuZ3RoIiwiJHB1bGwiLCJwdWJsaXNoIiwic29ydCIsImZpZWxkcyIsIm5hbWUiLCJ1c2VycyIsIl9pZCIsIm9uQ3JlYXRlVXNlciIsIm9wdGlvbnMiLCJ1c2VyIiwic2VydmljZXMiLCJ2b2x1bWUiLCJwbGF5aW5nIiwicGxheWxpc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUFBLE9BQU9DLE1BQVAsQ0FBYztBQUFDQyxXQUFRLE1BQUlBO0FBQWIsQ0FBZDtBQUFxQyxJQUFJQyxLQUFKO0FBQVVILE9BQU9JLEtBQVAsQ0FBYUMsUUFBUSxjQUFSLENBQWIsRUFBcUM7QUFBQ0YsUUFBTUcsQ0FBTixFQUFRO0FBQUNILFlBQU1HLENBQU47QUFBUTs7QUFBbEIsQ0FBckMsRUFBeUQsQ0FBekQ7QUFFeEMsTUFBTUosVUFBVSxJQUFJQyxNQUFNSSxVQUFWLENBQXFCLFNBQXJCLENBQWhCO0FBRVBMLFFBQVFNLEtBQVIsQ0FBYztBQUNaQyxVQUFRLENBQUNDLE1BQUQsRUFBU0MsR0FBVCxLQUFpQkQsV0FBV0MsSUFBSUMsS0FENUI7QUFFWkMsVUFBUSxDQUFDSCxNQUFELEVBQVNDLEdBQVQsS0FBaUJELFdBQVdDLElBQUlDLEtBRjVCO0FBR1pFLFVBQVEsQ0FBQ0osTUFBRCxFQUFTQyxHQUFULEtBQWlCRCxXQUFXQyxJQUFJQyxLQUg1QjtBQUlaRyxTQUFPLENBQUMsT0FBRDtBQUpLLENBQWQ7QUFKQWYsT0FBT2dCLGFBQVAsQ0FXZWQsT0FYZixFOzs7Ozs7Ozs7OztBQ0FBRixPQUFPQyxNQUFQLENBQWM7QUFBQ2dCLFNBQU0sTUFBSUE7QUFBWCxDQUFkO0FBQWlDLElBQUlkLEtBQUo7QUFBVUgsT0FBT0ksS0FBUCxDQUFhQyxRQUFRLGNBQVIsQ0FBYixFQUFxQztBQUFDRixRQUFNRyxDQUFOLEVBQVE7QUFBQ0gsWUFBTUcsQ0FBTjtBQUFROztBQUFsQixDQUFyQyxFQUF5RCxDQUF6RDtBQUVwQyxNQUFNVyxRQUFRLElBQUlkLE1BQU1JLFVBQVYsQ0FBcUIsT0FBckIsQ0FBZDtBQUVQVSxNQUFNVCxLQUFOLENBQVk7QUFDVkssVUFBUSxDQUFDSCxNQUFELEVBQVNDLEdBQVQsS0FBaUJELFdBQVdDLElBQUlDLEtBRDlCO0FBRVZFLFVBQVEsQ0FBQ0osTUFBRCxFQUFTQyxHQUFULEtBQWlCRCxXQUFXQyxJQUFJQyxLQUY5QjtBQUdWRyxTQUFPLENBQUMsT0FBRDtBQUhHLENBQVo7QUFKQWYsT0FBT2dCLGFBQVAsQ0FVZUMsS0FWZixFOzs7Ozs7Ozs7OztBQ0FBLE1BQU1DLFdBQVdDLE9BQU9ELFFBQVAsQ0FBZ0JFLE1BQWpDOztBQUVBLElBQUlGLFFBQUosRUFBYztBQUNaRyx1QkFBcUJDLGNBQXJCLENBQW9DVCxNQUFwQyxDQUEyQztBQUN6Q1UsYUFBUztBQURnQyxHQUEzQztBQUlBRix1QkFBcUJDLGNBQXJCLENBQW9DYixNQUFwQyxDQUEyQztBQUN6Q2MsYUFBUyxRQURnQztBQUV6Q0MsY0FBVU4sU0FBU00sUUFGc0I7QUFHekNDLFlBQVFQLFNBQVNPO0FBSHdCLEdBQTNDO0FBS0QsQzs7Ozs7Ozs7Ozs7QUNaRCxJQUFJTixNQUFKO0FBQVduQixPQUFPSSxLQUFQLENBQWFDLFFBQVEsZUFBUixDQUFiLEVBQXNDO0FBQUNjLFNBQU9iLENBQVAsRUFBUztBQUFDYSxhQUFPYixDQUFQO0FBQVM7O0FBQXBCLENBQXRDLEVBQTRELENBQTVEO0FBQStELElBQUljLE1BQUo7QUFBV3BCLE9BQU9JLEtBQVAsQ0FBYUMsUUFBUSxZQUFSLENBQWIsRUFBbUM7QUFBQ2UsU0FBT2QsQ0FBUCxFQUFTO0FBQUNjLGFBQU9kLENBQVA7QUFBUzs7QUFBcEIsQ0FBbkMsRUFBeUQsQ0FBekQ7QUFBNEQsSUFBSW9CLE1BQUo7QUFBVzFCLE9BQU9JLEtBQVAsQ0FBYUMsUUFBUSxlQUFSLENBQWIsRUFBc0M7QUFBQ3NCLFVBQVFyQixDQUFSLEVBQVU7QUFBQ29CLGFBQU9wQixDQUFQO0FBQVM7O0FBQXJCLENBQXRDLEVBQTZELENBQTdEO0FBQWdFLElBQUlzQixRQUFKO0FBQWE1QixPQUFPSSxLQUFQLENBQWFDLFFBQVEsc0JBQVIsQ0FBYixFQUE2QztBQUFDdUIsV0FBU3RCLENBQVQsRUFBVztBQUFDc0IsZUFBU3RCLENBQVQ7QUFBVzs7QUFBeEIsQ0FBN0MsRUFBdUUsQ0FBdkU7QUFBMEUsSUFBSUosT0FBSjtBQUFZRixPQUFPSSxLQUFQLENBQWFDLFFBQVEsd0JBQVIsQ0FBYixFQUErQztBQUFDSCxVQUFRSSxDQUFSLEVBQVU7QUFBQ0osY0FBUUksQ0FBUjtBQUFVOztBQUF0QixDQUEvQyxFQUF1RSxDQUF2RTtBQUEwRSxJQUFJVyxLQUFKO0FBQVVqQixPQUFPSSxLQUFQLENBQWFDLFFBQVEsc0JBQVIsQ0FBYixFQUE2QztBQUFDWSxRQUFNWCxDQUFOLEVBQVE7QUFBQ1csWUFBTVgsQ0FBTjtBQUFROztBQUFsQixDQUE3QyxFQUFpRSxDQUFqRTtBQU9uWmEsT0FBT1UsT0FBUCxDQUFlLE1BQU07QUFDbkI7QUFFQSxRQUFNQyxPQUFPLHlDQUFiO0FBQ0EsUUFBTUMsVUFBVVgsT0FBT1csT0FBUCxDQUFlO0FBQUVDLGFBQVMsSUFBWDtBQUFpQkY7QUFBakIsR0FBZixDQUFoQjtBQUVBWCxTQUFPYyxPQUFQLENBQWU7QUFDYkMsbUJBQWUsQ0FBQ0MsSUFBRCxFQUFPQyxVQUFQLEtBQXNCO0FBQ25DLFlBQU1DLFdBQVcsSUFBSVgsTUFBSixFQUFqQjtBQUNBSyxjQUFRTyxNQUFSLENBQWVDLElBQWYsQ0FBb0I7QUFDbEJDLGNBQU0sWUFEWTtBQUVsQkMsV0FBR04sSUFGZTtBQUdsQk8sY0FBTSxPQUhZO0FBSWxCTixrQkFKa0I7QUFLbEJPLHlCQUFpQjtBQUxDLE9BQXBCLEVBTUcsQ0FBQ0MsR0FBRCxFQUFNQyxNQUFOLEtBQWlCO0FBQ2xCUixpQkFBU1MsTUFBVCxDQUFnQkQsT0FBT0UsSUFBUCxDQUFZQyxLQUFaLENBQWtCLENBQWxCLEVBQXFCQyxFQUFyQixDQUF3QkMsT0FBeEM7QUFDRCxPQVJEO0FBU0EsYUFBT2IsU0FBU2MsSUFBVCxFQUFQO0FBQ0QsS0FiWTtBQWNiQyxtQkFBZ0JDLE1BQUQsSUFBWTtBQUN6QixVQUFJLENBQUNsQyxPQUFPVCxNQUFQLEVBQUwsRUFBc0I7QUFDcEIsY0FBTSxJQUFJUyxPQUFPbUMsS0FBWCxDQUFpQixnQkFBakIsQ0FBTjtBQUNEOztBQUNDQyxjQUFRQyxHQUFSLENBQVksS0FBWjtBQUNGLFlBQU1DLFdBQVc7QUFBRTdDLGVBQU9PLE9BQU9ULE1BQVAsRUFBVDtBQUEwQixnQkFBUTJDLE9BQU8sR0FBUCxFQUFZSjtBQUE5QyxPQUFqQjtBQUNBLFlBQU1TLGVBQWV4RCxRQUFReUQsSUFBUixDQUFhRixRQUFiLEVBQXVCRyxLQUF2QixFQUFyQjs7QUFDQSxVQUFJRixZQUFKLEVBQWtCO0FBQ2hCeEQsZ0JBQVFZLE1BQVIsQ0FBZTJDLFFBQWYsRUFBeUI7QUFBRUksaUJBQU87QUFBRUMsc0JBQVVULE9BQU9TLFFBQVAsQ0FBZ0IsQ0FBaEI7QUFBWjtBQUFULFNBQXpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0w1RCxnQkFBUU8sTUFBUixDQUFlNEMsTUFBZjtBQUNEO0FBQ0YsS0ExQlk7QUEyQmJVLG1CQUFnQkMsU0FBRCxJQUFlO0FBQzVCLFVBQUksQ0FBQzdDLE9BQU9ULE1BQVAsRUFBTCxFQUFzQjtBQUNwQixjQUFNLElBQUlTLE9BQU9tQyxLQUFYLENBQWlCLGdCQUFqQixDQUFOO0FBQ0Q7O0FBQ0QsWUFBTUcsV0FBVztBQUFFN0MsZUFBT08sT0FBT1QsTUFBUCxFQUFUO0FBQTBCLHlCQUFpQnNEO0FBQTNDLE9BQWpCO0FBQ0EsWUFBTVgsU0FBU25ELFFBQVErRCxPQUFSLENBQWdCUixRQUFoQixDQUFmOztBQUNBLFVBQUlKLE9BQU9TLFFBQVAsQ0FBZ0JJLE1BQWhCLEtBQTJCLENBQS9CLEVBQWtDO0FBQ2hDaEUsZ0JBQVFXLE1BQVIsQ0FBZTRDLFFBQWY7QUFDRCxPQUZELE1BRU87QUFDTHZELGdCQUFRWSxNQUFSLENBQWUyQyxRQUFmLEVBQXlCO0FBQUVVLGlCQUFPO0FBQUVMLHNCQUFVO0FBQUUsc0JBQVFFO0FBQVY7QUFBWjtBQUFULFNBQXpCO0FBQ0Q7QUFDRjtBQXRDWSxHQUFmO0FBd0NELENBOUNEO0FBZ0RBN0MsT0FBT2lELE9BQVAsQ0FBZSxTQUFmLEVBQTBCLE1BQU0sQ0FDOUJsRSxRQUFReUQsSUFBUixDQUFhO0FBQUUvQyxTQUFPTyxPQUFPVCxNQUFQO0FBQVQsQ0FBYixFQUF5QztBQUN2QzJELFFBQU07QUFBRSxpQkFBYTtBQUFmLEdBRGlDO0FBRXZDQyxVQUFRO0FBQ05DLFVBQU0sQ0FEQTtBQUVOLGlCQUFhLENBRlA7QUFHTixZQUFRLENBSEY7QUFJTixxQkFBaUIsQ0FKWDtBQUtOLHNCQUFrQixDQUxaO0FBTU4sMENBQXNDLENBTmhDO0FBT04saUNBQTZCLENBUHZCO0FBUU4sNEJBQXdCLENBUmxCO0FBU04sdUNBQW1DO0FBVDdCO0FBRitCLENBQXpDLENBRDhCLEVBZTlCdEQsTUFBTTBDLElBQU4sQ0FBVztBQUFFL0MsU0FBT08sT0FBT1QsTUFBUDtBQUFULENBQVgsQ0FmOEIsQ0FBaEM7QUFrQkFTLE9BQU9pRCxPQUFQLENBQWUsTUFBZixFQUF1QixNQUFNakQsT0FBT3FELEtBQVAsQ0FBYWIsSUFBYixDQUFrQjtBQUFFYyxPQUFLdEQsT0FBT1QsTUFBUDtBQUFQLENBQWxCLENBQTdCO0FBRUFrQixTQUFTOEMsWUFBVCxDQUFzQixDQUFDQyxPQUFELEVBQVVDLElBQVYsS0FBbUI7QUFDdkMsTUFBSSxDQUFDQSxLQUFLQyxRQUFMLENBQWN6RCxNQUFuQixFQUEyQjtBQUN6QixVQUFNLElBQUlrQyxLQUFKLENBQVUsa0NBQVYsQ0FBTjtBQUNEOztBQUNEckMsUUFBTVIsTUFBTixDQUFhO0FBQUVHLFdBQU9nRSxLQUFLSCxHQUFkO0FBQW1CSyxZQUFRLEdBQTNCO0FBQWdDQyxhQUFTLEtBQXpDO0FBQWdEQyxjQUFVO0FBQTFELEdBQWI7QUFDQSxTQUFPSixJQUFQO0FBQ0QsQ0FORCxFIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5cbmV4cG9ydCBjb25zdCBBcnRpc3RzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ2FydGlzdHMnKTtcblxuQXJ0aXN0cy5hbGxvdyh7XG4gIGluc2VydDogKHVzZXJJZCwgZG9jKSA9PiB1c2VySWQgPT09IGRvYy5vd25lcixcbiAgcmVtb3ZlOiAodXNlcklkLCBkb2MpID0+IHVzZXJJZCA9PT0gZG9jLm93bmVyLFxuICB1cGRhdGU6ICh1c2VySWQsIGRvYykgPT4gdXNlcklkID09PSBkb2Mub3duZXIsXG4gIGZldGNoOiBbJ293bmVyJ10sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQXJ0aXN0cztcbiIsImltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcblxuZXhwb3J0IGNvbnN0IFN0YXRlID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3N0YXRlJyk7XG5cblN0YXRlLmFsbG93KHtcbiAgcmVtb3ZlOiAodXNlcklkLCBkb2MpID0+IHVzZXJJZCA9PT0gZG9jLm93bmVyLFxuICB1cGRhdGU6ICh1c2VySWQsIGRvYykgPT4gdXNlcklkID09PSBkb2Mub3duZXIsXG4gIGZldGNoOiBbJ293bmVyJ10sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3RhdGU7XG4iLCJjb25zdCBzZXR0aW5ncyA9IE1ldGVvci5zZXR0aW5ncy5nb29nbGU7XG5cbmlmIChzZXR0aW5ncykge1xuICBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5yZW1vdmUoe1xuICAgIHNlcnZpY2U6ICdnb29nbGUnXG4gIH0pO1xuXG4gIFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmluc2VydCh7XG4gICAgc2VydmljZTogJ2dvb2dsZScsXG4gICAgY2xpZW50SWQ6IHNldHRpbmdzLmNsaWVudElkLFxuICAgIHNlY3JldDogc2V0dGluZ3Muc2VjcmV0XG4gIH0pO1xufVxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBnb29nbGUgfSBmcm9tICdnb29nbGVhcGlzJztcbmltcG9ydCBGdXR1cmUgZnJvbSAnZmliZXJzL2Z1dHVyZSc7XG5pbXBvcnQgeyBBY2NvdW50cyB9IGZyb20gJ21ldGVvci9hY2NvdW50cy1iYXNlJztcbmltcG9ydCB7IEFydGlzdHMgfSBmcm9tICcuLi9pbXBvcnRzL2FwaS9BcnRpc3RzJztcbmltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi4vaW1wb3J0cy9hcGkvU3RhdGUnO1xuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIC8vIGNvZGUgdG8gcnVuIG9uIHNlcnZlciBhdCBzdGFydHVwXG5cbiAgY29uc3QgYXV0aCA9ICdBSXphU3lDMElPWmtzVHVrejhrZlRtckI1OVY5MG9QQ3M0bDVHUHMnO1xuICBjb25zdCB5b3V0dWJlID0gZ29vZ2xlLnlvdXR1YmUoeyB2ZXJzaW9uOiAndjMnLCBhdXRoIH0pO1xuXG4gIE1ldGVvci5tZXRob2RzKHtcbiAgICB5b3V0dWJlU2VhcmNoOiAodGVybSwgcmVnaW9uQ29kZSkgPT4ge1xuICAgICAgY29uc3QgbXlGdXR1cmUgPSBuZXcgRnV0dXJlKCk7XG4gICAgICB5b3V0dWJlLnNlYXJjaC5saXN0KHtcbiAgICAgICAgcGFydDogJ2lkLHNuaXBwZXQnLFxuICAgICAgICBxOiB0ZXJtLFxuICAgICAgICB0eXBlOiAndmlkZW8nLFxuICAgICAgICByZWdpb25Db2RlLFxuICAgICAgICB2aWRlb1N5bmRpY2F0ZWQ6ICd0cnVlJyxcbiAgICAgIH0sIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICBteUZ1dHVyZS5yZXR1cm4ocmVzdWx0LmRhdGEuaXRlbXNbMF0uaWQudmlkZW9JZCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBteUZ1dHVyZS53YWl0KCk7XG4gICAgfSxcbiAgICBpbnNlcnRSZWxlYXNlOiAoYXJ0aXN0KSA9PiB7XG4gICAgICBpZiAoIU1ldGVvci51c2VySWQoKSkge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdub3QtYXV0aG9yaXplZCcpO1xuICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygneWVlJylcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0geyBvd25lcjogTWV0ZW9yLnVzZXJJZCgpLCAnQC5pZCc6IGFydGlzdFsnQCddLmlkIH07XG4gICAgICBjb25zdCBhcnRpc3RFeGlzdHMgPSBBcnRpc3RzLmZpbmQoc2VsZWN0b3IpLmNvdW50KCk7XG4gICAgICBpZiAoYXJ0aXN0RXhpc3RzKSB7XG4gICAgICAgIEFydGlzdHMudXBkYXRlKHNlbGVjdG9yLCB7ICRwdXNoOiB7IHJlbGVhc2VzOiBhcnRpc3QucmVsZWFzZXNbMF0gfSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEFydGlzdHMuaW5zZXJ0KGFydGlzdCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVSZWxlYXNlOiAocmVsZWFzZUlkKSA9PiB7XG4gICAgICBpZiAoIU1ldGVvci51c2VySWQoKSkge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdub3QtYXV0aG9yaXplZCcpO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2VsZWN0b3IgPSB7IG93bmVyOiBNZXRlb3IudXNlcklkKCksICdyZWxlYXNlcy5ALmlkJzogcmVsZWFzZUlkIH07XG4gICAgICBjb25zdCBhcnRpc3QgPSBBcnRpc3RzLmZpbmRPbmUoc2VsZWN0b3IpO1xuICAgICAgaWYgKGFydGlzdC5yZWxlYXNlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgQXJ0aXN0cy5yZW1vdmUoc2VsZWN0b3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQXJ0aXN0cy51cGRhdGUoc2VsZWN0b3IsIHsgJHB1bGw6IHsgcmVsZWFzZXM6IHsgJ0AuaWQnOiByZWxlYXNlSWQgfSB9IH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xufSk7XG5cbk1ldGVvci5wdWJsaXNoKCdhcHBEYXRhJywgKCkgPT4gW1xuICBBcnRpc3RzLmZpbmQoeyBvd25lcjogTWV0ZW9yLnVzZXJJZCgpIH0sIHtcbiAgICBzb3J0OiB7ICdzb3J0LW5hbWUnOiAxIH0sXG4gICAgZmllbGRzOiB7XG4gICAgICBuYW1lOiAxLFxuICAgICAgJ3NvcnQtbmFtZSc6IDEsXG4gICAgICAnQC5pZCc6IDEsXG4gICAgICAncmVsZWFzZXMuQC5pZCc6IDEsXG4gICAgICAncmVsZWFzZXMudGl0bGUnOiAxLFxuICAgICAgJ3JlbGVhc2VzLmNvdmVyLWFydC1hcmNoaXZlLmFydHdvcmsnOiAxLFxuICAgICAgJ3JlbGVhc2VzLnRyYWNrcy55b3V0dWJlSWQnOiAxLFxuICAgICAgJ3JlbGVhc2VzLnRyYWNrcy5ALmlkJzogMSxcbiAgICAgICdyZWxlYXNlcy50cmFja3MucmVjb3JkaW5nLnRpdGxlJzogMSxcbiAgICB9LFxuICB9KSxcbiAgU3RhdGUuZmluZCh7IG93bmVyOiBNZXRlb3IudXNlcklkKCkgfSksXG5dKTtcblxuTWV0ZW9yLnB1Ymxpc2goJ3VzZXInLCAoKSA9PiBNZXRlb3IudXNlcnMuZmluZCh7IF9pZDogTWV0ZW9yLnVzZXJJZCgpIH0pKTtcblxuQWNjb3VudHMub25DcmVhdGVVc2VyKChvcHRpb25zLCB1c2VyKSA9PiB7XG4gIGlmICghdXNlci5zZXJ2aWNlcy5nb29nbGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGxvZ2luIHdpdGggR29vZ2xlIG9ubHkuJyk7XG4gIH1cbiAgU3RhdGUuaW5zZXJ0KHsgb3duZXI6IHVzZXIuX2lkLCB2b2x1bWU6IDEwMCwgcGxheWluZzogZmFsc2UsIHBsYXlsaXN0OiBbXSB9KTtcbiAgcmV0dXJuIHVzZXI7XG59KTtcbiJdfQ==

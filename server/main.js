import { Meteor } from 'meteor/meteor';
import { google } from 'googleapis';
import Future from 'fibers/future';
import { Accounts } from 'meteor/accounts-base';
import { Artists } from '../imports/api/Artists';
import { State } from '../imports/api/State';

Meteor.startup(() => {
  // code to run on server at startup

  const auth = 'AIzaSyC0IOZksTukz8kfTmrB59V90oPCs4l5GPs';
  const youtube = google.youtube({ version: 'v3', auth });

  Meteor.methods({
    youtubeSearch: (term, regionCode) => {
      const myFuture = new Future();
      youtube.search.list({
        part: 'id,snippet',
        q: term,
        type: 'video',
        regionCode,
        videoSyndicated: 'true',
      }, (err, result) => {
        myFuture.return(result.data.items[0].id.videoId);
      });
      return myFuture.wait();
    },
    insertRelease: (artist) => {
      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }
        console.log('yee')
      const selector = { owner: Meteor.userId(), '@.id': artist['@'].id };
      const artistExists = Artists.find(selector).count();
      if (artistExists) {
        Artists.update(selector, { $push: { releases: artist.releases[0] } });
      } else {
        Artists.insert(artist);
      }
    },
    removeRelease: (releaseId) => {
      if (!Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }
      const selector = { owner: Meteor.userId(), 'releases.@.id': releaseId };
      const artist = Artists.findOne(selector);
      if (artist.releases.length === 1) {
        Artists.remove(selector);
      } else {
        Artists.update(selector, { $pull: { releases: { '@.id': releaseId } } });
      }
    },
  });
});

Meteor.publish('appData', () => [
  Artists.find({ owner: Meteor.userId() }, {
    sort: { 'sort-name': 1 },
    fields: {
      name: 1,
      'sort-name': 1,
      '@.id': 1,
      'releases.@.id': 1,
      'releases.title': 1,
      'releases.cover-art-archive.artwork': 1,
      'releases.tracks.youtubeId': 1,
      'releases.tracks.@.id': 1,
      'releases.tracks.recording.title': 1,
    },
  }),
  State.find({ owner: Meteor.userId() }),
]);

Meteor.publish('user', () => Meteor.users.find({ _id: Meteor.userId() }));

Accounts.onCreateUser((options, user) => {
  if (!user.services.google) {
    throw new Error('Expected login with Google only.');
  }
  State.insert({ owner: user._id, volume: 100, playing: false, playlist: [] });
  return user;
});

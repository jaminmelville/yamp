import { Mongo } from 'meteor/mongo';

export const Artists = new Mongo.Collection('artists');

Artists.allow({
  insert: (userId, doc) => userId === doc.owner,
  remove: (userId, doc) => userId === doc.owner,
  update: (userId, doc) => userId === doc.owner,
  fetch: ['owner'],
});

export default Artists;

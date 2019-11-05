import { Mongo } from 'meteor/mongo';

export const State = new Mongo.Collection('state');

State.allow({
  remove: (userId, doc) => userId === doc.owner,
  update: (userId, doc) => userId === doc.owner,
  fetch: ['owner'],
});

export default State;

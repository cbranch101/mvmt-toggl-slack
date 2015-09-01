Meteor.publish('TrackedUsers', function (id) {
  return TrackedUsers.find();
});

Meteor.publish('TrackedUser', function (id) {
  check(id, String);
  return TrackedUsers.find({_id : id});
});


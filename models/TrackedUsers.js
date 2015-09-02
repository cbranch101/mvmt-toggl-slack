TrackedUsers = new Mongo.Collection('TrackedUsers');

TrackedUsers.attachSchema(
    new SimpleSchema({
    name: {
      	type: String,
	  	label : 'Name',
    },
    slack_id : {
	    type : String,
	    label : 'Slack ID',
    },
    toggl_access_token: {
      	type: String,
	  	label : 'Toggl Access Token',
    },
    createdAt: {
		type: Date,
		denyUpdate: true,
		autoValue: function() {
			if (this.isInsert) {
				return new Date;
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date};
			} else {
				this.unset();  // Prevent user from supplying their own value
			}
		}
    }
  })
);

Meteor.methods({
	removeTrackedUser : function(id) {
		check(id, String);
		TrackedUsers.remove({_id : id});
	},
	removeAllTrackedUsers : function() {
		TrackedUsers.remove({});
	}
});

// Collection2 already does schema checking
// Add custom permission rules if needed
if (Meteor.isServer) {
  TrackedUsers.allow({
    insert : function () {
      return true;
    },
    update : function () {
      return true;
    },
    remove : function () {
      return true;
    }
  });
}

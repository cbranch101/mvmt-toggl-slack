Template['trackedUsers'].helpers({
	tracked_users : function() {
		return TrackedUsers.find({}, {sort : {name : 1}});
	}
});

Template['trackedUsers'].events({
	'click .create-new' : function() {
		Router.go("trackedUser.insert");
	},
	'click .edit-user' : function() {
		Router.go('trackedUser.update', {_id : this._id});
	},
	'click .delete-user' : function() {
		Meteor.call('removeTrackedUser', this._id);	
	}
});



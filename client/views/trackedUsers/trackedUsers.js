Template['trackedUsers'].helpers({
	tracked_users : function() {
		return TrackedUsers.find();
	}
});

Template['trackedUsers'].events({
	'click .create-new' : function() {
		Router.go("trackedUser.insert");
	},
	'click .edit-user' : function() {
		Router.go('trackedUser.update', {_id : this._id});
	}
});



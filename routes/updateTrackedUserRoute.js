Router.route('/users/update/:_id', {
	name : "trackedUser.update",
	waitOn : function() {
		return Meteor.subscribe('TrackedUser', this.params._id);	
	},
	action : function() {
		var trackedUser = TrackedUsers.findOne({_id: this.params._id});
		this.render('updateTrackedUser', {data : trackedUser});
	}
});
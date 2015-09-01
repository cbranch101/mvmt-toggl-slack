Template['insertTrackedUser'].helpers({
});

Template['insertTrackedUser'].events({
});

AutoForm.hooks({
	trackedUser : {
		onSuccess : function() {
			Router.go("trackedUsers");
		},
	},
});

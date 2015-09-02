cronHandler = {
	
};

Meteor.methods({
	startJobs : function() {
		SyncedCron.add({
			name: 'send slack messages',
			schedule: function(parser) {
				// parser is a later.parse object
// 				return parser.text('at 7:00am every weekday');
				return parser.text('every 5 seconds');
			},
			job: function() {
				togglHandler.generateSlackMessagesForTrackedUsers();
			}
		});
		SyncedCron.start();
	},
	stopJobs : function() {
		SyncedCron.stop();	
	},
});

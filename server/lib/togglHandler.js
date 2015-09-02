var Toggl = Meteor.npmRequire('toggl-api');

togglHandler = {
	messageMap : [
		{
			condition : function(togglData) {
				return togglData['tracked_hours'] > 14;
			},
			get_message : function(togglData){
				return Math.round(togglData['tracked_hours']) + " hours were tracked yesterday, was there a timer that was left running?";
			},
		},
		{
			condition : function(togglData) {
				return togglData['tracked_hours'] < 6;
			},
			get_message : function(togglData) {
				return "Only " + Math.round(togglData['tracked_hours']) + " hours were tracked yesterday, did any tasks get missed?"	
			},
		},
	],
	generateSlackMessagesForTrackedUsers : function() {
		TrackedUsers.find().forEach(function(user){
			togglData = togglHandler.getTogglDataForToken(user['toggl_access_token']);
			togglHandler.sendSlackMessageBasedOnTogglData(user['slack_id'], togglData);
		});
	},
	sendSlackMessageBasedOnTogglData : function(slackID, togglData) {
		_.map(this.messageMap, function(messageDetails){
			if(messageDetails['condition'](togglData)) {
				slackHandler.sendMessage(slackID, messageDetails['get_message'](togglData));
			}
		});
	},
	getTimeEntriesForToken : function(apiToken) {
		var togglAPI = new Toggl({apiToken : apiToken});
		var yesterday = moment().subtract(1, 'days').format();
		var now = moment().format();
		getTimeEntries = Async.wrap(togglAPI, 'getTimeEntries');
		var entries = getTimeEntries(yesterday, now);
		return entries;
	},
	getTogglDataFromEntries : function(entries) {
		var totalInSeconds = _.reduce(entries, function(prev, next){
			var duration = next['duration'];
			if(duration < 0) {
				duration = 0;
			}
			return prev + duration;
		}, 0);
		var totalInMinutes = totalInSeconds / 60;
		var totalInHours = totalInMinutes / 60;
		return {
			tracked_hours : totalInHours,
		};
	},
	getTogglDataForToken : function(apiToken) {
		var entries = togglHandler.getTimeEntriesForToken(apiToken);
		return togglHandler.getTogglDataFromEntries(entries);
	},
};

Meteor.methods({
	generateSlackMessagesForTrackedUsers : function() {
		togglHandler.generateSlackMessagesForTrackedUsers();		
	},
});
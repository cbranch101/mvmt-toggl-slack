var Toggl = Meteor.npmRequire('toggl-api');

togglHandler = {
	messageMap : [
		{
			condition : function(togglData) {
				return togglData['tracked_hours'] < 6;
			},
			get_message : function(togglData) {
				return "Only " + Math.round(togglData['tracked_hours']) + " hours were tracked yesterday, did any tasks get missed?"	
			},
		},
		{
			condition : function(togglData) {
				return _.size(togglData['long_running_entries']) > 0;
			},
			get_message : function(togglData){
				return _.map(togglData['long_running_entries'], function(entry){
					var date = moment(entry['at']).calendar();
					var message = date + "\n";
					message += "a timer with the following description \n";
					message += entry['description'] + '\n';
					message += "Ran for " + Math.round(entry['duration_in_hours']) + " hours \n";
					message += "If this isn't right, please fix it";
					return message;
				});
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
				var messages = messageDetails['get_message'](togglData);
				if(messages.constructor === String) {
					messages = [messages];
				}
				_.map(messages, function(message){
					slackHandler.sendMessage(slackID, message);
				});
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
		var togglData = {};
		togglData = togglHandler.setTrackedHours(entries, togglData);
		togglData =	togglHandler.getLongRunningEntries(entries, togglData);
		return togglData;
	},
	getLongRunningEntries : function(entries, togglData) {
		longRunningEntries = [];
		_.map(entries, function(entry){
			var duration = entry['duration'];
			if(duration < 0) {
				duration = Number(moment().format('X')) + Number(duration);
			}
			durationInHours = (duration / 60) / 60;
			if(durationInHours > 9) {
				entry['duration_in_hours'] = durationInHours;
				longRunningEntries.push(entry);
			}
		});
		togglData['long_running_entries'] = longRunningEntries;
		return togglData;
	},
	setTrackedHours : function(entries, togglData) {
		var totalInSeconds = _.reduce(entries, function(prev, next){
			var duration = next['duration'];
			if(duration < 0) {
				duration = 0;
			}
			return prev + duration;
		}, 0);
		var totalInMinutes = totalInSeconds / 60;
		var totalInHours = totalInMinutes / 60;
		togglData['tracked_hours'] = totalInHours;
		return togglData;
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
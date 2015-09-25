var Toggl = Meteor.npmRequire('toggl-api');

togglHandler = {
	adminUsers : [
		'clay',
	],
	messageMap : [
		{
			identifier : "Undertracked",
			condition : function(togglData) {
				return togglData['tracked_hours'] < 6;
			},
			get_message : function(togglData) {
				return "Only " + Math.round(togglData['tracked_hours']) + " hours were tracked yesterday, did any tasks get missed?"	
			},
		},
		{
			identifier : "Running Timer",
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
		var allErrors = [];
		TrackedUsers.find().forEach(function(user){
			togglData = togglHandler.getTogglDataForToken(user['toggl_access_token'], user['office']);
			error = togglHandler.getErrorFromTogglData(togglData, user);
			if(error !== null) {
				togglHandler.sendSlackMessageForError(error);
				allErrors.push(error);
			}		
		});
		this.sendAdminMessage(allErrors);
	},
	sendAdminMessage : function(allErrors) {
		if(allErrors.length > 0) {
			var message = 'Toggl Errors for today \n';
			groupedErrors = _.groupBy(allErrors, 'identifier');
			_.map(groupedErrors, function(currentErrors, identifier){
				message += identifier + '\n';
				_.map(currentErrors, function(error){
					message += "     " + error.user;
				});
			});
			_.map(this.adminUsers, function(slackID){
				slackHandler.sendMessage(slackID, message);
			});
		}
	},	
	sendSlackMessageForError : function(error) {
		_.map(error.messages, function(message){
			slackHandler.sendMessage(error['user_slack_id'], message);
		});
	},
	getErrorFromTogglData : function(togglData, user) {
		var error = null;
		_.map(this.messageMap, function(messageDetails){
			if(messageDetails['condition'](togglData)) {
				error = {
					user : user['name'],
					user_slack_id : user['slack_id'],
					identifier : messageDetails.identifier,
					created_time : moment().format('X'),
					messages : togglHandler.getErrorMessages(messageDetails, togglData),
				};		
			}
		});
		return error;
	},
	getErrorMessages : function(messageDetails, togglData) {
		var messages = messageDetails['get_message'](togglData);
		if(messages.constructor === String) {
			messages = [messages];
		}
		return messages;
	},
	getTimeEntriesForToken : function(apiToken, timezone) {
		var togglAPI = new Toggl({apiToken : apiToken});
		getTimeEntries = Async.wrap(togglAPI, 'getTimeEntries');
		var timeRange = timeHandler.getTimeRange(moment().subtract(1, 'days'), timezone);
		var entries = getTimeEntries(timeRange.start, timeRange.end);
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
	getTogglDataForToken : function(apiToken, timezone) {
		var entries = togglHandler.getTimeEntriesForToken(apiToken, timezone);
		return togglHandler.getTogglDataFromEntries(entries);
	},
};

Meteor.methods({
	generateSlackMessagesForTrackedUsers : function() {
		togglHandler.generateSlackMessagesForTrackedUsers();		
	},
});
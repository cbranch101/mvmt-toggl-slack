var Slack = Meteor.npmRequire('slack-node');
var accessToken = 'xoxp-3561149326-3831847066-7352485654-a6ef44';
var slackAPI = new Slack(accessToken);
slackHandler = {
	sendMessage : function(slackID, message) {
		var attachments = [
			{
				color : "good",
			},
		];
		var options = {
			channel : '@' + slackID,
			icon_url : 'http://s3.amazonaws.com/approval.images/subfolder/188c3d6d-ba49-4a8b-a53a-265e0ce7f298.png',
			username : "TogglBot",
			text : message,
			attachments : JSON.stringify(attachments),
		};
		var callAPI = function(path, params, callback) {
			slackAPI.api(path, params, callback);
		};
		syncCallAPI = Async.wrap(callAPI);
		var response = syncCallAPI('chat.postMessage', options);
	}
};

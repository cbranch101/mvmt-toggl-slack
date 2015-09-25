timeHandler = {
	getTimeRange : function(momentDate, timezone) {
		var timezoneDetails = this.timezoneMap[timezone];
		var timezoneString = timezoneDetails['string'];
		var timeRange = {};
		momentDate.tz(timezoneString);
		_.map(timezoneDetails['hours'], function(hour, rangeType){
			timeRange[rangeType] = timeHandler.changeDateToHour(momentDate, hour).format();
		});
		return timeRange;
	},
	changeDateToHour : function(momentDate, hour) {
		momentDate.set('hour', hour);
		momentDate.set('minute', 0);
		momentDate.set('second', 0);
		return momentDate;
	},
	changeDateToPreviousDay : function(momentDate) {
		momentDate.subtract(1, 'days');
		return momentDate;
	},
	timezoneMap : {
		'NY' : {
			string : 'America/New_York',
			hours : {
				start : 9,
				end : 18,
			},
		},
		'CO' : {
			string : 'America/Denver',
			hours : {
				start : 8,
				end : 17,
			},
		},
	},
	
	
};
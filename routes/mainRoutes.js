Router.route('/', {
	name : 'trackedUsers',
	action : function() {
		Meteor.subscribe('TrackedUsers');
		this.render('trackedUsers');
		SEO.set({ title: 'Home -' + Meteor.App.NAME });
	},
});

Router.onBeforeAction(function(){
	if(!Meteor.user()) {
		this.render('login');
	} else {
		this.next();
	}
});

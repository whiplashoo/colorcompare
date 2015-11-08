Template.scoreboard.onCreated( function() {
	Session.set('redOff', 0);
	Session.set('blueOff', 0);
	Session.set('greenOff', 0);
	Session.set('score',0);
	Session.set('tempScore',0);
	Session.set('autocount',0);
});


Template.scoreboard.helpers({
	scores: function() {
		return Scores.find({}, {sort: {sc: -1} , limit:20});
	},

	count20: function(){
		var arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
		return arr;
	},

	redOff: function() {
		return Session.get('redOff');
	},

	greenOff: function() {
		return Session.get('greenOff');
	},
	blueOff: function() {
		return Session.get('blueOff');
	},

	redOffperc: function() {
		return Session.get('redOffperc');
	},

	greenOffperc: function() {
		return Session.get('greenOffperc');
	},
	blueOffperc: function() {
		return Session.get('blueOffperc');
	},
	currentScore: function() {
		if (Session.get('score') !== 0){
			return Session.get('score');
		}
	}
});


Template.middle.helpers({
	tries: function() {
		return Session.get('clicks');
	}
});


var clock = 0;
var timer = function() {
    clock++;
    Session.set("time", clock);
    return clock;
};

Template.middle.events ({
	'click button':function(event){
		var tempUser = Session.get('currentUser');
		Session.keys = {};
		Session.set('currentUser',tempUser);
		Session.set('score',0);
		Session.set('red', 150);
		Session.set('green', 150);
		Session.set('blue', 150);
		Session.set('clicks', 3);
		Session.set('tempScore',0);
		clock = 0;

		interval = Meteor.setInterval(timer, 10);

		$('.level-bar-inner').each(function(){
			$(this).animate({ width : '0px' },800);
		});

		$('#player').show();
		Meteor.call('randomColor', function(error,data){
			$('#target').css('background',data);
		});
	}
});
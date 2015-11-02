Template.middle.helpers({
	tries: function() {
		return Session.get('clicks');
	}
});

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
		
		$('#player').show();
		Meteor.call('randomColor', function(error,data){
			$('#target').css('background',data);
			Session.set('s',data);
		});
	}
});
Template.modal.events({
  "submit .new-user": function (event) {
    // Get the value from the input with name : user
    var text = event.target.user.value;
    var notPermitted = /([#${}])/ ;
    if (text.match(notPermitted) !== null){
      $('.alert').show();
      event.target.user.value = "";
      return false;
    }
    Session.set('currentUser',text);
    
    // Clear form
    event.target.user.value = "";
    $('#myModal').modal('hide');
    Meteor.call('insertUser',text,Session.get('score'));
    // Prevent default form submit
     return false;
  }
});
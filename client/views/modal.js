Template.modal.events({
  "submit .new-user": function (event) {
    // Get the value from the input with name : user
    var text = event.target.user.value;
    var notPermitted = /([#${}])/ ;
    if (text.match(notPermitted) !== null){
      $('.alert').html('Certain characters including ($,#,.,{,}) are not permitted. Please try another nickname!');
      $('.alert').show();
      event.target.user.value = "";
      return false;
    }
    console.log(text);
    if (text === ""){
      $('.alert').html('Please provide a valid nickname.');
      $('.alert').show();
      return false;
    }
    
    Session.set('currentUser',text);
    
    // Clear form
    event.target.user.value = "";
    $('#myModal').modal('hide');
    $('.modal-footer .table').remove();

    Meteor.call('insertUser',text,Session.get('score'));
    // Prevent default form submit
    return false;
  }
});

Template.modal.helpers({
  currentScore: function() {
    if (Session.get('score') !== 0){
      return Session.get('score');
    }
  }
})
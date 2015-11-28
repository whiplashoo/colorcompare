Meteor.methods({
  randomColor: function() {
    s = '#'+Math.floor(Math.random()*16777215).toString(16);
    return s;
  },

  insertUser: function(user,score) {
    if (Scores.findOne( {username : user } ) === undefined){
      Scores.insert({
        username: user,
        sc: score ,
        createdAt: new Date()
      });
    }
    else {
      if (Scores.findOne( { username: user } )['sc'] < score){
        Scores.update({username:user}, { $set: { sc: score} });
      }
    }
  },

  updateColor : function() {
    var rgb = [Session.get('red'),Session.get('green'),Session.get('blue')];
    $('#player, .c1').css('background','rgb('+rgb.join(',')+')');
    var rgb2 = [255 - Session.get('red'),255 - Session.get('green'), 255 - Session.get('blue')];
    $('.c2').css('color','rgb('+rgb2.join(',')+')');
  }

});
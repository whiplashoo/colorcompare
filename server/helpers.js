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
  }

});
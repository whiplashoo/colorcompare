Meteor.subscribe('scores');
maxScore = 255*100*3;

function parseRGB(input){
  m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if( m) {
    return [m[1],m[2],m[3]];
  }
}
function parseHex(input){
 m = input.match(/^#([0-9a-f]{6})$/i)[1];
 if( m) {
  return [
  parseInt(m.substr(0,2),16),
  parseInt(m.substr(2,2),16),
  parseInt(m.substr(4,2),16)
  ];
}
}

Template.layout.rendered = function(){
  // Choose a random color for the target
  Meteor.call('randomColor', function(error,data){
     // if !error, data should be good
     $('#target').css('background',data);
     Session.set('s',data);
   });
  Session.set('red', 150);
  Session.set('green', 150);
  Session.set('blue', 150);
  Session.set('clicks', 3);

  $('#player').mousewheel(function(event,deltaX,deltaY,deltaFactor) {
    var blue = Session.get('blue');
    if (deltaX >0 ) {
      blue += deltaX +1;
    }
    else {
      blue += deltaX -1
    }
    if (blue < 0) {blue = 0};
    if (blue >= 255) {blue = 255};
    Session.set('blue',blue);
    var rgb = [Session.get('red'),Session.get('green'),Session.get('blue')];
    $('#player').css('background','rgb('+rgb.join(',')+')');
    event.preventDefault();
  });
};

Template.layout.events({
  'mousemove #player': function (event) {
    var rect = event.target.getBoundingClientRect();
    var top = rect.top;
    var left = rect.left;

    var X = event.pageX - left;
    var Y = event.pageY - top;
    var red = Math.round(X/300 * 255);
    var green = Math.round(Y/300 * 255);
    Session.set('red',red);
    Session.set('green',green);

    var rgb = [Session.get('red'),Session.get('green'),Session.get('blue')];
    //console.log(Session.get('red'),Session.get('green'),Session.get('blue'));
    $('#player').css('background','rgb('+rgb.join(',')+')');


  },

  'click #player': function (event) {
    var p = parseRGB(event.target.style.backgroundColor);
    var pR = p[0];
    var pG = p[1];
    var pB = p[2];

    var t = parseHex(Session.get('s'));
    var tR = t[0];
    var tG = t[1];
    var tB = t[2];

    Session.set('redOff',Math.abs(pR - tR));
    Session.set('greenOff',Math.abs(pG - tG));
    Session.set('blueOff',Math.abs(pB - tB));

    Session.set('redOffperc', Math.round(Math.abs(pR - tR) *100 / 255));
    Session.set('greenOffperc',Math.round(Math.abs(pG - tG) *100 / 255));
    Session.set('blueOffperc',Math.round(Math.abs(pB - tB) *100 / 255));  
    Session.set('clicks', Session.get('clicks') - 1);

    var score = maxScore - Math.abs(pR-tR)*100 - Math.abs(pB-tB)*100 - Math.abs(pG-tG)*100 ;
    if (score > Session.get('score')){
      Session.set('score',score);
    }
    if (Session.get('clicks') === 0 ){
      $('#player').hide();
      var nottop20 = Scores.find({}, {sort: { sc: -1 }, limit : 1, skip : 18 }).fetch();
      //console.log("20th is " + nottop20.sc);
      var requiredScore = nottop20[0].sc;
      //console.log(requiredScore , Scores.find().count());

      if (Scores.find().count() < 20 || requiredScore < Session.get('score')) {
        // Show the modal
        $(function() {
          $("#myModal").modal();
        });
      }
      Session.set('clicks', 3);
    }
    
    
  }


});

Template.singlescore.rendered = function(){
  var count = 0;
  $('.count').each(function(){
    count++;
    $(this).html(count);
  });
};
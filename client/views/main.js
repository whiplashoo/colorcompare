Meteor.subscribe('scores');
maxScore = 255*100*3;

function parseRGB(input){
  if (input === 'rgba(0, 0, 0, 0)') {
    return [0,0,0];
  }
  m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (m) {
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
     $('#target').css('background-color',data);
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
    $('#player, .circle1, .circle2').css('background','rgb('+rgb.join(',')+')');
    var rgb2 = [255 - Session.get('red'),255 - Session.get('green'), 255 - Session.get('blue')];
    $('.circle1, .circle2').css('color','rgb('+rgb2.join(',')+')');
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
    var red = Math.round(X/350 * 255);
    var green = Math.round(Y/350 * 255);
    Session.set('red',red);
    Session.set('green',green);

    var rgb = [Session.get('red'),Session.get('green'),Session.get('blue')];
    $('#player, .circle1, .circle2').css('background','rgb('+rgb.join(',')+')');
    var rgb2 = [255 - Session.get('red'),255 - Session.get('green'), 255 - Session.get('blue')];
    $('.circle1, .circle2').css('color','rgb('+rgb2.join(',')+')');

  },

  'click #player': function (event) {
    // PLAYER
    var p = parseRGB(event.target.style.backgroundColor);
    var pR = p[0];
    var pG = p[1];
    var pB = p[2];

    // TARGET
    var t = parseRGB($('#target').css('background-color'));
    var tR = t[0];
    var tG = t[1];
    var tB = t[2];

    Session.set('redOff',Math.abs(pR - tR));
    Session.set('greenOff',Math.abs(pG - tG));
    Session.set('blueOff',Math.abs(pB - tB));

    Session.set('redOffperc', 100 - Math.round(Math.abs(pR - tR) * 100 / 255));
    Session.set('greenOffperc', 100 - Math.round(Math.abs(pG - tG) * 100 / 255));
    Session.set('blueOffperc', 100 - Math.round(Math.abs(pB - tB) * 100 / 255));  
    Session.set('clicks', Session.get('clicks') - 1);

    var score = maxScore - Math.abs(pR-tR)*100 - Math.abs(pB-tB)*100 - Math.abs(pG-tG)*100 ;
    if (score > Session.get('tempScore')){
      Session.set('tempScore',score);
    }
    if (Session.get('clicks') === 0 ){
      $('#player').hide();
      Session.set('score',Session.get('tempScore'));

      // Enter HoF if we have less than 20 scores or the 20th best score is smaller than current score. 
      if (Scores.find().count() < 20 || Scores.find({}, {sort: { sc: -1 }, limit : 1, skip : 18 }).fetch()[0].sc < Session.get('score')) {
        // Show the modal
        $("#myModal").modal();
        $('.modal-footer').append($('.bars .table').html());
        $('.modal-footer tbody').wrap('<table class="table table-condensed" style="width:100%"></table>');
        $('#myModal').on('hidden.bs.modal', function (e) {
          $('.modal-footer .table').remove();
        });
      }

      $('.redbar').animate({   width: Session.get('redOffperc') + '%'  }, 800);
      $('.greenbar').animate({ width: Session.get('greenOffperc') + '%'  }, 800);
      $('.bluebar').animate({  width: Session.get('blueOffperc') + '%'  }, 800);
      
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
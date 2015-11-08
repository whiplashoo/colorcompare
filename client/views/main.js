Meteor.subscribe('scores');
maxScore = 255*10*3;
document.title = "Match the Color";

function parseRGB(input){
  if (input === 'rgba(0, 0, 0, 0)') {
    return [255,255,255];
  }
  m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (m) {
    return [m[1],m[2],m[3]];
  }
}
function parseHex(input){
 m = input.match(/^#([0-9a-f]{6})$/i)[1];
 if (m) { return [ parseInt(m.substr(0,2),16), parseInt(m.substr(2,2),16), parseInt(m.substr(4,2),16) ];};
}

function updateColor() {
  var rgb = [Session.get('red'),Session.get('green'),Session.get('blue')];
  $('#player, .c1').css('background','rgb('+rgb.join(',')+')');
  var rgbOpposite = [255 - Session.get('red'),255 - Session.get('green'), 255 - Session.get('blue')];
  $('.c2').css('background','rgb('+rgbOpposite.join(',')+')');
}

function calculateScore(score,time){
  // If it took more than 40 sec, score will be 0.
  if (time > 40){ return 0;}
  // The smaller the time, the better the score will be.
  var time = 40 - time;
  // The timescale is used to make highest scores more dependent on the time they were made. Thus, highest score means more importance on the time in which it was made. Ranges from 0.3 to 1.3.
  var scoreMil = (score / 1000) ;
  var timeScale = 0.3 + Math.pow(scoreMil,2) / 59 ;
  console.log(time,scoreMil,timeScale,score);
  return Math.round(score * timeScale * time).toLocaleString();
}

Template.layout.helpers ({
  clock: function(){
    if (Session.get('time') === undefined) { return '0.00';}
    var time = Session.get('time');
    var decimal = time%100;
    if (decimal < 10) { decimal = '0' + decimal; }
    var sec = (time/100) | 0;
    return sec + '.' + decimal;
  }
});

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
      blue += deltaX + 1;
    }
    else {
      blue += deltaX - 1;
    }
    if (blue < 0) {blue = 0};
    if (blue >= 255) {blue = 255};
    Session.set('blue',blue);

    updateColor();

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
    var green = Math.round(255 - Y/350 * 255);
    Session.set('red',red);
    Session.set('green',green);

    updateColor();
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

    var score = maxScore - 10 * (Math.abs(pR-tR) + Math.abs(pB-tB) + Math.abs(pG-tG)) ;
    if (score > Session.get('tempScore')){
      Session.set('tempScore',score);
    }
    if (Session.get('clicks') === 0 ){
      var finalTime = Session.get('time');
      Meteor.clearInterval(interval);
      console.log(finalTime);
      Session.set('score',calculateScore(Session.get('tempScore'),finalTime/100));

      $('#player').hide();

      // Enter HoF if we have less than 20 scores or the 20th best score is smaller than current score. 
      if (Scores.find().count() < 20 || Scores.find({}, {sort: { sc: -1 }, limit : 1, skip : 18 }).fetch()[0].sc < Session.get('score')) {
        // Show the modal
        $("#myModal").modal();
        $('.modal-footer').append($('.bars .table').html());
        $('.modal-footer tbody').wrap('<table class="table table-condensed" style="width:100%"></table>');
        // $('.animated').addClass('flip');
        $('#myModal').on('hidden.bs.modal', function (e) {
          // $('.animated').removeClass('flip');
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
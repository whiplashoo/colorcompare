Meteor.subscribe('scores');
maxScore = 255*10*3;
document.title = "Match the Color";
var clock = 0;

var timer = function() {
  clock++;
  Session.set("time", clock);
  return clock;
};


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
  return Math.round(score * timeScale * time);
}

function getPerc(colorOff){
  if (Session.get('clicks') === 3){
    return 0;
  }
  return 100 - Math.round(colorOff * 100 / 255)
}

Template.layout.created = function(){
  this.redOff = new ReactiveVar(0);
  this.blueOff = new ReactiveVar(0);
  this.greenOff = new ReactiveVar(0);
  this.tempScore = new ReactiveVar(0);
  this.reactScore = new ReactiveVar(0);
};

Template.layout.helpers ({
  clock: function(){
    if (Session.get('time') === undefined) { return '0.00';}
    var time = Session.get('time');
    var decimal = time%100;
    if (decimal < 10) { decimal = '0' + decimal; }
    var sec = (time/100) | 0;
    return sec + '.' + decimal;
  },
  scores: function() {
    return Scores.find({}, {sort: {sc: -1} , limit:20});
  },
  tries: function() {
    return Session.get('clicks');
  },
  count20: function(){
    var arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    return arr;
  },
  redOff: function() {
    return Template.instance().redOff.get();
  },
  greenOff: function() {
    return Template.instance().greenOff.get();
  },
  blueOff: function() {
    return Template.instance().blueOff.get();
  },
  redOffperc: function() {
    return getPerc(Template.instance().redOff.get());
  },
  greenOffperc: function() {
    return getPerc(Template.instance().greenOff.get());
  },
  blueOffperc: function() {
    return getPerc(Template.instance().blueOff.get());
  },
  currentScore: function() {
    return Template.instance().reactScore.get();
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

  'click #player': function (event,template) {
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

    template.redOff.set(Math.abs(pR - tR));
    template.greenOff.set(Math.abs(pG - tG));
    template.blueOff.set(Math.abs(pB-tB));

    Session.set('clicks', Session.get('clicks') - 1);

    var score = maxScore - 10 * (Math.abs(pR-tR) + Math.abs(pB-tB) + Math.abs(pG-tG)) ;

    if (score > Template.instance().tempScore.get()){
      template.tempScore.set(score);
    }
    if (Session.get('clicks') === 0 ){
      var finalTime = Session.get('time');
      Meteor.clearInterval(interval);
      template.reactScore.set(calculateScore(Template.instance().tempScore.get(),finalTime/100));

      $('#player').hide();

      // Enter HoF if we have less than 20 scores or the 20th best score is smaller than current score. 
      if (Scores.find().count() < 20 || Scores.find({}, {sort: { sc: -1 }, limit : 1, skip : 18 }).fetch()[0].sc < Template.instance().reactScore.get()) {
        // Show the modal
        $("#myModal").modal();
        $('.redbar').animate({   width: getPerc(Template.instance().redOff.get()) + '%'  }, 800);
        $('.greenbar').animate({ width: getPerc(Template.instance().greenOff.get()) + '%'  }, 800);
        $('.bluebar').animate({  width: getPerc(Template.instance().blueOff.get()) + '%'  }, 800);
      }
    }
},
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
    if (text === ""){
      $('.alert').html('Please provide a valid nickname.');
      $('.alert').show();
      return false;
    }
    
    Session.set('currentUser',text);
    
    // Clear form
    event.target.user.value = "";
    $('#myModal').modal('hide');

    Meteor.call('insertUser', text, Template.instance().reactScore.get());
    // Prevent default form submit
    return false;
  },

  'click .start-over-btn':function(event, template){
    var tempUser = Session.get('currentUser');
    Session.set('currentUser',tempUser);
    template.reactScore.set(0);
    template.tempScore.set(0);
    template.redOff.set(0);
    template.blueOff.set(0);
    template.greenOff.set(0);
    Session.set('red', 150);
    Session.set('green', 150);
    Session.set('blue', 150);
    Session.set('clicks', 3);
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

Template.singlescore.rendered = function(){
  var count = 0;
  $('.count').each(function(){
    count++;
    $(this).html(count);
  });
};
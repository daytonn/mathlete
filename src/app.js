//= require "mathlete"
(function() {
  var body = $('body');
  var message = $('#message');
  var notification;
  var display = $('.display');
  var answerInput = "";
  var answerNumber = 0;
  var events;
  var randomCard;
  var startTime;
  var endTime;
  var hasBeenCalledWithEmptyInput;

  function startGame() {
    startTime = moment().unix();
    Mathlete.reset();
    selectRandomCard();
    clearInput();
    render();
    setInterval(renderElapsedTime, 1000);
  }

  function renderElapsedTime() {
    $('.elapsed-time').html(elapsedTime());
  }

  function render() {
    Mathlete.container.empty();
    renderDisplay();
    renderCard();
  }

  function elapsedTime() {
    if (typeof endTime === "undefined") {
      var duration = moment.duration((moment().unix() - startTime) * 1000);
      var seconds = duration.seconds();
      var minutes = duration.minutes();

      if (seconds < 10) {
        seconds = '0' + seconds;
      }

      if (minutes < 10) {
        minutes = '0' + minutes;
      }

      return [minutes, seconds].join(':');
    }
  }

  function renderDisplay() {
    var templateData = {
      notification: notification || '',
      cardsLeft: Mathlete.questions.length,
      score: Mathlete.scoreBoard.reduce(function(memo, score) {
        return memo += score ? 1 : 0;
      }, 0),
      elapsedTime: elapsedTime()
    };
    var  template = Mathlete.Templates.display(templateData);
    Mathlete.container.append(template);
    display.html(answerInput);
  }

  function renderCard() {
    if (Mathlete.questions.isEmpty()) {
      Mathlete.container.append(Mathlete.Templates.end());
    }
    else {
      $('.display').html(answerInput);
      var templateData = randomCard;
      templateData.answerInput = answerInput;
      Mathlete.container.append(Mathlete.Templates.card(templateData));
    }
  }

  function inputNumber(num) {
    answerInput = answerInput;
    answerInput += num + '';
    answerNumber = parseInt(answerInput, 10);
  }

  function answerQuestion() {
    if (inputIsValid()) {
      calculate();
      resetInput();
      showNewQuestion();
      render();
    }
  }

  function showNewQuestion() {
    selectRandomCard();
  }

  function resetInput() {
    answerInput = "";
    answerNumber = 0;
  }

  function calculate() {
    var answer = Mathlete.timesTable[randomCard.question];
    scoreAnswer(answerNumber === answer);
  }

  function inputIsValid() {
    var valid = false;
    if (answerInput === "") {
      if (hasBeenCalledWithEmptyInput) {
        alert('Enter a number first dumbass');
        clearInput();
      }
      hasBeenCalledWithEmptyInput = true;
    }
    else {
      valid = true;
    }

    return valid;

  };

  function scoreAnswer(answerIsCorrect) {
    Mathlete.scoreBoard[randomCard.question] = answerIsCorrect;
    displayNotification(answerIsCorrect);
  }

  function displayNotification(answerIsCorrect) {
    notification = answerIsCorrect ? '<span style="color:green;">Correct, answer is ' + Mathlete.timesTable[randomCard.question] + ' </span>' : '<span style="color:red;">Incorrect, answer is ' + Mathlete.timesTable[randomCard.question] + '</span>';
  }

  function selectRandomCard() {
    randomCard = Mathlete.pickRandomCard();
  }

  function clearInput() {
    hasBeenCalledWithEmptyInput = false;
    resetInput();
    render();
  }

  function addNumberToInput() {
    inputNumber(this.html());
    render();
  }

  body.on('click', dispatchPageClick);



  function dispatchPageClick(e) {
    var elem = $(e.target);
    var eventKey = elem.attr('class');
    var events = {
      'try-again': startGame,
      'answer-button': answerQuestion,
      'clear-button': clearInput,
      'number': addNumberToInput
    };

    if (typeof events[eventKey] !== "undefined") {
      events[eventKey].call(elem);
    }
  }

  startGame();

})();
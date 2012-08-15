//= require "mathlete"
(function() {
  var newCard = $('#new-card');
  var body = $('body');

  function renderRandomCard() {
    Mathlete.container.html(Mathlete.Templates.card(Mathlete.pickRandomCard()));
    if (Mathlete.questions.isEmpty()) {
      Mathlete.container.html(Mathlete.Templates.end());
      newCard.hide();
    }
  }

  renderRandomCard();

  newCard.on('click', renderRandomCard);

  body.on('click', function(e) {
    var elem = $(e.target);
    if (elem.hasClass('try-again')) {
      newCard.show();
      Mathlete.reset();
      renderRandomCard();
    }
  });

})();
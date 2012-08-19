var Mathlete = (function() {
  //= require "_zepto"
  //= require "_underwear"
  //= require "_number"
  //= require "_moment"

  var Mathlete = {
      timesTable: {},
      scoreBoard: {},
      questions: [],
      container: $('#container'),

      createValueForKey: function(table, a, b, callback, key) {
        key = key || a + 'x' + b;
        callback = callback || function (a, b) {
          return a * b;
        };
        table[key] = callback(a, b);
      },

      createTableForInteger: function(i) {
        (9).times(function(n) {
          Mathlete.createValueForKey(Mathlete.timesTable, i, n);
          Mathlete.createValueForKey(Mathlete.scoreBoard, i, n, function(a, b) { return null });
          Mathlete.questions.push(i + 'x' + n);
        });
      },

      pickRandomCard: function () {
        var length = this.questions.length;
        var randomIndex = Math.floor(length * Math.random());
        var question = this.questions[randomIndex];
        this.questions[randomIndex] = null;
        this.questions = this.questions.compact();
        return { question: question, cardsLeft: this.questions.length };
      },

      reset: function () {
        this.timesTable = {};
        this.scoreBoard = {};
        this.questions = [];
        (9).times(Mathlete.createTableForInteger);
      }

  };

  Mathlete.reset();

  //= require "../lib/templates"

  return Mathlete;

})();

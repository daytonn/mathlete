Mathlete.Templates = {
    "card": function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="card">\n  <p class="question">\n    ',  question ,'\n  </p>\n  <p class="answer">\n    <input name="answer" type="text"/>\n  </p>\n  <p class="cards-left">\n    ',  cardsLeft ,'/80\n  </p>\n</div>');}return __p.join('');},
	"end": function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<p>\n  You\'re done\n</p>\n<button type="submit" class="try-again">Go Again</button>');}return __p.join('');},
	"index": function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('Hello World');}return __p.join('');}
};
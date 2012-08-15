Number.prototype.times = function(callback, context) {
  context = context || this;
  for (var i = 0; i < this; i += 1) {
    var n = i + 1;
    callback.call(context, n, context);
  }
};
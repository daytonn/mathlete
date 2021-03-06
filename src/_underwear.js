;(function(Namespace, argsWithThis) {

(function() {


  var root = this;

  var previousUnderscore = root._;

  var breaker = {};

  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  var _ = function(obj) { return new wrapper(obj); };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  _.VERSION = '1.3.3';


  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };


  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };


  var ctor = function(){};

  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };


  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  function eq(a, b, stack) {
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    if (a == null || b == null) return a === b;
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      case '[object String]':
        return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    var length = stack.length;
    while (length--) {
      if (stack[length] == a) return true;
    }
    stack.push(a);
    var size = 0, result = true;
    if (className == '[object Array]') {
      size = a.length;
      result = size == b.length;
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      for (var key in a) {
        if (_.has(a, key)) {
          size++;
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    stack.pop();
    return result;
  }

  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  _.isNaN = function(obj) {
    return obj !== obj;
  };

  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  _.isNull = function(obj) {
    return obj === null;
  };

  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };


  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  _.identity = function(value) {
    return value;
  };

  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  var noMatch = /.^/;

  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  _.chain = function(obj) {
    return _(obj).chain();
  };


  var wrapper = function(obj) { this._wrapped = obj; };

  _.prototype = wrapper.prototype;

  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  _.mixin(_);

  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(Namespace);
    var _ = Namespace._;
Namespace.isEqual = _.isEqual;

Namespace.isArguments = _.isArguments;

Namespace.isObject = _.isObject;

Namespace.isArray = _.isArray;

Namespace.isString = _.isString;

Namespace.isNumber = _.isNumber;

Namespace.isBoolean = _.isBoolean;

Namespace.isFunction = _.isFunction;

Namespace.isDate = _.isDate;

Namespace.isRegExp = _.isRegExp;

Namespace.isNaN = _.isNaN;

Namespace.isNull = _.isNull;

Namespace.isElement = _.isElement;

Namespace.isUndefined = _.isUndefined;

Namespace.isUndefined = _.isUndefined;

Namespace.sequence = _.uniqueId;

Namespace.uniqueID = function() {

    function S4() {
       return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString(16).substring(1);
    }

    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();

};

Namespace.isDefined = function(suspect) {
    return !_.isUndefined(suspect);
}

if (typeof Array.prototype.isEmpty === "undefined") {
    Array.prototype.isEmpty = function() {
        return _.isEmpty.call(this, this);
    };
}

if (typeof String.prototype.isEmpty === "undefined") {
    String.prototype.isEmpty = function() {
        return _.isEmpty(this);
    };
}

if (typeof Object.prototype.isEmpty === "undefined") {
    Object.prototype.isEmpty = function() {
        return _.isEmpty.call(this, this);
    };
}

if (typeof Object.prototype.tap === "undefined") {
    Object.prototype.tap = function() {
        var args = argsWithThis.call(this, arguments);
        return _.tap.apply(this, args);
    };
}

if (typeof String.prototype.escape === "undefined") {
    String.prototype.escape = function() {
        var args = argsWithThis.call(this, arguments);
        return _.escape.apply(this, args);
    };
}
if (typeof Array.prototype.first === "undefined") {
    Array.prototype.first = function() {
        var args = argsWithThis.call(this, arguments);
        return _.first.apply(this, args);
    };
}

if (typeof Array.prototype.take === "undefined") {
    Array.prototype.take = Array.prototype.first;
}

if (typeof Array.prototype.rest === "undefined") {
    Array.prototype.rest = function() {
        var args = argsWithThis.call(this, arguments);
        return _.rest.apply(this, args);
    };
}

if (typeof Array.prototype.tail === "undefined") {
    Array.prototype.tail = Array.prototype.rest;
}

if (typeof Array.prototype.initial === "undefined") {
    Array.prototype.initial = function() {
        var args = argsWithThis.call(this, arguments);
        return _.initial.apply(this, args);
    };
}

if (typeof Array.prototype.last === "undefined") {
    Array.prototype.last = function() {
        var args = argsWithThis.call(this, arguments);
        return _.last.apply(this, args);
    };
}

if (typeof Array.prototype.compact === "undefined") {
    Array.prototype.compact = function() {
        var args = argsWithThis.call(this, arguments);
        return _.compact.apply(this, args);
    };
}

if (typeof Array.prototype.flatten === "undefined") {
    Array.prototype.flatten = function(shallow) {
        var args = argsWithThis.call(this, arguments);
        return _.flatten.apply(this, args);
    };
}

if (typeof Array.prototype.without === "undefined") {
    Array.prototype.without = function() {
        var args = argsWithThis.call(this, arguments);
        return _.without.apply(this, args);
    };
}

if (typeof Array.prototype.uniq == "undefined") {
    Array.prototype.uniq = function() {
        var args = argsWithThis.call(this, arguments);
        return _.uniq.apply(this, args);
    };
}

if (typeof Array.prototype.intersection === "undefined") {
    Array.prototype.intersection = function() {
        var args = argsWithThis.call(this, arguments);
        return _.intersection.apply(this, args);
    };
}

if (typeof Array.prototype.union === "undefined") {
    Array.prototype.union = function() {
        var args = argsWithThis.call(this, arguments);
        return _.union.apply(this, args);
    };
}

if (typeof Array.prototype.difference === "undefined") {
    Array.prototype.difference = function() {
        var args = argsWithThis.call(this, arguments);
        return _.difference.apply(this, args);
    };
}

if (typeof Array.prototype.zip === "undefined") {
    Array.prototype.zip = function() {
        var args = argsWithThis.call(this, arguments);
        return _.zip.apply(this, args);
    };
}

if (typeof Array.prototype.indexOf === "undefined") {
    Array.prototype.indexOf = function() {
        var args = argsWithThis.call(this, arguments);
        return _.indexOf.apply(this, args);
    };
}

if (typeof Array.prototype.lastIndexOf === "undefined") {
    Array.prototype.lastIndexOf = function() {
        var args = argsWithThis.call(this, arguments);
        return _.lastIndexOf.apply(this, args);
    };
}

if (typeof Array.prototype.range === "undefined") {
    Array.range = function() {
        return _.range.apply(this, arguments);
    };
}
function filterNonObjects(suspect, method) {
    if (suspect.constructor == Object) {
        return suspect;
    }
    else {
        throw new Error(method + " called on a non-object");
    }
}

if (typeof Object.prototype.keys === "undefined") {
    Object.prototype.keys = function() {
        filterNonObjects(this, "Object.keys()");
        var args = argsWithThis.call(this, arguments);
        return _.keys.apply(this, args);
    };
}

if (typeof Object.prototype.values === "undefined") {
    Object.prototype.values = function() {
        filterNonObjects(this, "Object.values()");
        var args = argsWithThis.call(this, arguments);
        return _.values.apply(this, args);
    };
}

if (typeof Object.prototype.functions === "undefined") {
    Object.prototype.functions = function() {
        var args = argsWithThis.call(this, arguments);
        var functions = _.functions.apply(this, args);
        return functions.without('all',
                                 'any',
                                 'bindAll',
                                 'clone',
                                 'collect',
                                 'contains',
                                 'defaults',
                                 'detect',
                                 'each',
                                 'every',
                                 'extend',
                                 'filter',
                                 'find',
                                 'forEach',
                                 'foldr',
                                 'groupBy',
                                 'has',
                                 'include',
                                 'inject',
                                 'invoke',
                                 'isEmpty',
                                 'keys',
                                 'map',
                                 'max',
                                 'methods',
                                 'min',
                                 'pick',
                                 'pluck',
                                 'reduce',
                                 'reduceRight',
                                 'reject',
                                 'select',
                                 'some',
                                 'sortBy',
                                 'sortedIndex',
                                 'shuffle',
                                 'size',
                                 'tap',
                                 'toArray',
                                 'values',
                                 'functions');
    };

    Function.prototype.functions = Object.prototype.functions;
}

if (typeof Object.prototype.methods === "undefined") {
    Object.prototype.methods = Object.prototype.functions;
}

if (typeof Object.prototype.extend === "undefined") {
    Object.prototype.extend = function() {
        var args = argsWithThis.call(this, arguments);
        return _.extend.apply(this, args);
    };
}

if (typeof Object.prototype.pick === "undefined") {
    Object.prototype.pick = function() {
        var args = argsWithThis.call(this, arguments);
        return _.pick.apply(this, args);
    };
}

if (typeof Object.prototype.defaults === "undefined") {
    Object.prototype.defaults = function() {
        var args = argsWithThis.call(this, arguments);
        return _.defaults.apply(this, args);
    };
}

if (typeof Object.prototype.clone === "undefined") {
    Object.prototype.clone = function() {
        return _.clone(this);
    };
}

if (typeof Object.prototype.has === "undefined") {
    Object.prototype.has = function() {
        var args = argsWithThis.call(this, arguments);
        return _.has.apply(this, args);
    };
}
if (typeof Array.prototype.each === "undefined") {
    Array.prototype.each = function() {
        var args = argsWithThis.call(this, arguments);
        return _.each.apply(this, args);
    };
}

if (typeof Object.prototype.each === "undefined") {
    Object.prototype.each = function() {
        var args = argsWithThis.call(this, arguments);
        return _.each.apply(this, args);
    };
}

if (typeof Object.prototype.forEach === "undefined") {
    Object.prototype.forEach = Object.prototype.each;
}

if (typeof Object.prototype.map === "undefined") {
    Object.prototype.map = function() {
        var args = argsWithThis.call(this, arguments);
        return _.map.apply(this, args);
    };
}

if (typeof HTMLCollection.prototype.map === "undefined") {
    HTMLCollection.prototype.map = function() {
        var args = argsWithThis.call(this, arguments);
        return _.map.apply(this, args);
    };
}

if (typeof Object.prototype.collect === "undefined") {
    Object.prototype.collect = Object.prototype.map;
}

if (typeof Object.prototype.reduce === "undefined") {
    Object.prototype.reduce = function() {
        var args = argsWithThis.call(this, arguments);
        return _.reduce.apply(this, args);
    };
}

if (typeof Object.prototype.inject === "undefined") {
    Object.prototype.inject = Object.prototype.reduce;
}

if (typeof Object.prototype.reduceRight === "undefined") {
    Object.prototype.reduceRight = function() {
        var args = argsWithThis.call(this, arguments);
        return _.reduceRight.apply(this, args);
    };
}

if (typeof Object.prototype.foldr === "undefined") {
    Object.prototype.foldr = Object.prototype.reduceRight;
}

if (typeof Object.prototype.find === "undefined") {
    Object.prototype.find = function() {
        var args = argsWithThis.call(this, arguments);
        return _.find.apply(this, args);
    };
}

if (typeof Object.prototype.detect === "undefined") {
    Object.prototype.detect = Object.prototype.find;
}

if (typeof Object.prototype.filter === "undefined") {
    Object.prototype.filter = function() {
        var args = argsWithThis.call(this, arguments);
        return _.filter.apply(this, args);
    };
}

if (typeof Object.prototype.select == 'undefined') {
    Object.prototype.select = Object.prototype.filter;
}

if (typeof Object.prototype.reject === "undefined") {
    Object.prototype.reject = function() {
        var args = argsWithThis.call(this, arguments);
        return _.reject.apply(this, args);
    };
}

if (typeof Object.prototype.every === "undefined") {
    Object.prototype.every = function() {
        var args = argsWithThis.call(this, arguments);
        return _.every.apply(this, args);
    };
}

if (typeof Object.prototype.all == 'undefined') {
    Object.prototype.all = Object.prototype.every;
}

if (typeof Object.prototype.some === "undefined") {
    Object.prototype.some = function() {
        var args = argsWithThis.call(this, arguments);
        return _.some.apply(this, args);
    };
}

if (typeof Object.prototype.any == 'undefined') {
    Object.prototype.any = Object.prototype.some;
}

if (typeof Object.prototype.include === "undefined") {
    Object.prototype.include = function() {
        var args = argsWithThis.call(this, arguments);
        return _.include.apply(this, args);
    };
}

if (typeof Object.prototype.contains === "undefined") {
    Object.prototype.contains = Object.prototype.include;
}

if (typeof Object.prototype.invoke === "undefined") {
    Object.prototype.invoke = function() {
        var args = argsWithThis.call(this, arguments);
        return _.invoke.apply(this, args);
    };
}

if (typeof Object.prototype.pluck === "undefined") {
    Object.prototype.pluck = function() {
        var args = argsWithThis.call(this, arguments);
        return _.pluck.apply(this, args);
    };
}

if (typeof Object.prototype.max === "undefined") {
    Object.prototype.max = function() {
        var args = argsWithThis.call(this, arguments);
        return _.max.apply(this, args);
    };
}

if (typeof Object.prototype.min === "undefined") {
    Object.prototype.min = function() {
        var args = argsWithThis.call(this, arguments);
        return _.min.apply(this, args);
    };
}

if (typeof Object.prototype.sortBy === "undefined") {
    Object.prototype.sortBy = function() {
        var args = argsWithThis.call(this, arguments);
        return _.sortBy.apply(this, args);
    };
}

if (typeof Object.prototype.groupBy === "undefined") {
    Object.prototype.groupBy = function() {
        var args = argsWithThis.call(this, arguments);
        return _.groupBy.apply(this, args);
    };
}

if (typeof Object.prototype.sortedIndex === "undefined") {
    Object.prototype.sortedIndex = function() {
        var args = argsWithThis.call(this, arguments);
        return _.sortedIndex.apply(this, args);
    };
}

if (typeof Object.prototype.shuffle === "undefined") {
    Object.prototype.shuffle = function() {
        var args = argsWithThis.call(this, arguments);
        return _.shuffle.apply(this, args);
    };
}

if (typeof Object.prototype.toArray === "undefined") {
    Object.prototype.toArray = function() {
        var args = argsWithThis.call(this, arguments);
        return _.values.apply(this, args);
    };
}

if (typeof Object.prototype.size === "undefined") {
    Object.prototype.size = function() {
        var args = argsWithThis.call(this, arguments);
        return _.size.apply(this, args);
    };
}
if (typeof Function.prototype.bind === "undefined") {
    Function.prototype.bind = function() {
        var args = argsWithThis.call(this, arguments);
        return _.bind.apply(this, args);
    };
}

if (typeof Function.prototype.bindAll === "undefined") {
    Function.prototype.bindAll = function() {
        var args = argsWithThis.call(this, arguments);
        return _.bindAll.apply(this, args);
    };
}

if (typeof Object.prototype.bindAll === "undefined") {
    Object.prototype.bindAll = Function.prototype.bindAll;
}

if (typeof Function.prototype.memoize === "undefined") {
    Function.prototype.memoize = function() {
        var args = argsWithThis.call(this, arguments);
        return _.memoize.apply(this, args);
    };
}

if (typeof Function.prototype.delay === "undefined") {
    Function.prototype.delay = function() {
        var args = argsWithThis.call(this, arguments);
        return _.delay.apply(this, args);
    };
}

if (typeof Function.prototype.defer === "undefined") {
    Function.prototype.defer = function() {
        var args = argsWithThis.call(this, arguments);
        return _.defer.apply(this, args);
    };
}

if (typeof Function.prototype.throttle === "undefined") {
    Function.prototype.throttle = function() {
        var args = argsWithThis.call(this, arguments);
        return _.throttle.apply(this, args);
    };
}

if (typeof Function.prototype.debounce === "undefined") {
    Function.prototype.debounce = function() {
        var args = argsWithThis.call(this, arguments);
        return _.debounce.apply(this, args);
    };
}

if (typeof Function.prototype.once === "undefined") {
    Function.prototype.once = function() {
        var args = argsWithThis.call(this, arguments);
        return _.once.apply(this, args);
    };
}

if (typeof Function.prototype.wrap === "undefined") {
    Function.prototype.wrap = function() {
        var args = argsWithThis.call(this, arguments);
        return _.wrap.apply(this, args);
    };
}

if (typeof Function.prototype.compose === "undefined") {
    Function.prototype.compose = function() {
        var args = argsWithThis.call(this, arguments);
        return _.compose.apply(this, args);
    };
}
if (typeof Number.prototype.times === "undefined") {
    Number.prototype.times = function() {
        var args = argsWithThis.call(this, arguments);
        return _.times.apply(this, args);
    };
}
Namespace.Template = (function() {

    function Template(src) {
        if (src.match(/^#/)) {
            this.src = document.getElementById(src.replace(/^#/, '')).innerHTML;
        }
        else {
            this.src = src;
        }
    }

    Template.prototype.render = function(data, settings) {
        return _.template(this.src, data, settings);
    };

    return Template;
})();
})(window,
    function(args) {
        var a = Array.prototype.slice.call(args);
        a.unshift(this);
        return a;
    }
);

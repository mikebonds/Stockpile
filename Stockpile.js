(function(window, undefined) {
	// Setup Stockpile factory
	var Stockpile = function(extension) {
		extension = extension || {};

		return _initializePile(extension);
	};

	// Stockpile Factory
	Stockpile.fn = Stockpile.factory = {
		tagName: 'div',

		className: '',

		containerTag: 'div',

		name: '',

		items: [],

		name: '',

		// Empty initialize function - meant to be overridden 
		initialize: function() {},

		remove: function(item) {
			var index = _data(item).get('item_index');
			item.parentNode.removeChild(item);
			this.items.splice(index, 1);
			this.length = this.items.length;
			_updateIndices(this.items, index);
		},

		moveDown: function(item) {
			_moveInDirection.call(this, item, 'down');
		},

		moveUp: function(item) {
			_moveInDirection.call(this, item, 'up');
		},

		moveToFront: function(item) {
			_moveTo.call(this, item, this.items.length -1);
		},

		moveToBack: function(item) {
			_moveTo.call(this, item, 0);
		},

		moveToPrevious: function(item) {
			_moveTo.call(this, item, _data(item).get('previous_index'));
		},

		// Will need a better argument name for amount as it can also be an array of elements.
		addItem: function(amount, type, classes) {
			if(amount instanceof Array || typeof amount === 'object') {
				PileRef.insert(this.sp_id, amount, 'elements');
				this.length = this.items.length;
			} else {
				var items = PileRef.insert(this.sp_id, amount, (type || 'div'), classes);
				this.length += items.length;
			
				return items;
			}
		},

		destroy: function(arg) {
			PileRef.remove(this.sp_id);
			
			this.items.forEach(function(item) {
				_destroy.call(item);
			});

			this.items = [];
			_destroy.call(this.el);
			window[this.name] = null; // Clean up from global object if present.
		},

		zIndex: 10, // Default starting z-index

		length: 0
	};

	Stockpile.VERSION = '0.1.4.0';

	// Element Methods
	var _destroy = function() {
		this.parentNode.removeChild(this);
	};

	var el_methods = {
		insertInto: function(selector) {
			var element = _select(selector);
			for(var i = 0; i < element.length; i++) {
				element[i].appendChild(this);
			}
		}
	};

	// _moveInDirection and _moveTo will need to be refectored into one method with options
	var _moveInDirection = function(item, direction) {
		var index = _data(item).get('item_index');
		var direction = direction === 'up' ? index + 1 : index - 1;
		var new_index = _move(this.items, index, direction);
		var modified = _getModifiedHelper(this.items, index, new_index);

		_data(item).set({ 'item_index': new_index, 'previous_index': index });
		_reFlow(modified, new_index, index, this);
	};

	var _moveTo = function(item, position) {
		var index = _data(item).get('item_index');
		var new_index = _move(this.items, index, position);
		var modified = _getModifiedHelper(this.items, index, new_index);

		_data(item).set({ 'item_index': new_index, 'previous_index': index });
		_reFlow(modified, new_index, index, this);
	};

	var _getModifiedHelper = function(items, start_index, end_index, context) {
		if(start_index > end_index) {
			return items.slice(end_index, start_index + 1);	
		} else {
			return items.slice(start_index, end_index + 1);
		}
	};

	var _reFlow = function(items, new_index, old_index, context) {
		var i = 0, length = items.length;
		var index = new_index > old_index ? old_index : new_index;

		if(items.length === context.items.length) index = 0;

		for(; i < length; i++) {
			_applyZindex.call(context, items[i], index);
			_data(items[i]).set('item_index', index);
			index++;
		}
	};

	var _updateIndices = function(items, start) {
		var i = start;

		if(start < items.length) {
			for(; i < items.length; i++) {
				_data(items[i]).set('item_index', i);
			}
		}
	};

	var _applyZindex = function(item, index) {
		var zIndex = index ? (index + 1) * this.zIndex : this.zIndex;
		item.style.zIndex = zIndex;
	};

	PileRef = function(pile) {
		PileRef.piles.push(pile);
	};

	PileRef.insert = function(id, amount, type, classes) {
		var pile = _find(PileRef.piles, { sp_id: id }),
			i = 0, length, elm, to_add, 
			elements = [], 
			classes = classes ? pile.name + '-item' + ' ' + classes : pile.name + '-item';

		if(type === 'elements') {
			length = amount.length;
			to_add = amount;
		} else {
			length = amount || 1;
		}

		if(to_add) {
			for(; i < length; i++) {
				var elm = PileRef.applyProps(pile, to_add[i]);
				elements.push(elm);
			}
		} else {
			for(; i < length; i++) {
				var elm = PileRef.create(pile, type, classes);
				pile.el.appendChild(elm);
				elements.push(elm);
			}
		}
		

		return elements;
	};

	PileRef.create = function(pile, type, classes) {
		var elm = _createElement(type, classes);
		return PileRef.applyProps(pile, elm);
	};

	PileRef.applyProps = function(pile, elm) {
		elm.cid = _uniqueId();
		_data(elm).set({ 'guid': _uniqueId(), 'item_index': pile.items.length, 'previous_index': pile.items.length });
		_applyZindex.call(pile, elm, pile.items.length);
		pile.items.push(elm);

		return elm;
	};

	PileRef.remove = function(id) {
		PileRef.piles.splice(_indexOf(PileRef.piles, { sp_id: id }), 1);
	};

	PileRef.piles = [];

	// Private Methods
	//----------------------------

	var cache = [];
 
    var _data = function(elm) {
        var cacheIndex = elm[elm.cid];
 
        if(!cacheIndex) {
            cacheIndex = elm[elm.cid] = cache.length + '';
            cache[parseInt(cacheIndex)] = {};
        } else {
        	cacheIndex = parseInt(cacheIndex);
        }
 
        return {
            get : function(key) {
                return cache[cacheIndex][key];
            },
            set : function(arg) {
            	if(typeof arg === 'object') {
            		for(var key in arg) {
            			cache[cacheIndex][key] = arg[key];
            		}
            	} else {
            		cache[cacheIndex][arguments[0]] = arguments[1];
            	}
            }
        }
 
    };

	var _initializePile = function(obj) {
		obj = _extend(obj, Stockpile.fn);
		obj.sp_id = _uniqueId();

		if(obj.el) {
			obj.el = _select(obj.el)[0];
		} else {
			obj.el = _createElement(obj.tagName, obj.className);
		}

		obj.el.guid = _uniqueId();

		PileRef(obj);

		_extend(obj.el, el_methods);

		obj.initialize();

		return obj;
	};

	// Helper/Utility Methods

	var _s = {};

	// Returns a unique identifier.
	var _uniqueId = _s.uniqueId = function() {
		var d = Date.now();
	    var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	    });
	    return guid;
	};

	// Returns a newly created element of the given type and applys the given classes to the element.
	var _createElement = _s.createElement = function(type, classes) {
		var elm = document.createElement(type);
		elm.className = classes;
		return elm;
	};

	// Extends the given obj with the source object - returns the extended object.
	var _extend = _s.extend = function(obj, source) {
		source = _deepClone(source);

		for(var prop in source) {
			if(!obj.hasOwnProperty(prop)) {
				obj[prop] = source[prop];
			}
		}

		return obj;
	};

	// Shorter version of document.querySelectAll().
	var _select = _s.select = function(arg) {
		return document.querySelectorAll(arg);
	};

	// Return the first intance of the matched object in the given array.
	// Return the index if return index is set to true.
	var _find = _s.find = function(arr, attrs, return_index) {
		var obj, index, test = _matches(attrs);

		arr.some(function(value, position) {
			if(test.call(undefined, value)) {
				obj = value;
				index = position;
				return true
			}
		});

		return  return_index ? index : obj;
	};

	// Alternative/Symantic syntax for _find where return_index set to true.
	// Return the index of the first intance of the matched object in the given array.
	var _indexOf = _s.indexOf = function(arr, attrs) {
		return _find(arr, attrs, true);
	};

	// Used in conjuntion with _find. 
	// Returns a function to be used to find whether a given object containers the "Key:Value" pair defined in attrs.
	var _matches = _s.matches = function(attrs) {
		return function(obj) {
			if(obj === attrs) return true;

			for(var key in attrs) {
				if(attrs[key] !== obj[key]) return false;
			}

			return true
		}
	};

	// Moves array element at a specfied index to the new index.
	// if new index > array length, the element at index is moved to the front of the array.
	// if new index < 0, the element at index is moved to the end of the array.
	var _move = _s.move = function(arr, index, new_index) {
		var last_index = arr.length - 1;

		if(new_index > last_index) new_index = 0;
		if(new_index < 0) new_index = last_index;

		arr.splice(new_index, 0, arr.splice(index, 1)[0]);

		return new_index;
	};

	// Create a deep clone of the passed source object.
	// Returns a new clone.
	var _deepClone = _s.deepClone = function(source) {
		var clone = {};
		if(source) {
			for (var prop in source) {
				if (typeof source[prop] === 'object') {
					clone[prop] = source[prop].constructor === Array ? [] : {}; 
					_deepClone(source[prop], clone[prop]);
				} else {
					clone[prop] = source[prop];
				} 
			}
			return clone;
		}

		return false;
	};

	// Define Stockpile and _s as AMD Modules if available.
	// Otherwise expose to the Global Object.
	if(typeof define === 'function' && define.amd) {
		define('_s', [], function() {
			return _s;
		});

		define('Stockpile', [], function() {
			return Stockpile;
		});
	} else {
		window.Stockpile = Stockpile;
		window._s = _s;
	}
})(window, undefined);
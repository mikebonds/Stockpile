# Stockpile.js #

Stockpile.js is a small project that allows the management of "Layers" via z-index.

Stockpile.js Allows a user to create a new Stockpiles a needed through a new Stockpile() constructor.
The user has the ability to extend the prototype by passing in an object. 

# Creating a Stockpile #

	var LayerManager = new Stockpile({
    	el: 'section',

    	className: 'my-layers',

    	name: 'LayerManager',

    	initialize: function() {
    		console.log('LayerManager is initialized!');
    		this.render();
    		this.createLayers();
    	},

    	render: function() {
    		this.el.insertInto('body');
    	},

    	createLayers: function() {
			for(var i = 1; i <= 4; i++) {
				this.addItem(false, false, 'test' + i);
			}
    	}
	});

# Upcoming Method Updates #

* moveToFront
* moveToBack
* lockInPlace
* unLock

#### Layer Groups ####

* CreateGroup
* removeGroup
* unGroup

# Disclaimer #

This code is provided with no warranty. The code is still under active development. As this is the case, some revisions may break break compatibility with earlier versions of the library. Please keep this in mind when using Stockpile.js.

Stockpile.js is still very much under development.
If you have stumbled upon this code, please take into consideration that this is a very young project.
Feel free to make comments and suggestions on what is currently here.

# Copyright and Licensing #

Copyright (c) 2014 Mike Bonds, released under the MIT license.
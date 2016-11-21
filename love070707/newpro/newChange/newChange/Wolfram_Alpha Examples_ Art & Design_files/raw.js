// @author Daniel Sherman
(function(){
	function WolframAnalytics(q, t, d, v){

		// The time WolframAnalytics was spun up, also the time associated 
		// with the initial queued requests
		var time = t;

		// the WolframAnalytics domain
		var domain = d;

		// the WolframAnalytics version
		var version = v;	

		// should calls be queued
		var queued = false;

		// should calls be sent as a single batch
		var batched = false;

		// holds queued events that need pushed to the server
		var xhrQueue = [];

		// holds all the listener conf stacks for all listener types
		var listnerStacks = {};

		// initialize the object
		construct(q);	

		// configures the listener and parses the contents of the initial queue
		function construct(queue){
			// process the initial queue
			var queueLength = queue.length;
			for (var i = 0; i < queueLength; i++) {
				// add in the time and pass it to the parser
				var args = Array.prototype.slice.call(queue[i]);
				args.unshift(time);
				commandParser(args);
			}

			// set up the listener
			queue.push = queueListener;
		}

		// makes a clean copy of whatever object was passed in
		function cleanCopy(input){
			try{
				return JSON.parse(JSON.stringify(input));
			}catch(e){
				// do nothing on failure
			}
		}

		// listens on the global array queue created by the users
		function queueListener(){
			var args = Array.prototype.slice.call(arguments[0]);
			args.unshift(1 * new Date());
			commandParser(args);
		}

		// parses commands and figures out what to do with them
		function commandParser(){
			var args = Array.prototype.slice.call(arguments);
			args = args[0];

			// make sure the minimum number of arguments got passed
			if(args.length < 2){
				return;
			}

			var time = args.shift();
			var command = args.shift();

			switch(command) {
			    case 'queue':
			    	setQueued(args);
			    	break;
			    case 'batch':
			        setBatched(args)
			        break;
			    case 'log':
			    	args.unshift(time);
			        logger(args);
			        break;
			    case 'flush':
			        flushQueue();
			        break;
			    case 'addListener':
			        addListener(args);
			        break;
			    case 'removeListener':
			    	removeListener(args);
			    	break;
			    default:
			        break;
			}
		}

		// sets the queued flag
		function setQueued(){
			if(arguments.length == 1){
				var newValue = arguments[0][0];
				if (typeof newValue == 'boolean'){
					queued = newValue;

					if(!queued){
						// set queuing to false so flush the queue
						flushQueue();
					}
				}
			}
		}

		// sets the batched flag
		function setBatched(){
			if(arguments.length == 1){
				var newValue = arguments[0][0];
				if (typeof newValue == 'boolean'){
					batched = newValue;					
				}
			}
		}

		// handles the log commands
		function logger(){
			var args = Array.prototype.slice.call(arguments);
			args = args[0];

			// make sure the minimum number of arguments got passed
			if(args.length < 2){
				return;
			}

			var time = args.shift();
			var type = args.shift();

			switch(type) {
			    case 'event':
			    	// handles custom events
			    	args.unshift(time);
			        customEventParser(args);
			    	break;
			    case 'usermeta':
			    	// handles logging user meta data
			        logUserMeta(time);
			    	break;
			    case 'pageload':
			    	// handles logging a page load
			    	args.unshift(time);
			        logPageLoad(args);
			    	break;
			    case 'wlogin':
			    	// handles a wolfram login
			    	args.unshift(time);
			        logWolframLogin(args);
			    	break;
			    default:
			        break;
			}
		}

		// flushes the events queue to the server
		function flushQueue(){
			var toFlush = xhrQueue.slice();
			xhrQueue.length = 0;

			var queueLength = toFlush.length;
			for (var i = 0; i < queueLength; i++) {
				requester(toFlush[i])
			}
		}

		// parses the custom log event commands
		function customEventParser(){
			var args = Array.prototype.slice.call(arguments);
			args = args[0];

			// make sure the minimum number of arguments got passed
			if(args.length < 2){
				return;
			}

			var time = args.shift();
			var event = args.shift();

			if(args.length == 1){
				var data = cleanCopy(args.shift());
			}else{
				var data = {};
			}

			// make sure event names are strings, and not in the protected namespace
			if(typeof event != 'string' || event.indexOf("wal_") == 0){
				return;
			}

			var obj = {
				t: time,
				e: event,
				d: data
			};

			queuer(obj);
		}

		// creates a user meta event 
		function logUserMeta(time){
			var data = {};
			data.color = window.screen.colorDepth;
			data.screenW = window.screen.availWidth;
			data.screenH = window.screen.availHeight;
			data.cookies = window.navigator.cookieEnabled;
			data.lang = window.navigator.language;
			data.concurrency = window.navigator.hardwareConcurrency;

			var obj = {
				t: time,
				e: 'wal_usermeta',
				d: data
			};

			queuer(obj);
		}

		// handles logging a pageload event
		function logPageLoad(){
			var args = Array.prototype.slice.call(arguments);
			args = args[0];

			// make sure the minimum number of arguments got passed
			if(args.length < 1){
				return;
			}

			var time = args.shift();

			if(args.length >= 1){
				var href = args.shift();

				// make sure a string was passed
				if(typeof href != 'string' && href !== null){
					return;
				}

				if(href == null){
					href = window.location.href;
				}

			}else{
				var href = window.location.href;
			}

			if(args.length >= 1){
				var title = args.shift();

				// make sure a string was passed
				if(typeof title != 'string' && title !== null){
					return;
				}

				if(title == null){
					var title = document.title;
				}
			}else{
				var title = document.title;
			}

			if(args.length >= 1){
				var refer = args.shift();

				// make sure a string was passed
				if(typeof refer != 'string' && refer !== null){
					return;
				}

				if(refer == null){
					var refer = document.referrer;
				}
			}else{
				var refer = document.referrer;
			}

			var obj = {
				t: time,
				e: 'wal_pageload',
				d: {href : href, title : title, refer : refer}
			};
			queuer(obj);
		}



		// handles logging a wolfram login
		function logWolframLogin(){
			var args = Array.prototype.slice.call(arguments);
			args = args[0];

			// make sure the minimum number of arguments got passed
			if(args.length < 2){
				return;
			}

			var time = args.shift();
			var id = args.shift();

			var pat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			var match = pat.test(id);

			//only log if the id is the proper format
			if(match){
				var obj = {
					t: time,
					e: 'wal_wlogin',
					d: {id : id}
				};
				queuer(obj);
			}
		}

		// handles queuing up requests to the server
		function queuer(obj){
			if(queued){
				// queuing is enabled so handle it
				if(batched){
					// batching is on, so handle it
					var i = xhrQueue.length - 1;

					if(i >= 0){
						var e = xhrQueue[i].e;
						if(e == 'wal_batch'){
							// add the the existing batch object
							xhrQueue[i].d.push(obj);
						}else{
							// create a new batch object
							xhrQueue.push({t: obj.t, e: 'wal_batch', d: [obj]});
						}
					}else{
						// the queue is empty
						xhrQueue.push({t: obj.t, e: 'wal_batch', d: [obj]});
					}
				}else{
					// no batches, so just push to the queue
					xhrQueue.push(obj);
				}
			}else{
				// no queuing so send the request immediately
				requester(obj);
			}
		}

		// makes the ajax request to the server
		function requester(obj){
			try{
				var url = domain + '/wal.gif?';
				url += 'v=' + encodeURIComponent(version);
				url += '&t=' + encodeURIComponent(obj.t);
				url += '&e=' + encodeURIComponent(obj.e);
				url += '&d=' + encodeURIComponent(JSON.stringify(obj.d));

				var eventImg = new Image();
				eventImg.src = url;
			}catch(e){
				// do nothing on failure
			}
		}

		// handles adding an event listener
		function addListener(){
			var args = Array.prototype.slice.call(arguments);
			args = args[0];

			// make sure the minimum number of arguments got passed
			if(args.length !== 2){
				return;
			}

			var type = args.shift();
			var conf = args.shift();

			conf = listenerConfParser(conf);
			if(conf === false){
				// the conf wasn't valid so ignore it
				return;
			}

			// if the event type doesn't exist add it
			if(!listnerStacks.hasOwnProperty(type)){
				listnerStacks[type] = {stack:[],listening: false};
			}

			//loop and see if the conf can bee added to the stack
			var addconf = true;
			var testKey = conf.key;
			var len = listnerStacks[type].stack.length;
			for (var i = 0; i < len; i++){
				if(listnerStacks[type].stack[i].key === testKey){
					// conf exists already
					addconf = false;
					break;
				}
			}
			if(addconf){
				listnerStacks[type].stack.push(conf);
			}

			// set up the listening function if one or more confs exist
			if(listnerStacks[type].stack.length > 0 && listnerStacks[type].listening === false){
				listnerStacks[type].listening = true;

			    if (window.addEventListener){
			        window.addEventListener(type, theListener, false);
			    }
			}
		}

		// handles removing an event listener
		function removeListener(){
			var args = Array.prototype.slice.call(arguments);
			args = args[0];

			// make sure the minimum number of arguments got passed
			if(args.length !== 2){
				return;
			}

			var type = args.shift();
			var key = args.shift();

			// if the event type exists handle removing the conf with the given key
			if(listnerStacks.hasOwnProperty(type)){

				//loop through all the confs and see if the key matches
		    	var len = listnerStacks[type].stack.length;
				for (var i = 0; i < len; i++){
					var conf = listnerStacks[type].stack[i];

					if(conf.key === key){
						listnerStacks[type].stack.splice(i,1);

						if(listnerStacks[type].stack.length === 0){
							// no more listers
							listnerStacks[type].listening = false;

						    if (window.removeEventListener){
						        window.removeEventListener(type, theListener, false);
						    }
						}

						return;
					}
				}
			}
		}

		// listens for events to process
		function theListener(e){
			var type = e.type;
			var el = e.target;

			// if the event type doesn't exist skip
			if(!listnerStacks.hasOwnProperty(type)){
				return;
			}

			//loop through all the confs and see if this element matches any of them
		    var len = listnerStacks[type].stack.length;
			for (var i = 0; i < len; i++){

				var conf = listnerStacks[type].stack[i];

				// if we get a match process the element and return
				if(elementMatchesListenerConf(el, conf)){

					var callbacks = conf.call;
					
					// run the before callback before processing
					if(callbacks.before !== null){
						runLisenerCallback(callbacks.before, el, cleanCopy(conf),type);
					}

					var data = {t:type,k:conf.key,c:false,href:window.location.href,d:{}};

					// run the parse callback or the default parser
					if(callbacks.parser !== null){
						data.c = true;
						data.d = cleanCopy(runLisenerCallback(callbacks.parser, el, cleanCopy(conf),type));
						if(typeof data.d !== 'object' || data.d instanceof Array){
							// didn't get an object back form the callback so just return and don't log
							return;
						}
					}else{
						data.d = cleanCopy(standardListenerElementProcesser(el,conf));
					}

					// run the after callback before processing
					if(callbacks.after !== null){
						runLisenerCallback(callbacks.after, el, cleanCopy(conf),type);
					}

					var obj = {
						t: 1 * new Date(),
						e: 'wal_listener',
						d: data
					};

					queuer(obj);
					return;
				}
			}
		}

		// runs a callback associated with a listener conf
		function runLisenerCallback(fName, el, conf, type){
			var context = window;
			var args = [el, conf, type];
			var namespaces = fName.split(".");
			var func = namespaces.pop();

			for(var i = 0; i < namespaces.length; i++) {
    			context = context[namespaces[i]];
  			}

  			return context[func].apply(context, args);
		}

		function standardListenerElementProcesser(el,conf){
			var data ={prop:{},attr:{}};

			var propLen = conf.prop.length;
			for (var i = 0; i < propLen; i++){
				data.prop[conf.prop[i]] = el[conf.prop[i]];
			}

			var attrLen = conf.attr.length;
			for (var i = 0; i < attrLen; i++){
				data.attr[conf.attr[i]] = el.getAttribute(conf.attr[i]);
			}

			return data;
		}

		// checks to see if an element matches a listener conf 
		//
		// return boolean
		function elementMatchesListenerConf(el, conf){
			// figure out what type of element it is
			var els = el.tagName;
			if(typeof els === "undefined"){
				if(el === window){
					els = 'window';
				}else if(el === document){
					els = 'document';
				}else{
					els='';
				}
			}
			els = [els.toLowerCase()];

			// get the id if the element has one
			var ids = el.id;
			if(typeof ids === "undefined"){
				ids = [];
			}else{
				ids = [ids.toLowerCase()];
			}

			var classes = el.className;
			if(typeof classes === "undefined"){
				classes = [];
			}else{
				classes = turnStringToArray(classes);
			}

			if(conf.is.el.length >0){
				if(els.length >0){
					// loop and check for match return false if no match
					if(!arrayInArray(els, conf.is.el)){
						return false;
					}
				}else{
					// requires an el match and the element doesn't have one
					return false;
				}
			}

			if(conf.is.id.length >0){
				if(ids.length >0){
					// loop and check for match return false if no match
					if(!arrayInArray(ids, conf.is.id)){
						return false;
					}
				}else{
					// requires an id match and the element doesn't have one
					return false;
				}
			}

			if(conf.is.cl.length >0){
				if(classes.length >0){
					// loop and check for match return false if no match
					if(!arrayInArray(conf.is.cl, classes)){
						return false;
					}
				}else{
					// requires a class match and the element doesn't have one
					return false;
				}
			}

			if(conf.not.el.length >0 && els.length >0){
				// return false if els is in conf.not.el
				if(arrayInArray(els, conf.not.el)){
					return false;
				}
			}

			if(conf.not.id.length >0 && ids.length >0){
				// return false if ids is in conf.not.id
				if(arrayInArray(ids, conf.not.id)){
					return false;
				}
			}

			if(conf.not.cl.length >0 && classes.length >0){
				// return false if classes is in conf.not.class
				if(arrayInArray(conf.not.cl, classes)){
					return false;
				}
			}

			return true;
		} 

		// checks to see if any element of array a is in array b. if the element
		// from a is an array, then all its contents must be in b
		function arrayInArray(a, b){
			var len = a.length;

			for (var i = 0; i < len; i++){
				if(a[i] instanceof Array){
					// all the elements of a[i] must be in b
					var aiLen = a[i].length;
					var allmatch = true;

					for (var j = 0; j < aiLen; j++){
						if(b.indexOf(a[i][j]) === -1){
							// didn't match
							allmatch = false;
							break;
						}
					}

					if(allmatch){
						// got a match
						return true;
					}
				}else{
					if(b.indexOf(a[i]) !== -1){
						// got a match so return
						return true;
					}
				}
			}

            // no match so return
			return false;
		}

        // takes a string it and explodes it into an array by spaces as well as trims spaces
        // empty stings results with an empty array. all strings are lowercased as well
        //
        // returns an array
		function turnStringToArray(input){
			input = input.trim().split(' ');
			var len = input.length;

			for(i = 0; i < len; i++ ){
				input[i] && input.push(input[i].toLowerCase()); 
			}
		    input.splice(0 , len);
		    return input;
		}

		function lowecaseArrayOfStrings(input){
			clean = cleanCopy(input);

			for(var i=0; i < clean.length; i++){

				if(input[i] instanceof Array){
					for(var j=0; j < clean[i].length; j++){
						clean[i][j] = clean[i][j].toLowerCase();
					}
				}else{
					clean[i] = clean[i].toLowerCase();
				}
			}

			return clean;
		}

		//checks to see if an array contains only strings
		//
		// returns boolean
		function isArrayOfStrings(input){
			// make sure an array was passed
			if(!(input instanceof Array)){
				return false;
			}

			//make sure the array only contains strings, and that they aren't empty
			for(var i=0; i < input.length; i++){
				if(typeof input[i] !== 'string'){
		   			return false;
				}

		   		if(input[i] === ""){
		   			return false;
				}
			}

			// make sure an empty array wasn't passed
			if(input.length < 1){
		   		return false;
			}

			//passed all the tests
			return true;
		}

		// checks to see if an array contains only strings or arrays of strings
		// nesting can only be one level deep
		//
		// returns boolean
		function isNestedArrayOfStrings(input){
			// make sure an array was passed
			if(!(input instanceof Array)){
				return false;
			}

			//make sure the array only contains strings, and that they aren't empty
			for(var i=0; i < input.length; i++){

				if(input[i] instanceof Array){
					if(!isArrayOfStrings(input[i])){
						// got an array but it doesn't contain only strings
						return false;
					}
				}else if(typeof input[i] === 'string'){
			   		if(input[i] === ""){
			   			// got a blank string
			   			return false;
					}
				}else{
					// not a valid type
					return false;
				}
			}

			// make sure an empty array wasn't passed
			if(input.length < 1){
		   		return false;
			}

			//passed all the tests
			return true;
		}

		// parses and input, to see if contains a properly formated el, id, and class element
		//
		// returns a new object on success, false otherwise
		function elIdClParser(input){
			var out = {
				el:[],
				id:[],
				cl:[],
			};

			// skip if input isn't an object
			if(typeof input !== 'object' || input instanceof Array){
				return false;
			}

			// skip if input doesn't contain an 'el', 'id', or 'cl' property
			if(!input.hasOwnProperty('el') && !input.hasOwnProperty('id') && !input.hasOwnProperty('cl')){
				return false;
			}

			// skip if input contains a 'el' property that isn't an array, or the
			// array is empty, or the array contains anything other than strings			
			if(input.hasOwnProperty('el')){
				if(!isArrayOfStrings(input.el)){
					return false;
				}

				//passed the test so update the output
				out.el = lowecaseArrayOfStrings(input.el);
			}

			// skip if input contains a 'id' property that isn't an array, or the
			// array is empty, or the array contains anything other than strings			
			if(input.hasOwnProperty('id')){
				if(!isArrayOfStrings(input.id)){
					return false;
				}

				//passed the test so update the output
				out.id = lowecaseArrayOfStrings(input.id);
			}

			// skip if input contains a 'cl' property that isn't an array or the 
			// array is empty or the array contains anything other than strings or 
			// arrays of strings			
			if(input.hasOwnProperty('cl')){
				if(!isNestedArrayOfStrings(input.cl)){
					return false;
				}

				//passed the test so update the standard conf
				out.cl = lowecaseArrayOfStrings(input.cl);
			}

			return out;
		}

        // parses a listener conf callback object to see if it contains valid callbacks
        //
        // returns a copy of the input if valid false if otherwise
		function listenerConfCallbackParser(input){
			var out = {before:null,parser:null,after:null};

			if(typeof input === "undefined"){
				return out;
			}

			// skip if input isn't an object
			if(typeof input !== 'object' || input instanceof Array){
				return false;
			}

			for (var key in out) {
				// skip if a key exists but it's not properly formated
				if(input.hasOwnProperty(key)){
					if (typeof input[key] !== 'string' || input[key] === ''){
						return false;
					}else{
						out[key] = input[key];
					}
				}
			}

			return out;
		}

		// parses and input, to see if it is a valid listner conf
		//
		// returns a new clean copy of the conf on success, false otherwise
		function listenerConfParser(input){
			var standard = {key:'',is:{el:[],id:[],cl:[],},not:{el:[],id:[],cl:[],},prop:[],attr:[],call:{}};

			// skip if the conf isn't an object with
			if(typeof input !== 'object' ){
				return false;
			}

			// skip if a key doesn't exist
			if(!input.hasOwnProperty('key') || typeof input.key !== 'string'){
				return false;
			}else{
				standard.key = input.key;
			}

			// skip if the conf  doesn't have an 'is' property
			if(!input.hasOwnProperty('is')){
				return false;
			}

			// validate and set the is property          
			var isTemp = elIdClParser(input.is);
			if(isTemp === false){
				return false;
			}
			standard.is = isTemp;

			// if a 'not' property exists validate and set it
			if(input.hasOwnProperty('not')){
				var notTemp = elIdClParser(input.not);
				if(notTemp === false){
					return false;
				}

				standard.not = notTemp;
			}

			//validate and set the 'prop' property
			if(input.hasOwnProperty('prop')){
				if(!isArrayOfStrings(input.prop)){
					return false;
				}

				standard.prop = input.prop;
			}			

			//validate and set the 'attr' property
			if(input.hasOwnProperty('attr')){
				if(!isArrayOfStrings(input.attr)){
					return false;
				}

				standard.attr = input.attr;
			}	

			//validate and set the 'call' property
			var callTemp = listenerConfCallbackParser(input.call);
			if(callTemp === false){
				return false;
			}
			standard.call = callTemp;

			return cleanCopy(standard);
		}

	};

	var wal = window[window['WolframAnalyticsObject']];
	var walo = new WolframAnalytics(wal.q, wal.t, wal.d, wal.v);
})(window);
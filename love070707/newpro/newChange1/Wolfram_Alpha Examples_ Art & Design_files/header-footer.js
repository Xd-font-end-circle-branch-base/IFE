'use strict';

/* Ghetto namespacing/Java-esque packaging
 * 
 * Consider webpack/Require.js
 */
 (function(){
    var txt = 75;//设置留下的字数
     var o = document.getElementsByClassName("cla");//id   html 中设置
     //alert(o.length);
     for (var i = o.length - 1; i >= 0; i--) {
             var s = o[i].innerHTML;
            var p = document.createElement("span");
             var n = document.createElement("font");
             p.innerHTML = s.substring(0,txt);
             n.innerHTML = s.length > txt ? "..." : "";
             o[i].innerHTML = "";
            o[i].appendChild(p);
            o[i].appendChild(n);
     };

})();
(function() {
    alphaProvide('com.wolframalpha.provide', alphaProvide);
    alphaProvide('com.wolframalpha.import', alphaImport);
    alphaProvide('com.wolframalpha.module', alphaModule);
    
    function alphaProvide(packageName, value) {
        var packageSplit = packageName.split('.');
        var currentPackage = window;
        for(var i = 0; i < packageSplit.length - 1; i++) {
            currentPackage[packageSplit[i]] = currentPackage[packageSplit[i]] || {};
            currentPackage = currentPackage[packageSplit[i]];
        }
        if(typeof currentPackage[packageSplit[packageSplit.length - 1]] !== 'undefined') {
            throw new Error(value + ' has already been provided!');
        }
        currentPackage[packageSplit[packageSplit.length - 1]] = value;
    }
    function alphaImport(packageName) {
        var packageSplit = packageName.split('.');
        var currentPackage = window;
        for(var i = 0; i < packageSplit.length - 1; i++) {
            currentPackage = currentPackage[packageSplit[i]];
            if(typeof currentPackage !== 'object') {
                return undefined;
            }
        }
        return currentPackage[packageSplit[packageSplit.length - 1]];
    }
    function alphaModule() {
        if(arguments.length === 1) {
            var closure = arguments[0];
            if(typeof closure !== 'function') {
                throw new Error('When using one argument, "module" requires a closure that accepts the provide and import functions as arguments.');
            }
            return closure(alphaProvide, alphaImport);
        }
        else if(arguments.length === 2) {
            var dependencies = arguments[0];
            var closure = arguments[1];
            if(!dependencies instanceof Array || typeof closure !== 'function') {
                throw new Error('When using two arguments, "module" requires an Array of dependencies and a closure that accepts the dependencies as arguments.');
            }
            var unfound = [];
            var imported = dependencies.map(function(val) {
                var thisImport = alphaImport(val);
                if(typeof thisImport === 'undefined') {
                    unfound.push(val);
                }
                return thisImport;
            })
            if(unfound.length === 0) {
                return closure.apply(this, imported);
            }
            else {
                console.error("Alpha Module could not find the following dependencies: " + unfound);
            }
        }
    }
})();

/* This closure exports the WAUserService. It contains many jQuery -> Angular shims that might
 * be worth exporting as well.
 */
(function() {
    /* An inexact shim from jQuery AJAX methods to Angular $http
     * Be wary of differences.
     */
    var jQueryToAngularHttp = (function(
    ) { 
        // Note that the Angular config object is not necessarily the same as the $.ajax config object
        var angularHttp = function(config) {
            return $.ajax(config);
        };
        
        angularHttp.get = function(url, config) {
            var ajaxConfig = config || {};
            ajaxConfig.url = url;
            ajaxConfig.method = 'GET';

            return $.ajax(ajaxConfig);
        }
        
        angularHttp.post = function(url, data, config) {
            var ajaxConfig = config || {};
            ajaxConfig.url = url;
            ajaxConfig.data = data;
            ajaxConfig.method = 'POST';

            return $.ajax(ajaxConfig);
        }
        
        return angularHttp;
    })();
    
    /* An inexact shim from jQuery Deferred to Angular $q.
     * Not all methods are implemented. Be wary of differences.
     */
    var jQueryToAngularDefer = (function(
    ) {
        var angularQ = function(asyncCallback) {
            var deferred = $.Deferred();
            
            asyncCallback(deferred.resolve, deferred.reject);
            
            return deferred.promise();
        }
        
        angularQ.resolve = function(resolved) {
            var promise = $.Deferred();
            promise.resolve(resolved);
            
            return promise.promise();
        };
        angularQ.reject = function(reason) {
            var rejected = $.Deferred();
            rejected.reject(reason);
            
            return rejected.promise();
        }
        
        return angularQ;
        
    })();
    
    /* WAUserServiceProvider
     * Creates a WAUserService object with the respective dependencies
     */
    var WAUserServiceProvider = function(
        $http,
        $q,
        $,
        jQuery
    ) {
        var TOKEN_STORAGE_NAME = 'wa.auth';
        
        var getURLParam = function(key) {
            return decodeURI(location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURI(key).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'));
        };
        
        // JQuery 2 promises are NOT Promises/A+ compliant like all the other libraries (such as Angular $q)
        // Therefore, resolve and reject functions are passed along instead of called on a promise
        // This should work when Promises are switched over to the ES6 version, but is not as elegant as can be
        var fetchUserData = function(authTriplet, resolve, reject) {
            if(typeof authTriplet === 'undefined' || authTriplet === null) {
                return resolve(null);
            }
            
            return $http.get('/users/' + authTriplet["wa_pro_u"] + '/account/info', {
                headers: authTriplet
            }).then(function doGetStatus(data) {
                // We make multiple AJAX calls, because there is currently no good way to get just the info and status
                // so instead of making expensive database calls for information we don't need, we make two HTTP requests
                return $http.get('/users/' + authTriplet["wa_pro_u"] + '/account/status?v=2', {
                    headers: authTriplet
                }).then(function getUserProLevel(statusData) {
                    resolve({
                        info : data,
                        status : statusData,
                        triplet : authTriplet
                    });
                });
            }, function(reason) {
                if(reason instanceof Error) {
                    console.error(reason);
                }
                
                console.warn('Was not able to determine if user was signed in by checking /users/{uuid}/account/info');
                localStorage.removeItem(TOKEN_STORAGE_NAME);
                
                return resolve(null);
            });
        };
        
        var fetchSignInUrl = function() {
        	$http.get('/auth/sign-in/url/').then(function(data) {
                return window.location = data.url;
            });
        };
        
        var handleLogin = function(resolve, reject) {
            if (location.search.indexOf('oauth_token') > 0) {
                var promise = $http.get('/auth/sessions/' + getURLParam('session_id') + '?oauth_verifier=' + getURLParam('oauth_verifier') + '&remember_me=' + getURLParam('remember_me'))
                    .then(function(data) {
                        if(data.status && data.status !== 200) {
                            return null;
                        }
                        var userTriplet = {};
                        userTriplet['wa_pro_s'] = data['wa_pro_s'];
                        userTriplet['wa_pro_t'] = data['wa_pro_t'];
                        userTriplet['wa_pro_u'] = data['wa_pro_u'];
                        localStorage.setItem(TOKEN_STORAGE_NAME, JSON.stringify(userTriplet));
                        var authTriplet = JSON.parse(localStorage.getItem(TOKEN_STORAGE_NAME));
                        
                        return fetchUserData(authTriplet, resolve, reject);
                    }).always(function() {
                        // TODO: Think of another place this specific logic could go
                        if (typeof wpgUrlRedirect === 'function') {
                            wpgUrlRedirect();
                        }
                        else {
                            var removeAuthQueryString = function() {
                                var queryString = {};
                                var hasQueryParam = false;
                                location.search.replace(
                                    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                                    function($0, $1, $2, $3) {
                                        if($1 != 'oauth_token' && $1 != 'session_id' && $1 != 'oauth_verifier' && $1 != 'remember_me' && $1 != 'account_created') {
                                            queryString[$1] = $3;
                                            hasQueryParam = true;
                                        }
                                    }
                                );
                                var newUrl = location.origin + location.pathname;
                                if(hasQueryParam) {
                                    newUrl += '?' + Object.keys(queryString).map(function(key) { return key + '=' + queryString[key]; }).join('&');
                                }
                                return newUrl;
                            };
                            
                            return history.pushState(null, null, removeAuthQueryString());
                        }
                    });
            } else if(localStorage.getItem(TOKEN_STORAGE_NAME) !== null) {
                var authTriplet = JSON.parse(localStorage.getItem(TOKEN_STORAGE_NAME));
            
                fetchUserData(authTriplet, resolve, reject);
            } else if(location.search.indexOf('session_id') > 0) {
            	fetchSignInUrl();
            } else {
                resolve(null);
            }
        }
        
        var userPromise = $q(handleLogin);
        
        return {
            getUser : function() {
                return userPromise;
            },
            doSignIn : function() {
                return fetchSignInUrl();
            },
            doSignOut : function() {
                var authTriplet = JSON.parse(localStorage.getItem(TOKEN_STORAGE_NAME));
                
                if(authTriplet === null) {
                    return $q.resolve(true);
                }

                localStorage.removeItem(TOKEN_STORAGE_NAME);    // Optimistic
                
                return $http({
                    url: '/auth/sessions/' + authTriplet["wa-pro-s"],
                    headers: authTriplet,
                    method: 'DELETE'
                })
            }
        };
    };
    
    var WAGlobalHeaderView = (function($, jQuery) {
        function HeaderObj() {
            var vm = this;
            
            var headerElem = document.getElementById('wa-common-header');
            var hamburgerMenuElem = headerElem.querySelector('.icon-hamburger-menu');
            var appsElem = headerElem.querySelector('.icon-apps');
            var proElem = headerElem.querySelector('.header-pro-link');
            var userElem = headerElem.querySelector('.oauth');
            var userMenuButtonElem = userElem.querySelector('.signed-in');
            var signInButtonElem = userElem.querySelector('.sign-in');
            var signOutButtonElem = userElem.querySelector('.sign-out');
            var overlayElem = document.getElementById('wa-top-overlay');
            
            var showProSubmenu = document.body.classList.contains('show-pro-submenu');
            
            // Store certain elements in the object to use later
            vm.emailElem = userMenuButtonElem;
            vm.userElem = userElem;
            
            var isDesktopMedia = window.matchMedia("screen and (min-width: 600px)");
            
            document.addEventListener('click', function(event) {
                toggleOrHide(appsElem, appsElem, event);
                toggleOrHide(userMenuButtonElem, userElem, event);
                toggleOrHide(proElem, proElem, event);
                if(isDesktopMedia.matches) {
                    handleDesktopMenu(event);
                }
                else {
                    handlePhoneMenu(event);
                }
                handleAuthButtons(event);
            });
            
            function handleDesktopMenu(event) {
            	toggleOrHide(hamburgerMenuElem, headerElem, event);
                if(event.target === overlayElem) {
                    headerElem.classList.remove('shown');
                }
            }
            
            function handlePhoneMenu(event) {
                if(event.target === proElem && showProSubmenu) {
                    event.preventDefault();
                } else if(event.target === hamburgerMenuElem && !headerElem.classList.contains('shown')) {
                    headerElem.classList.add('shown');
                } else if(event.target === hamburgerMenuElem || event.target === overlayElem) {
                    headerElem.classList.remove('shown');
                    appsElem.classList.remove('shown');
                    proElem.classList.remove('shown');
                    userElem.classList.remove('shown');
                }
            }
            
            function toggleOrHide(elem, elemToToggle, event) {
                if(event.target === elem) {
                	if(event.target !== proElem || (showProSubmenu && !isDesktopMedia.matches)) {
                    	elemToToggle.classList.toggle('shown');
                	}
                } else {
                    elemToToggle.classList.remove('shown');
                }
            }
            
            function handleAuthButtons(event) {
                if(event.target === signInButtonElem) {
                    vm.onSignInCallback();
                }
                else if(event.target === signOutButtonElem) {
                    vm.onSignOutCallback();
                }
            }
        }
        
        HeaderObj.prototype = {
            setSignedIn : function(isSignedIn) {
                if(isSignedIn) {
                    this.userElem.classList.add('signed-in');
                }
                else {
                    this.userElem.classList.remove('signed-in');
                    this.userElem.classList.add('not-signed-in');
                }
            },
            setEmail : function(newEmail) {
                this.emailElem.innerHTML = newEmail;
            },
            onSignIn : function(callback) {
                this.onSignInCallback = callback;
                return this;
            },
            onSignOut : function(callback) {
                this.onSignOutCallback = callback;
                return this;
            }
        };
        
        return HeaderObj;
    })();
    
    /* Wolfram Alpha User Service
     * Handle all calls to the user service for authentication and pulling of user data
     * 
     * Note that jQuery is kill on purpose
     */
    var WAUserService = WAUserServiceProvider(jQueryToAngularHttp, jQueryToAngularDefer);
    
    /* getProString
     * 
     * Given a user object, return a string representing the pro level suitable to sending
     * to tracking
     */
    function getProString(status) {
        var proLevel = 'notsignedin';
        
        if(status.proLevel === 1) {
            proLevel = 'free';
        }
        else if(status.proLevel === 2) {
            proLevel = 'pro';
        }
        else if(status.proLevel === 3) {
            proLevel = 'premium';
        }
        
        if(status.proForEducators === true) {
            proLevel += '-edu';
        }
        else if(status.proForStudents === true) {
            proLevel += '-stud';
        }
        
        return proLevel;
    };
    
    com.wolframalpha.provide('com.wolframalpha.service.WAUserService', WAUserService);
    com.wolframalpha.provide('com.wolframalpha.view.WAGlobalHeaderView', WAGlobalHeaderView);
    com.wolframalpha.provide('com.wolframalpha.tracking.getProString', getProString);
})();

$(function() {
    $('#header-input-form').on('submit', function(e) {
        e.preventDefault()
        var i = $('#wa-top-input').val()
        if (i === '') {
            window.location = '/';
        } else {
        	window.location = '/input/?i=' + encodeURIComponent(i) + '&wal=header';
        }
    });
    
    // Stub 'console' to prevent errors in IE9,
    if (window.console == null) {
        window.console = {
            log: $.noop,
            warn: $.noop,
            error: $.noop
        };
    }

    com.wolframalpha.module([
        'com.wolframalpha.service.WAUserService',
        'com.wolframalpha.view.WAGlobalHeaderView'
    ], function(
        WAUserService,
        WAGlobalHeaderView
    ) {
        var headerView = new WAGlobalHeaderView();
        
        var $oauthContainer = $('#wa-common-header .oauth');
        
        WAUserService.getUser().then(function handleLoggedInOut(user) {
            headerView.setSignedIn(user !== null);
            if(user !== null) {
                headerView.setEmail(user.info.email);
                
                // Support legacy calls
                if(typeof doWhenSignedin !== 'undefined') {
                    doWhenSignedin(user.info); // Define this function in your js file if you want to do something when signed in
                }
            }
        }).always(function() {
        	$('#wa-common-header').removeClass('authenticating');
        });
        
        headerView.onSignIn(function() {
            WAUserService.doSignIn();
            
            // Support legacy calls
            if (typeof doOnSignIn !== 'undefined') {
                doOnSignIn();
            }
        }).onSignOut(function() {
            //Suport legacy calls
            if (typeof doOnSignOut !== 'undefined') {
                doOnSignOut();
            }
            return WAUserService.doSignOut().done(function(data) {
                return window.location = data.url + '?url=' + encodeURIComponent(window.location);
            })
        });
    });
    
    // Tracking code
    if(typeof wal !== 'undefined') {
        com.wolframalpha.module([
            'wal',
            'com.wolframalpha.service.WAUserService',
            'com.wolframalpha.tracking.getProString'
        ], function(
            wal,
            WAUserService,
            getProString
        ) {
            WAUserService.getUser().then(function(user) {
                var proLevel = 'notsignedin';
                if(user !== null) {
                    wal('log', 'wlogin', user.triplet["wa_pro_u"]);
                    proLevel = getProString(user.status);   
                }
                
                // Register the listeners in the global context, so WAL will have access to them
                if(typeof window['__walTrackingListeners'] === 'undefined') {
                    window['__walTrackingListeners'] = {};
                }
                window['__walTrackingListeners'].headerFooter = {
                    sendProLevel : function(el, conf, type) {
                        return {
                            value : el.innerHTML,
                            proLevel : proLevel
                        };
                    },
                    sendConnectClicked : function() {
                        return {
                            value : 'Connect',
                            proLevel : proLevel
                        };
                    }
                };
                
                var buildSendProLevelConf = function(key, className) {
                    return {
                        key : key,
                        is : {
                            cl : [className],
                        },
                        call : {
                            parser : '__walTrackingListeners.headerFooter.sendProLevel'
                        }
                    }
                };
                
                wal('addListener', 'click', buildSendProLevelConf('wa.static.common.headerLogoClick', 'tracking-header-logo'));
                wal('addListener', 'click', buildSendProLevelConf('wa.static.common.headerLinkClick', 'tracking-header-link'));
                wal('addListener', 'click', buildSendProLevelConf('wa.static.common.headerProDropdownClick', 'tracking-pro-link'))
                wal('addListener', 'click', buildSendProLevelConf('wa.static.common.headerAppDropdownClick', 'tracking-apps-link'));
                wal('addListener', 'click', buildSendProLevelConf('wa.static.common.headerUserMenuClick', 'tracking-user-menu-link'));
                wal('addListener', 'click', buildSendProLevelConf('wa.static.common.footerLinkClick', 'tracking-footer-link'));
                
                // Special case for "Connect" link, since it has child HTML elements, so we cannot just send the innerHTML
                wal('addListener', 'click', {
                    key : 'wa.static.common.footerLinkClick.connect',
                    is : {
                        cl : [ 'tracking-footer-link-connect' ],
                    },
                    call : {
                        parser : '__walTrackingListeners.headerFooter.sendConnectClicked'
                    }
                });
            });
        });
    }
});

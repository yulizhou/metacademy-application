/**
 * Main function, set to data-main with require.js
 */

// configure require.js
window.requirejs.config({
  baseUrl: window.STATIC_PATH + "javascript",
  paths: {
    jquery: ["//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min", window.STATIC_PATH + "javascript/lib/jquery-2.0.3.min"],
    "jquery.cookie": "lib/jquery.cookie",
    underscore: "lib/underscore-min",
    backbone: "lib/backbone-min",
    d3: "lib/d3-v3-min"
  },
  shim: {
    d3: {
      exports: "d3"
    },
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    "jquery.cookie"  : {
      deps: ["jquery"]
    }
  },
  waitSeconds: 15
});

/**
 * Handle uncaught require js errors -- this function is a last resort
 * TODO: anyway to reduce code repetition with other js files, considering the other js files won't be loaded?
 * perhaps define a global namespace of css classes and ids?
 */
if (window.PRODUCTION){
  window.requirejs.onError = function(err){
    var errorId = "error-message";
    if (document.getElementById(errorId) === null){
      var div = document.createElement("div");
      div.id = errorId;
      div.className = "app-error-wrapper"; // must also change in error-view.js
      div.textContent = "Sorry, it looks like we encountered a problem trying to " +
        "initialize the application. Refreshing your browser may solve the problem.";
      document.body.appendChild(div);
    }
    throw new Error(err.message);
  };
}

// agfk app & gen-utils
window.requirejs(["backbone", "agfk/utils/utils", "agfk/routers/router", "gen-utils", "jquery", "jquery.cookie"], function(Backbone, Utils, AppRouter, GenPageUtils, $){
  "use strict";

  // shim for CSRF token integration with backbone and django
  var oldSync = Backbone.sync;
  Backbone.sync = function(method, model, options){
    options.beforeSend = function(xhr){
      if (model.get("useCsrf")){
        xhr.setRequestHeader('X-CSRFToken', window.CSRF_TOKEN);
      }
    };
    return oldSync(method, model, options);
  };
  
  GenPageUtils.prep();
  
  // automatically resize window when viewport changes
  Utils.scaleWindowSize("header", "main");

  // start the AGFK app
  var appRouter = new AppRouter();
  Backbone.history.start();

  // play tutorial content if user is new
  if (!$.cookie("sawModesArrow") && !window.isAuth){
    window.setTimeout(function(){
      var $el_button_wrap = $("#explore-learn-button-wrapper"),
          el_pos = $el_button_wrap.offset(),
          el_height = $el_button_wrap.height(),
          $modes_tutorial = $("#tutorial-modes-content");
      $modes_tutorial.offset({
        top: el_pos.top + el_height + 2,
        left: el_pos.left
      });
      $modes_tutorial.fadeIn(500).delay(2000).fadeOut(500);
      $.cookie("sawModesArrow", true);
    }, 900);
}

});

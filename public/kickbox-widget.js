// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {
  var dataKey = "plugin_kickboxForm";
  
  var KickboxForm = function (element, options) {
    this.element = element;

    //let's add the Recipient Authentication Script if we need to
    if(typeof(Kickbox) != "object")
      $.getScript("https://kickbox.io/authenticate/1/release.js");
    
    this.messages = {
      fingerprintError: "Error getting Kickbox client fingerprint",
      unexpectedError: "Oh no! Expected error. Try again?"
    },
      
    this.options = {
      css: true, 
      showTracker: true,
      trackerContainer: ".kickbox-email-tracker",
      showMessages: true,
      buttonText: "Submit",
      placeholderText: "email@example.com",
      labelText: "Email Address",
      //, cssTheme: light, dark
    
      //event listener hooks
      
      //this is a bad name... should be called authentication or something
      authenticate: function(){ 
        alert("Please define an authenticate callback. See console for more info");
        console.log("authenticate callback must take 3 parameters: email, fingerprint, and app_code");
        console.log("The callback must return a jQuery POST object pointing to your server-side endpoint")
      },
      
      onAuthenticateSuccess: function(){
        
      },
      
      onFingerprintSuccess: function(){ 
      },
      
      onFingerprintError: function(){
        //this.showMessage("Error getting fingerprint.");
      },
      
      //
      //the next four callbacks will be passed through to the tracker
      //
      
      onProgress: function(response){
        // Authentication progress (message delivered, opened, etc)
      },
      onSuccess: function(){
        // Authentication was completed successfully!
        //this.showMessage("Success!");
      },
      onFailure: function(){
        // Authentication ended unsuccessfully (email undeliverable, expired, etc)
        //this.showMessage("Authentication Failed.");
      },
      onError: function(){
        // Something unexpected happened
        //this.showMessage(KickboxForm.messages.unexpectedError);
      }
    };    
    
    this.init(options);
  };

  KickboxForm.prototype = {
    // initialize options
    //TODO refactor and extract methods
    init: function (options) {
      //merge the passed-in options with the default options
      $.extend(this.options, options);

      var attributeOptions = this._getAttributeOptions();
      
      //merge the attribute options into everything else
      $.extend(this.options, attributeOptions);
      
      //add the default CSS (unless specified)
      this._injectCss();
      
      //get the Recipient Authentication App Code (provided by Kickbox) from the element
      this.app_code = this.element.attr("kickbox-app-code");
              
      //Get the HTML to inject into the DOM element
      var form = this._getFormElement();

      // vu todo: becareful about assigning "this" and using "this" everywhere else
      // you should probably assign var self = this; in the outer most scope of the function to be less
      // confusing when you reference it again. ref: https://gist.github.com/jashmenn/b306add36d3e6f0f6483
      
       var self = this;
      
      //TODO: Make this work?
      //if the user provided the callback name in the attribute, we need to get the function
      //if(typeof(this.options.onFingerprintSuccess) == "string")
        //this.options.onFingerprintSuccess = eval(this.options.onFingerprintSuccess);
      
      $(this.form).submit(function(event){
        //only prevent the default submit action if the form is valid
        //otherwise, let it proceed, so we get native HTML5 validation
        if(self.form[0].checkValidity()) {
          event.preventDefault();
        }

        //disable the button
        self.button.prop("disabled", true);
        
        self.email_address = self.email.val();

        //to prevent abuse, a client fingerprint is required
        //Docs: https://docs.kickbox.io/docs/integrating-recipient-authentication#2-generate-a-fingerprint
        Kickbox.fingerprint(self._getFingerprintOptions());
      });
      
      self.element.attr("data-processed");
      self.form.trigger("kickboxLoaded");
    },
    
    /// ***
    // private methods
    // ***
    
   _getTracker: function(token){
      var element;

      if(this.options.showTracker) {
        element = $(this.options.trackerContainer)[0]; // the element that will contain the tracker
      } else {
        element = null; //don't show but still fire the events
      }

      //we know Kickbox exists because we checked for it/injected it above
      Kickbox.track({
        app: this.app_code,
        showTracker: this.options.showTracker,
        token: token, // From /v2/authenticate
        element: element,

        //pass all the callbacks through from KickboxForm.options
        onProgress: this.options.onProgress,
        onSuccess: this.options.onSuccess,
        onFailure: this.options.onFailure,
        onError: this.options.onError
      })      
    },
    
    _getFormElement: function() {
      var formHtml = `<form xsclass="kickbox-form" id="form-` + this.app_code + `" data-app-code="` + this.app_code + `">
        <label id="label-` + this.app_code + `" for="email-` + this.app_code + `">
        </label>
        <input required="required" id="email-` + this.app_code + `" type="email" name="email"/>
        <br/><br/>
        <button id="submit-`+ this.app_code + `" type="submit"></button>
      </form>
      <div id="messages-` + this.app_code + `"></div>`
      
      //add the tracker container unless a custom one is specified
      if(this.options.trackerContainer == ".kickbox-email-tracker")
        formHtml+=`<div id="tracker-` + this.app_code + `" class="kickbox-email-tracker"></div>`;
      
      var form = $(this.element.append($(formHtml)));
      
      this.form = $('#form-' + this.app_code);
      this.email = $('#email-' + this.app_code);
      this.button = $('#submit-' + this.app_code);
      
      //inject the default or user-defined text into the form
      form.find('label').text(this.options.labelText);
      form.find('button').text(this.options.buttonText);
      form.find('input').attr('placeholder', this.options.placeholderText);
      
      //button name
      //label contents
      return form;
    },
    
    _getAttributeOptions: function(){
      //read all the user-defined options from the DOM element
      var attributes = this.element[0].attributes;
      
      var userOptions = [];
      $.each(attributes, function() {
        //all the attributes start with "options-"
        if (this.name.indexOf("options-") != 0) 
          return;
        else {
          //we need to be camelCased
          var key = $.camelCase(this.name.replace("options-",""));
          var value = this.value;

          //convert string bools to real bools
          if (value=="true" || value=="false") {
            value = value == "true" ? true : false;
          }

          //add the option to the array
          userOptions[key] = value;
        }
      });
      return userOptions;
    },
    
    _getFingerprintOptions: function() {
      var self = this;
      
      var options = {
        app: self.app_code,
        email: self.email.val(),
        //when the fingerprint call is done...
        onSuccess: function(fingerprint) {
          //call the onFingerprintSuccess Callback here
          
          //the authenticate callback must return a jQuery request object
          var call = self.options.authenticate(self.email_address, fingerprint, self.app_code);

          //execute the request and execute a promise on completion
          call.then(function(response){
            if (response.success != true) {
              //TODO gross... should be a callback with a nice default
              alert(response.body.message);  
              return;
            }
            
            self.options.onAuthenticateSuccess();

            var track_token = response.track_token;
            self._getTracker(track_token);
          })

          $('#submit-' + this.app_code).prop("disabled", false);
        },
        onError: function() {
          self.options.onFingerprintError;
        }
      };
      
      return options;
    },
    
    _injectCss: function(){       
      //Inject the widget css
      if (this.options.css) {
        $('<link/>', {
           rel: 'stylesheet',
           type: 'text/css',
           href: '/kickbox-widget.css'
        }).appendTo('head');
      }
    },
       
    //add a message to the #messages div
    _showMessage: function(message) {
      if(this.options.showMessages)
        $('#messages-' + this.app_code).text(message);
    }
  }

  /*
   * Plugin wrapper, preventing against multiple instantiations and
   * return plugin instance.
   */
  $.fn["kickboxForm"] = function (options) {
    var kickboxForm = this.data(dataKey);
    
    // has plugin instantiated ?
    if (kickboxForm instanceof KickboxForm) {
      // if have options arguments, call kickboxForm.init() again
      if (typeof options !== 'undefined') {
          kickboxForm.init(options);
      }
    } else {
      kickboxForm = new KickboxForm(this, options);
      this.data(dataKey, kickboxForm);
    }
        
    return kickboxForm;
  };

}(jQuery, window, document));
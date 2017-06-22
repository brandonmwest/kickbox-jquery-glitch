# A jQuery Plugin to Create a Kickbox Form

Add an HTML element with a [Kickbox](https://kickbox.io) Recipient Authentication app code. We'll generate the email form and email tracker. 

Provide a callback function that hits the Kickbox API and away you go.

## In your HTML

Add a tag with the class `kickbox-form` and your Recipient Authentication app code in the `kickbox-app-code` attribute.

```
<div class="kickbox-form" kickbox-app-code="xy2Nn_5hAGp2ZFuu88gB"></div>
```

Make sure you've included distribution .js file in your view.

## Providing a callback

Kickbox Recipient Authentication requires server-side code so you don't expose your API key. You'll need a server to make the API request to Kickbox and return the result to your web app.

Due to this requirement, we need to tell the Kickbox plugin where to find the response it expects. This is done by providing a callback function. 

A complete example of the needed client-side JavaScript:

```javascript
$(function() {
  //callback we must supply to the widget to interact with our server-side code
  //must take 3 parameters: email, fingerprint, and app_code
  //must return a jQuery POST request object  

  var callback = function(email, fingerprint, kickbox_app_code){
    return $.post( "/authenticate", {
      email: email, 
      fingerprint: fingerprint,
      kickbox_app_code: kickbox_app_code,
      dataType: "json",
    });
  }
  
  $('#button').click(function(){
    $('.kickbox-form'){ authenticate: callback });   
  });
});
```
## Options

| Attribute                   | Required? | Description                                                                                                                                                                  | Value            | Default           |
|-----------------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|-------------------|
| `kickbox-app-code`| Yes        | Your Kickbox Authentication App Code.                                                                                      | `string` |              |
| `options-css`               | no        | Include Kickbox default css                                                                                                                                                  | `true` or `false` | `true`            |
| `options-show-tracker`      | no        | Show the email progress tracker                                                                                                                                              | `true` or `false` | `true`            |
| `options-show-messages`     | no        | Show default success/error messages                                                                                                                                          | `true` or `false` | `false`           |
| `options-tracker-container` | no        | CSS selector for the container in which the email tracker will be shown, e.g. `#tracker`. If not specified, but `options-show-tracker` is true, a container will be created. | `string`         |                   |
| `options-label-text`        | no        | The text for the Email input label.                                                                                                                                          | `string`         | Email Address     |
| `options-button-text`       | no        | The text for the Submit button                                                                                                                                               | `string`         | Submit            |
| `options-placeholder-text`  | no        | The input placeholder text.                                                                                                                                                  | `string`         | email@example.com |
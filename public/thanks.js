$(function() {
   //hacky way to get the ID from the client side
  var job_id = location.search.replace("?kbx_id=","");
    
  //make a request to the /status route defined in server.js
  var request = $.ajax({
    url: '/status?' + $.param({job_id: job_id, app_code: "tGe6FQUxDmWn1VmGhU8W"}),
    method: "POST",
    dataType: "json"
  });

  request.done(function(result) {
    $('main').html("<b>" + result.email + "</b>'s authentication status is: <b>" + result.status + "</b>")
  });

  request.fail(function( jqXHR, textStatus ) {
    alert( "Request failed: " + textStatus );
  });
});
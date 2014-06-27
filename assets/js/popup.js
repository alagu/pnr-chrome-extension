setTimeout(function() {
    PNRStatus.init();
    $("#add-pnr").focus();
    $.get("http://pnrapi.alagu.net/status", function(response) {
      if(response.trim().length > 0)
      {
        $("#notice").html(response).show();
      }
    })
}, 2000);
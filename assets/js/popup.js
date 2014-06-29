setTimeout(function() {
    PNRStatus.init();
    $("#add-pnr").focus();
    $.get("http://pnrapi.alagu.net/status", function(response) {
      if(response.trim().length > 0)
      {
        $("#notice").html(response).show();
      }

      support_url = "https://alagu3.wufoo.com/forms/pnr-chrome-extension-support/def/field18="+ chrome.app.getDetails().version +"&field15=popup"
      $(".support-url").attr('href', support_url);
    })
}, 2000);
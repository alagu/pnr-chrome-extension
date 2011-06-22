(function()
{

var applyAddPNRButtons = function(node)
{
  var pnrNumber = $(node).html();
  pnrNumber = parseInt(pnrNumber);
  if(Math.floor(pnrNumber/1000000000) > 0)
  {
    var nodeHTML = "<img class='add_to_pnr' src='http://pnrapi.appspot.com/static/add_to_pnr.png'>" + "<span>"  +pnrNumber + "</span>";
    $(node).html(nodeHTML);
    $(node).attr('width','18%');
  }
}

var storePNRResponse = function(pnr_number)
{
    var k = $('<div class="pnr_message" style="display:none;">PNR Number <strong>' + pnr_number  +'</strong> was added to your PNR Watchlist (Click <img src="http://pnrapi.appspot.com/static/pnr.png"> icon to know the status).</div>');
    k.insertBefore('#maincontentbody');
    $('.pnr_message').css('background', '#EFFEB9 url(http://pnrapi.appspot.com/static/green_check.png) no-repeat 10px 2px');
    $('.pnr_message').css('border', '1px solid #97C700');
    $('.pnr_message').css('width', '80%');
    $('.pnr_message').css('font-size', '15px');
    $('.pnr_message').css('margin', '10px auto');
    $('.pnr_message').css('padding', '4px 2px 5px 2px');
    $('.pnr_message img').css('vertical-align', 'middle');

    if(k) { k.show('slow');}
}

var bulkAddClick = function(e)
{
 $(this).hide();
 var pnrSpanNode = $(this.parentNode).find('span');
 if(pnrSpanNode.length > 0)
 {
    pnrSpanNode = pnrSpanNode[0];
    var pnrNumber = parseInt($(pnrSpanNode).html());
    addPNR(pnrNumber);
 }

}

var addPNR = function(pnrNumber)
{
	if(Math.floor(pnrNumber/1000000000) > 0)
    {
     chrome.extension.sendRequest({action:'storePNR','pnr_num_store' : pnrNumber}, storePNRResponse);
    }
}

var ticketConfirmAddPNR = function(ev)
{
    var pnr_number = this.parentNode.parentNode.id;
    $(this.parentNode.parentNode).hide();
    storePNRResponse(pnr_number);
}

var addToBankResponsePage = function()
{
	
    var tdNodes = ($('td.borderTB'));
    if(tdNodes.length){
		var pnrNode = tdNodes[0];
		if(pnrNode) {
	    	var content = $(pnrNode).html();
	    	var split = (content.match(/(\d+)/));
			if(split.length) {
	    		var pnr_number = (split[0]);
			 	var k = $('<div class="pnr_message" style="display:none;" id="'+ pnr_number +'">You just booked a ticket! Add it to your PNR watchlist (<img src="http://pnrapi.appspot.com/static/pnr.png">) to track the status.<div><button class="pnr_message_button" id="pnr_add_button">Add</button><button class="pnr_message_button" id="pnr_print_button">Print Ticket</button></div></div>');
			    k.insertBefore('#maincontentbody');
			    $('.pnr_message').css('background', '#E3E9FF url(http://pnrapi.appspot.com/static/blue_info.png) no-repeat 10px 2px');
			    $('.pnr_message').css('border', '1px solid #68E');
			    $('.pnr_message').css('width', '80%');
			    $('.pnr_message').css('font-size', '15px');
			    $('.pnr_message').css('margin', '10px auto');
			    $('.pnr_message').css('padding', '4px 2px 5px 2px');
			    $('.pnr_message img').css('vertical-align', 'middle');


			    $('.pnr_message_button').css('font-size','120%');
			    $('.pnr_message_button').css('margin-right','20px');

			    $('.pnr_message_button').css('padding','5px');
			    $('.pnr_message_button').css('color','#fff');
			    $('.pnr_message_button').css('border','1px solid #000');
			    $('.pnr_message_button').css('background-color','#68E');
			    $('.pnr_message_button').css('-webkit-border-radius','4px');
			    $('#pnr_add_button').click(ticketConfirmAddPNR);
			    $('#pnr_print_button').click(function(){return printTicket();})

			    if(k) { k.show('slow');}
			}
		}
	}
}

var manglePage = function()
{
	$('#maincontentbody').html(html);
	debugger;
	
    var tdNodes = ($('td.borderTB'));
    var pnrNode = tdNodes[0];
    var content = $(pnrNode).html();
    var split = (content.match(/(\d+)/));
    var pnr_number = (split[0]);
	console.log(pnr_number); 
	var k = $('<div class="pnr_message" style="display:none;">You just booked a ticket! Add it to your PNR watchlist (<img src="http://pnrapi.appspot.com/static/pnr.png">) to track the status.<div><button>Add</button></div></div>');
    k.insertBefore('#maincontentbody');
    $('.pnr_message').css('background', '#E3E9FF url(http://pnrapi.appspot.com/static/blue_info.png) no-repeat 10px 2px');
    $('.pnr_message').css('border', '1px solid #68E');
    $('.pnr_message').css('width', '80%');
    $('.pnr_message').css('font-size', '15px');
    $('.pnr_message').css('margin', '10px auto');
    $('.pnr_message').css('padding', '4px 2px 5px 2px');
    $('.pnr_message img').css('vertical-align', 'middle');

    if(k) { k.show('slow');}
}

var addToPNRButton = function()
{
   var tdNodes = $('td.borderB');
   for(var i =0;i<tdNodes.length;i++)
   {
    var tdWidth = $(tdNodes[i]).attr('width');
    if(tdWidth == '14%')
    {
      applyAddPNRButtons(tdNodes[i]);
    }
   }


   var thNodes = $('td.boder-lft');

   for(var i=0;i<thNodes.length;i++)
   {
     var thValue = $(thNodes[i]).html();
     if(thValue.indexOf('PNR Number') != -1)
     {
       $(thNodes[i]).attr('width','18%');
     }
   }

   $('img.add_to_pnr').css('cursor','pointer');
   $('img.add_to_pnr').click(bulkAddClick);
  
}


var search_map = {'repassword':addToPNRButton,
				  'bankresponse':addToBankResponsePage};


var init = function(){
  var location = window.location + '';

  for (var searchItem in search_map)
  {
    if(location.indexOf(searchItem) != -1)
    {
      search_map[searchItem]();
    }
  }
}

init();

})();

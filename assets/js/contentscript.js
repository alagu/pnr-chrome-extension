var PNRStatus = {};
PNRStatus.pnrnum = [];
(function()
{

var pnrAlreadyAddedAlert = function()
{
	alert('This PNR number is already being tracked');
	return false;
}

var applyAddPNRButtons = function(node)
{
  var pnrNumber = $(node).html();
  pnrNumber = parseInt(pnrNumber);
  if(Math.floor(pnrNumber/1000000000) > 0)
  {
	if(PNRStatus.pnrnum.indexOf(pnrNumber.toString()) == -1) {
    	var nodeHTML = "<img class='add_to_pnr' src='http://pnrapi.appspot.com/static/add_to_pnr.png'>" + "<span>"  +pnrNumber + "</span>";
	}
	else
	{
		var nodeHTML = "<img class='pnr_added'  src='http://pnrapi.appspot.com/static/pnr_added.png' title='PNR " + pnrNumber + " is already being tracked' alt='PNR " + pnrNumber + " is already being tracked'>" + "<span>"  +pnrNumber + "</span>";		
	}
	
    $(node).html(nodeHTML);
    $(node).attr('width','18%');
  }
}

var storePNRResponse = function(pnr_number)
{
    var k = $('<div class="pnr_message" style="display:none;">PNR Number <strong>' + pnr_number  +'</strong> was added to your PNR Watchlist (Click <img src="http://pnrapi.appspot.com/static/pnr.png"> icon to know the status).</div>');
    k.insertBefore('.rf-p-b:eq(0)');
    $('.pnr_message').css('background', '#EFFEB9 url(http://pnrapi.appspot.com/static/green_check.png) no-repeat 10px 2px');
    $('.pnr_message').css('border', '1px solid #97C700');
    $('.pnr_message').css('width', '61%');
    $('.pnr_message').css('font-size', '15px');
    $('.pnr_message').css('margin', '10px auto');
    $('.pnr_message').css('padding', '4px 2px 5px 40px');
    $('.pnr_message').css('color', '#000');
    $('.pnr_message img').css('vertical-align', 'middle');

    if(k) { k.show('slow');}
}

var bulkAddClick = function(e)
{
 if($(this).hasClass('add_to_pnr')) {
	 $(this).attr('src','http://pnrapi.appspot.com/static/pnr_added.png');
	 $(this).attr('class','pnr_added');
	 $('img.pnr_added').click(pnrAlreadyAddedAlert);

	 var pnrSpanNode = $(this.parentNode).find('span');
	 if(pnrSpanNode.length > 0)
	 {
	    pnrSpanNode = pnrSpanNode[0];
	    var pnrNumber = parseInt($(pnrSpanNode).html());
	    addPNR(pnrNumber, 'addPNR_bulk');
	 }
 }
}

var addPNR = function(pnrNumber, event_name)
{
	if(Math.floor(pnrNumber/1000000000) > 0)
  {
    chrome.extension.sendRequest({
      'action' : 'storePNR',
      'pnr_num_store' : pnrNumber,
      'event': event_name,
    }, storePNRResponse);
  }
}

var ticketConfirmAddPNR = function(ev)
{
	var pnr_number = this.parentNode.parentNode.id;
  $(this.parentNode.parentNode).hide();
  addPNR(pnr_number, 'add_pnr_bank_response');
  return false;
}

var printTicketPopup = function()
{
	 var userRole='Normal';
	var sessionInfo = window.location.href.split('?')[1];
	var transID = $('td.borderTRB')[0].innerHTML.match(/\d+/)[0];
	window.open("../services/printTicket.jsp?" + sessionInfo + "&UserRole="+userRole+"&PassString=NNNNNN&ID=null&transID=" + transID + "&leftWidth=0","printpage","dependent=yes,width=775,height=500,screenX=200,screenY=300,titlebar=no,scrollbars=yes,maximize=no");
	return false;
}

var addToBankResponsePage = function()
{
	
    var tdNodes = ($('.rf-p-b:eq(0)'));
	    if(tdNodes.length){
		var pnrNode = tdNodes[0];
		if(pnrNode) {
	    	var pnr_number = $(pnrNode).find('#pnrNo').html()
			if(pnr_number) {
  			 	var k = $('<div class="pnr_message" style="display:none;" id="'+ pnr_number +'">Great, you just booked a ticket! Add it to your PNR watchlist (<img src="http://pnrapi.appspot.com/static/pnr.png">) to track the status in one click.<div><button class="pnr_message_button" id="pnr_add_button">Add to Watchlist</button></div></div>');
			    k.insertBefore('.rf-p-b:eq(0)');
          $('.pnr_message').css({
            "border" : "1px solid rgb(102, 136, 238)",
            "width" : "69%",
            "font-size" : "15px",
            "margin" : "10px auto",
            "padding" : "10px 2px 5px 50px",
            "background" : "url(http://pnrapi.appspot.com/static/blue_info.png) 10px 13px no-repeat rgb(227, 233, 255)",
            "color" : "#000",
            "font-size" : "17px",
            "text-align" : "center"});

			    $('.pnr_message img').css('vertical-align', 'middle');

			    $('.pnr_message_button').css({
            'font-size':'120%',
			      'margin-right' : '20px',
			      'padding' : '5px',
			      'color' : '#fff',
			      'border' : '1px solid #000',
			      'background-color' : '#68E',
			      '-webkit-border-radius' : '4px'})
			    
          $('#pnr_add_button').click(ticketConfirmAddPNR);

			    if(k) { k.show('slow');}
			}
		}
	}
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
   $('img.pnr_added').click(pnrAlreadyAddedAlert);
  
}



var search_map = {'repassword':addToPNRButton,
				  'BankResponse':addToBankResponsePage,
				  'ticketconfirm.do':addToBankResponsePage};

var applyPageChanges = function(storedPNR)
{
    PNRStatus.pnrnum = storedPNR;
  var location = window.location + '';

  for (var searchItem in search_map)
  {
    if(location.indexOf(searchItem) != -1)
    {
      search_map[searchItem]();
    }
  }	
}

var init = function(){
  chrome.extension.sendRequest({action:'getStoredPNR'}, applyPageChanges);

}

init();

})();

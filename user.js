PNRStatus = {};
(function(){
PNRStatus.getDateMarkup = function(timestamp)
{
	var dateTuple = PNRStatus.getDate(timestamp);
	returnhtml  =  '     <div class="travel-date-date">' + dateTuple[0] + '</div>';
    returnhtml += '     <div class="travel-date-month">' + dateTuple[1]+ '</div>';	
	return returnhtml;
}

PNRStatus.getDate = function(timestamp) 
{
  var d = new Date(timestamp * 1000);
  var monthList = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var date = d.getDate();
  var month = monthList[d.getMonth()];
  var year = d.getFullYear();

  return [date,month,year];
}

PNRStatus.callback = function(data)
{
  var return_obj = eval('(' + data + ')');
  if(return_obj.status == 'OK')
  {	
    PNRStatus.updateTicketItem(return_obj.data.pnr_number, return_obj.data, true);
  }
}

PNRStatus.updateTicketItem = function(pnr_num,data,update)
{
  if(update && update == true)
  {
    var ticketNode = $('#' + pnr_num);
    var date = PNRStatus.getDate(data.travel_date.timestamp);
    ticketNode.find('.date').html(date[0] + ' ' + date[1]);
    ticketNode.find('.year').html(date[2]);
    ticketNode.find('.ticket-status .start-destination').html(data.board.name + ' - ' + data.alight.name);
    ticketNode.find('.train-name-block  .train-num').html(data.train_number);
    ticketNode.find('.train-name-block .train-name').html(data.train_name);
    ticketNode.find('.fetching').hide();
  }
  
  if(data.hasOwnProperty('passenger'))
  {
    ticketNode.find('.fetching-pnr').hide();
    for(var i=0;i<data.passenger.length;i++)
    {
      var status = data.passenger[i];
      var css    = PNRStatus.getStatusClass(status);
      var number = '?';
      var text   = 'WL';
      console.log(css);
      if (css == 'wl'){
        number = status.status.match(/(\d+)/)[0];
        text   = 'WL';
      }
      else if (css == 'rac'){
        
      }
      else 
      {
        var splits = status.seat_number.split(',')
        number = splits[1];
        text   = splits[0];
      }
      
      
      var markup = '<li class="${css}"><div class="ticket-status-text">${status}</div><div class="ticket-status-num">${number}</div></li>';
      var node   = $.tmpl(markup,{'css':css,'status':text,'number':number});
      ticketNode.find('.ticket-item-list').append(node);
    }
    
    if(data.chart_prepared)
    {
      ticketNode.find('.chart-status').removeClass('chart-status-not-prepared');
      ticketNode.find('.chart-status').addClass('chart-status-prepared');
      ticketNode.find('.chart-status span').html('Chart Prepared');
    }
  }
}

PNRStatus.getPNRStatus = function(pnrInteger)
{
  var url = 'http://localhost/api/v1.0/pnr/' + pnrInteger;// + '?jsonp=pnrInteger';
  var chrome_getJSON = function(url, callback) {
        chrome.extension.sendRequest({action:'getJSON',url:url}, callback);
  }
  chrome_getJSON(url, PNRStatus.callback);
}

PNRStatus.init = function(){
  $('#add-button').click(PNRStatus.addPNR);
  PNRStatus.populatePNR();
  PNRStatus.setDisplays();
  PNRStatus.fetchAll();
}

PNRStatus.updateListeners = function()
{
  $('.delete-button-item').click(PNRStatus.deletePNR);
}

PNRStatus.setDisplays = function()
{ 
	
	var markup = '\
	<div class="status-item" id="${pnr_num}">\
	      <div class="fetching">\
	           Fetching status for PNR ${pnr_num}\
	      </div>\
        <div class="date-info">\
            <div class="date">\
                ${date} \
            </div>\
            <div class="year">\
                ${year}\
            </div>\
        </div>\
        <div class="ticket-status">\
            <div class="pnr-num">\
                PNR ${pnr_num}\
            </div>\
            <div class="start-destination">\
                ${source}  ${destination}\
            </div>\
            <div class="ticket-items">\
                <div class="fetching-pnr">\
        	           Fetching status \
        	      </div>\
                <ul class="ticket-item-list">\
                    <!--li class="cnf"><div class="ticket-status-text">S1</div><div class="ticket-status-num">31</div></li-->\
                    <li class="clrfix"></li>\
                </ul>\
                <div class="train-name-block">\
                    <div class="train-num">${train_num}</div> <div class="train-name">${train_name}</div>\
					          <div class="chart-status chart-status-not-prepared"><span class="chart-status-text">Chart not prepared</span></div>\
                </div>\
                <div style="clear:both;"></div>\
            </div>\
        </div>\
    </div>\
	 ';
	
	for (var i=0;i<PNRStatus.pnrnum.length;i++){
	  var node = 	$.tmpl(markup,{'pnr_num':PNRStatus.pnrnum[i]});
	  $('#status-items-block').append(node);
	}
	
	$('#give-feedback').click(function(e){
		chrome.tabs.create({'url':'https://chrome.google.com/webstore/detail/almdggoleggeecgelbjekpmefpohdjck'});
	})
}

PNRStatus.deletePNR = function(ev)
{
}

PNRStatus.deleteFromLocalStorage = function(num)
{
  if(num){
    PNRStatus.populatePNR();
    if(PNRStatus.pnrnum.indexOf(num) != -1)
    {
      PNRStatus.pnrnum.splice(PNRStatus.pnrnum.indexOf(num),1);
    }
    localStorage['pnrnum'] = PNRStatus.pnrnum.join(',');
  }
}

PNRStatus.addPNR = function(ev)
{
 var num = $('#add-pnr').val();

 if(num.length == 10 && PNRStatus.pnrnum.indexOf(num) == -1)
 {
   PNRStatus.pnrnum.push(num);
 }

 $('#add-pnr').val('');

 localStorage['pnrnum'] = PNRStatus.pnrnum.join(',');
 PNRStatus.trackEvent('addPNR');
}

PNRStatus.pnrnum = [];

PNRStatus.populatePNR = function()
{
  var pnrString = localStorage['pnrnum'];
  if(!pnrString || pnrString.length == 0)
  {
    PNRStatus.pnrnum = [];
  }
  else
  {
    PNRStatus.pnrnum = pnrString.split(',');
  }
}


PNRStatus.fetchAll = function()
{
  for(var i=0;i<PNRStatus.pnrnum.length;i++)
  {
    PNRStatus.getPNRStatus(PNRStatus.pnrnum[i]);
  }
}

PNRStatus.getStatusClass = function(status)
{
	if(status.status.indexOf('W/L') != -1
	  ||status.seat_number.indexOf('W/L') != -1)
	{
		return 'wl';
	}
	else if( status.status.indexOf('RAC') != -1
	       ||status.seat_number.indexOf('RAC') != -1
         )
	{
		return 'rac';
	}
	else
	{
		return 'cnf';
	}
}

PNRStatus.trackEvent = function(event)
{
  chrome.extension.sendRequest({action:'track',event:event});
}

PNRStatus.init();
})();

PNRStatus = {};
PNRStatus.sortInProgress = false;
(function(){

PNRStatus.ticketMarkup = function(pnr_num) {
  markup = '<div class="status-item" id="' + pnr_num + '">\
  <div class="fetching">\
	     Fetching status for PNR '+ pnr_num +'\
	</div>\
  <div class="date-info">\
      <div class="date">\
          ${date} \
      </div>\
      <div class="year">\
          ${year}\
      </div>\
      <div class="weekday">\
          ${weekday}\
      </div>\
  </div>\
  <div class="ticket-status">\
      <div class="delete">x</div>\
      <div class="pnr-num">\
          PNR '+ pnr_num +'\
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
  </div>';  

  return $(markup);
}
	 
/* 
 * Gets current date as markup
 */
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
  var dayList   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var date = d.getDate();
  var day  = dayList[d.getDay()];
  var month = monthList[d.getMonth()];
  var year = d.getFullYear();

  return [date,month,year,day];
}

PNRStatus.setTimedout = function(pnr_num)
{
  var node = $('#' + pnr_num);
  node.find('.fetching-pnr').html(' Indian railways is timing out :( ');
  node.find('.fetching-pnr').css('background', 'none'); 
}

PNRStatus.callback = function(data)
{
  var return_obj = data;
  if(return_obj.status == 'OK')
  {	
    PNRStatus.updateTicketItem(return_obj.data.pnr_number, return_obj.data);
  }
  else if (return_obj.status == 'INVALID')
  {
	PNRStatus.setInvalid(return_obj.data.pnr_number);
  }
  else if (return_obj.status == 'TIMEOUT')
  {
    PNRStatus.setTimedout(return_obj.data.pnr_number);
  }
}

PNRStatus.setInvalid = function(pnr_num) {
	var ticketNode = $('#' + pnr_num) 
	if (ticketNode)
	{
		var markup = '<div class="invalid"> \
						<div>Problem fetching data for PNR ${pnr_num}</div> \
						<div class="delete">Remove?</div>\
					  </div><div style="clear:both;"></div>';
		var node   = markup.replace('${pnr_num}', pnr_num);
		ticketNode.html('');
		ticketNode.append(node);
		$('.invalid .delete').click(PNRStatus.deletePNRCB);
	}
}

PNRStatus.updateTicketItem = function(pnr_num,data,update)
{
  if(data) {
    
    var ticketNode = $('#' + pnr_num);
    var date = PNRStatus.getDate(data.board.timestamp);
    ticketNode.attr('date',data.board.timestamp);
    ticketNode.find('.date').html(date[0] + ' ' + date[1]);
    ticketNode.find('.year').html(date[2]);
    ticketNode.find('.weekday').html(date[3]);
    ticketNode.find('.ticket-status .start-destination').html(data.board.name + ' - ' + data.alight.name);
    ticketNode.find('.train-name-block  .train-num').html(data.train_number);
    ticketNode.find('.train-name-block .train-name').html(data.train_name);
    ticketNode.find('.fetching').hide();
    ticketNode.find('.ticket-status').show();
    ticketNode.find('.date-info').show();
    
    if(data.hasOwnProperty('passenger'))
    {
      ticketNode.find('.fetching-pnr').hide();
      for(var i=0;i<data.passenger.length;i++)
      {
        var passenger = data.passenger[i];
        var parsedData = PNRStatus.parseStatus(data.passenger[i]);
        
        var markup = '<li class="' + parsedData['color'] + '"><div class="ticket-status-text">' + parsedData['state'] + '</div><div class="ticket-status-num">' + parsedData['number'] + '</div></li>';
        var node   = $(markup);
        ticketNode.find('.ticket-item-list').append(node);
      }
      
      if(data.chart_prepared)
      {
        ticketNode.find('.chart-status').removeClass('chart-status-not-prepared');
        ticketNode.find('.chart-status').addClass('chart-status-prepared');
        ticketNode.find('.chart-status span').html('Chart Prepared');
      }
      
      delete data.passenger;
      var json = JSON.stringify(data);
      localStorage.setItem(pnr_num,json);
    }
    
    PNRStatus.sort();
  }
}

PNRStatus.sort = function(pnr_num){
  if(!PNRStatus.sortInProgress) {
    PNRStatus.sortInProgress = true;
    var allNodes = $('.status-item');
    var node_list = [];
    for(var i=0;i<allNodes.length;i++)
    {
      var node_info = {'pnr':$(allNodes[i]).attr('id'), 'date':$(allNodes[i]).attr('date')};
      node_list.push(node_info);
    }
    
    //Sort them. (Bubble)
    
    for(var i=0;i<node_list.length;i++)
    {
      for(var j=0;j<node_list.length-1;j++)
      {
        if(node_list[j].date > node_list[j+1].date)
        {
          //Swap
          var tmp = node_list[j];
          node_list[j] = node_list[j+1];
          node_list[j+1] = tmp;
        }
      }
    }
    
    for(var i=node_list.length-1;i>=1;i--)
    {
      var smallerdate = node_list[i-1];
      var largerdate  = node_list[i];
      
      $('#' + smallerdate.pnr).insertBefore('#'+largerdate.pnr);
    }
    PNRStatus.sortInProgress = false;
  }
}

PNRStatus.getPNRStatus = function(pnrInteger, callback)
{
  var url = 'http://localhost:8080/api/v1.0/pnr/' + pnrInteger;// + '?jsonp=pnrInteger';
  var chrome_getJSON = function(url, callback) {
        chrome.extension.sendRequest({action:'getJSON',url:url, pnr: pnrInteger}, callback);
  }
  if(!callback) callback = PNRStatus.callback;
  
  if(typeof getJSON != 'undefined') {
      getJSON(url, callback);
  } else {
      chrome_getJSON(url, callback);
  }
}

/* Popup intializer */
PNRStatus.init = function(){
  $('#add-button').click(PNRStatus.addPNR); //Add click handler for pnr status
  PNRStatus.populatePNR(); //Set all the pnr numbers in localStorage to PNRStatus object
  PNRStatus.setDisplays();
  PNRStatus.fetchAll();
}

PNRStatus.setDisplays = function()
{ 
	
	for (var i=0;i<PNRStatus.pnrnum.length;i++){
	  var node = 	PNRStatus.ticketMarkup(PNRStatus.pnrnum[i]);
	  $('#status-items-block').append(node);
	}
	$('.ticket-status').hide();
	$('.date-info').hide();
	$('.delete').click(PNRStatus.deletePNRCB);
	
	for (var i=0;i<PNRStatus.pnrnum.length;i++){
	  if(localStorage.getItem(PNRStatus.pnrnum[i]))
	  {
	    var data = $.parseJSON(localStorage.getItem(PNRStatus.pnrnum[i]));
	    PNRStatus.updateTicketItem(PNRStatus.pnrnum[i],data);
	  }
	}
		
	$('#give-feedback').click(function(e){
		chrome.tabs.create({'url':'https://chrome.google.com/webstore/detail/almdggoleggeecgelbjekpmefpohdjck'});
	})
}

PNRStatus.deletePNRCB = function(ev)
{
   var pnrnum = this.parentNode.parentNode.id;
   PNRStatus.deletePNR(pnrnum);
}

PNRStatus.deletePNR = function(pnrnum){
 $('#' + pnrnum).remove();
 if(PNRStatus.pnrnum.indexOf(pnrnum) >= 0)
 {
   PNRStatus.deleteFromLocalStorage(pnrnum);
 }

 PNRStatus.trackEvent('deletePNR');
}

/* Add a ticket to history of tickets */
PNRStatus.addToHistory = function(pnrnum) {
	PNRStatus.deleteFromLocalStorage(pnrnum)
    var pnrHistory = localStorage['pnrhistory'];
    if(!pnrHistory || pnrHistory.length == 0)
    {
      var history = [];
    }
    else
    {
      var history = pnrHistory.split(',');
    }
	
	history.push(pnrnum)
	localStorage['pnrhistory'] = history.join(',')
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
 var add_pnr_val = $('#add-pnr').val();
 var num = add_pnr_val.match(/(\d+)/)[0];
 
 $('#add-pnr').hide();
 $('#add-button').hide();
 
 $('.add-response').show();
 

 var addsuccess = false;
 if(num.length != 10) 
 {
    $('.add-response').html(' Invalid PNR number');
    $('.add-response').addClass('error');
     PNRStatus.resetAddPNRAfter(2);
 }
 else if(PNRStatus.pnrnum.indexOf(num) != -1)
 {
   $('.add-response').html(' PNR Number already being tracked');
   $('.add-response').addClass('error');
   PNRStatus.resetAddPNRAfter(2);
 }
 else
 {
   $('.add-response').html(' Alright, I\'m tracking it');
   $('.add-response').addClass('success');
   PNRStatus.pnrnum.push(num);
   addsuccess = true;
   PNRStatus.resetAddPNRAfter(2);
 }


 if(addsuccess)
 {
   PNRStatus.addPNRToDisplay(num);
 }
 
 $('#add-pnr').val('');
 
 localStorage['pnrnum'] = PNRStatus.pnrnum.join(',');
 PNRStatus.trackEvent('addPNR_button');
}


PNRStatus.addPNRToDisplay = function(num)
{
   var node = PNRStatus.ticketMarkup(num);
   $('#status-items-block').append(node);
   node.find('.ticket-status').hide();
 	 node.find('.date-info').hide();
 	 node.find('.delete').click(PNRStatus.deletePNRCB);
 	 PNRStatus.getPNRStatus(num);
}

PNRStatus.resetAddPNRAfter  = function(time)
{
  setTimeout(function(){
    $('#add-pnr').show();
    $('#add-button').show();
    $('#add-pnr').val('');
    $('.add-response').html('Adding');
    $('.add-response').removeClass('error');
    $('.add-response').removeClass('success');
    $('.add-response').hide();
  },time*1000)
}

PNRStatus.pnrnum = [];
PNRStatus.todayTickets = {};

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

PNRStatus.fetchAll = function(callback)
{
  for(var i=0;i<PNRStatus.pnrnum.length;i++)
  {
    PNRStatus.getPNRStatus(PNRStatus.pnrnum[i],callback);
  }
}

PNRStatus.getStatusClass = function(status)
{
	 if( status.status.indexOf('RAC') != -1
	       ||status.seat_number.indexOf('RAC') != -1
         )
	{
		return 'rac';
	}
	else if(status.status.indexOf('W/L') != -1
	  ||status.seat_number.indexOf('W/L') != -1)
	{
		return 'wl';
	}
	else
	{
		return 'cnf';
	}
}


PNRStatus.parseStatus = function(passenger)
{   
    var isRAC = function(text)
    {
        return text.toLowerCase().indexOf('rac') >= 0;
    }

    var isWL = function(text)
    {
        return (text.toLowerCase().indexOf('w/l') >= 0) || (text.toLowerCase().indexOf('wl') >= 0);
    }

    state  = '';
    stateCode  = '';
    color = 'unknown'
    if (passenger['status'] == 'CNF') {
        splits = passenger['seat_number'].split(',');

        stateCode = 'CNF';
        state  = splits[0].replace(' ','');
        number = splits[1].replace(' ','');
        color = 'green';
    } 
    else if (isRAC(passenger['status']) && isRAC(passenger['seat_number']))
    {
        text = passenger['status'];
        
        state = stateCode = 'RAC';
        number = text.match(/(\d+)/)[0];
        color  = 'orange';
    }
    else if (passenger['status'] == 'Confirmed')
    {        
        state  = stateCode =  'CNF';
        number = ''
        color  = 'green';
    }
    else if (passenger['status'] == 'Can/Mod')
    {
        state  = stateCode =   'CAN';
        number = 'Cancelled';
        color  = 'grey';
    }
    else if (isWL(passenger['status']) && isWL(passenger['seat_number']))
    {
        text = passenger['status'];
        
        state  = stateCode = 'WL';
        number = text.match(/(\d+)/)[0]; 
        color  = 'red';
    }
    else if (isWL(passenger['seat_number']) && isRAC(passenger['status']))
    {
        text  = passenger['status'];
        
        state  = stateCode = 'RAC';
        number = text.match(/(\d+)/)[0];
        color  = 'orange';
    }
    else if ((!isWL(passenger['seat_number']) && !isRAC(passenger['seat_number']))
             && passenger['seat_number'].indexOf(passenger['status']) == 0)
    {
        
        splits = passenger['status'].split(',');
        stateCode = 'CNF';
        state  = splits[0].replace(' ','');
        number = splits[1].replace(' ','');
        color = 'green';
    }
    else 
    {
        status = passenger['status'].replace(',','');
        splits = status.split(' ');
        state  = splits[0];
        number = (splits[1] == '') ? splits[2] : splits[1];
        
        color = 'green';  
        stateCode = 'CNF';      
    }
    
    return {'color':color, 'state':state, 'number':number, 'stateCode' : stateCode};
    
}

PNRStatus.trackEvent = function(event)
{
  chrome.extension.sendRequest({action:'track',event:event});
}
})();

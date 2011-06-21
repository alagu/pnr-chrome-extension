PNRStatus = {};
(function(){
PNRStatus.log = function(message, level) {
  var prestring = '[PNRStatus] ';
  if(!level || level == 4) {
    console.log(prestring + message);
  } else if(level == 4) {
    console.log(prestring + message);
  } else if(level == 3) {
    console.info(prestring + message);
  } else if(level == 2) {
    console.warn(prestring + message);
  } else if(level == 1) {
    console.error(prestring + message);
  }
};

/*
 * {'status': 'OK', 'data': {'passenger': [{'status': 'CNF', 'seat_number': 'D8  , 31,GN'}, {'status': 'CNF', 'seat_number': 'D8  , 32,GN'}], 'from': 'SBC', 'alight': 'CBE', 'pnr_number': '4541990940', 'train_number': '*12677', 'to': 'CBE', 'board': 'SBC', 'train_name': 'ERNAKULAM EXP', 'travel_date': {'date': '2-6-2011', 'timestamp': 1306972800}, 'class': '2S'}}
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
	var trainnum = return_obj.data.train_number.match(/(\d+)/);
	trainnum = trainnum[0];
	var trainnode = $('#train-num-' + trainnum);
	return_obj.data.train_number = return_obj.data.train_number.replace('*','')
	if(!(trainnode.length)){
		//Train node not available.
		trainnode = $(
			 '<div class="train-block" id="train-num-' + trainnum + '">'
	       + '	<div class="train-info">'
	       +     return_obj.data.train_number + ' ' + return_obj.data.train_name
	       + '	</div>'
	 	   + '	<div class="pnr-items">'
		   + '	</div>'
		   + '</div>'
		);
		$('#results-block').append(trainnode);
	}
	else
	{
		trainnode = trainnode[0];
	}
	
	/*
	<div class="pnr-items">
        <div class="pnr-item" id="pnr-num-123456">
            <div class="delete-button">
                <button>Delete</button>
            </div>
            <div class="travel-date" >
                <div class="travel-date-date">16</div>
                <div class="travel-date-month">Jun</div>
            </div>
            <div class="travel-tickets">
                <div class="travel-ticket-item waitlist">
                    W/L 35
                </div>
                <div class="travel-ticket-item rac">
                    RAC 56
                </div>
                <div class="travel-ticket-item cnf">
                    CNF S2 8
                </div>
                
            </div>
            <div class="travel-pnr-number">
                <span class="pnr-label">PNR</span><span class="pnr-number-value">454585849494</span>
            </div>
            <div style="clear:both;"></div>
        </div>
    
	 */
	
	var htmlcontent  = '<div class="pnr-item" id="pnr-num-' + return_obj.data.pnr_number + '">';
        htmlcontent += ' <div class="delete-button">';
        htmlcontent += '     <button class="delete-button-item">Delete</button>';
        htmlcontent += ' </div>';
		htmlcontent += '<div class="travel-date">';
        htmlcontent += PNRStatus.getDateMarkup(return_obj.data.travel_date.timestamp);
		htmlcontent += '</div>';
        htmlcontent += ' <div class="travel-tickets">';


        var passengercount = return_obj.data.passenger.length;

        for(var i=0;i<passengercount;i++)
        {
          htmlcontent +=  	'<div class="travel-ticket-item ' + PNRStatus.getStatusClass(return_obj.data.passenger[i].status) + '">';
	      htmlcontent +=    return_obj.data.passenger[i].status
	 	  htmlcontent +=    (return_obj.data.passenger[i].status.indexOf('CNF') != -1) ? ' ' + return_obj.data.passenger[i].seat_number : '';
	      htmlcontent +=    '</div>';
        }

        htmlcontent += ' </div>';
        htmlcontent += ' <div class="travel-pnr-number">';
        htmlcontent += '     <span class="pnr-label">PNR</span><span class="pnr-number-value">' + return_obj.data.pnr_number + '</span>';
        htmlcontent += ' </div>';
        htmlcontent += ' <div style="clear:both;"></div>';
    	htmlcontent += '</div>';
    
    	var newNode = $(htmlcontent);
    	$('#train-num-' + trainnum + ' .pnr-items').append(newNode);
  }

  PNRStatus.hideLoading();
  PNRStatus.setDisplays();
  PNRStatus.updateListeners();
}

PNRStatus.showLoading = function()
{
	$('#notif-message').show();
}

PNRStatus.hideLoading = function()
{
	$('#notif-message').hide();
}

PNRStatus.getPNRStatus = function(pnrInteger)
{
  var url = 'http://pnrapi.appspot.com/' + pnrInteger;// + '?jsonp=pnrInteger';
  var chrome_getJSON = function(url, callback) {
        chrome.extension.sendRequest({action:'getJSON',url:url}, callback);
  }

  //var retstr = "{'status': 'OK', 'data': {'passenger': [{'status': 'Can/Mod', 'seat_number': 'W/L   10,CK'}], 'from': 'TJ', 'alight': 'MS', 'pnr_number': '4542588306', 'train_number': '*16178', 'to': 'MS', 'board': 'TJ', 'train_name': 'ROCKFORT EXPRES', 'travel_date': {'date': '19-6-2011', 'timestamp': 1308441600}, 'class': '3A'}}";
  chrome_getJSON(url, PNRStatus.callback);
  //PNRStatus.callback(retstr);
  //retstr = "{'status': 'OK', 'data': {'passenger': [{'status': 'CNF', 'seat_number': 'S2 59'}], 'from': 'TJ', 'alight': 'MS', 'pnr_number': '4542588306', 'train_number': '*16178', 'to': 'MS', 'board': 'TJ', 'train_name': 'ROCKFORT EXPRES', 'travel_date': {'date': '19-6-2011', 'timestamp': 1308441600}, 'class': '3A'}}";
  
  //PNRStatus.callback(retstr);
}

PNRStatus.init = function(){
  PNRStatus.fetchAll();
  PNRStatus.setDisplays();

  $('#add-action').click(PNRStatus.addPNR);
  $('#add-toggle').click(PNRStatus.toggleEdit);
  $('#edit-toggle').click(PNRStatus.toggleEdit);
}

PNRStatus.updateListeners = function()
{
  $('.delete-button-item').click(PNRStatus.deletePNR);
}

PNRStatus.setDisplays = function()
{ 
	$('#add-pnr-input').hide();
	$('.travel-pnr-number').hide();
	$('.delete-button').hide();
	$('.travel-tickets').show();
  	if(PNRStatus.pnrnum.length == 0)
  	{
    	$('#add-pnr-input').show();
		$('#add-toggle').html('-');
  	}
}

PNRStatus.toggleEdit = function(ev)
{
  if($('#add-pnr-input').is(':visible'))
  {
	$('#add-pnr-input').hide();
	$('.travel-pnr-number').hide();
	$('.delete-button').hide();
	$('.travel-tickets').show();
	$('#add-toggle').html('Add');
  }
  else
  {
	$('#add-pnr-input').show();
	$('.travel-pnr-number').show();
	$('.delete-button').show();
	$('.travel-tickets').hide();
	$('#add-toggle').html('-');
  }
}

PNRStatus.deletePNR = function(ev)
{
  
  if(PNRStatus.pnrnum.indexOf(this.parentNode.id) >= 0)
  {
    PNRStatus.deleteFromLocalStorage(this.parentNode.id);
    PNRStatus.fetchAll();
  }
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
 PNRStatus.populatePNR();

 var num = $('#pnr-input').val();

 if(num.length == 10 && PNRStatus.pnrnum.indexOf(num) == -1)
 {
   PNRStatus.pnrnum.push(num);
 }

 $('#pnr-input').val('');

 localStorage['pnrnum'] = PNRStatus.pnrnum.join(',');

 PNRStatus.fetchAll();
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
  PNRStatus.populatePNR();

  if(PNRStatus.pnrnum.length > 0)
  { 
	PNRStatus.showLoading();
  }

  for(var i=0;i<PNRStatus.pnrnum.length;i++)
  {
    PNRStatus.getPNRStatus(PNRStatus.pnrnum[i]);
  }

}

PNRStatus.getStatusClass = function(status)
{
	if(status.indexOf('CNF') != -1)
	{
		return 'cnf';
	}
	else if(status.indexOf('RAC') != -1)
	{
		return 'rac';
	}
	else
	{
		return 'waitlist';
	}
}

PNRStatus.init();

})();

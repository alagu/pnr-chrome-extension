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

PNRStatus.getDate = function(timestamp) 
{
  var d = new Date(timestamp * 1000);
  var monthList = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var date = d.getDate();
  var month = monthList[d.getMonth()];
  var year = d.getFullYear();

  return date + ' ' + month + ' ' + year;
}

PNRStatus.callback = function(data)
{
  var return_obj = eval('(' + data + ')');
  if(return_obj.status == 'OK')
  {
    var k  = $('#parentDiv');
    var htmlcontent  = '<div class="statusitem">';
        htmlcontent += ' <div class="traindetail">';
        htmlcontent += ' <table border=1 style="border-bottom:0;"><tr>';
        htmlcontent += ' <td width="20%"><div class="pnrnum"><span class="pnr">PNR</span> ' + return_obj.data.pnr_number + '</div></td>';
        htmlcontent += ' <td width="80%">';
        htmlcontent += '<div class="pnr-edit-box" id="'+  return_obj.data.pnr_number +'"><input type="button" class="delete_btn" value="x"></div>';
        htmlcontent += '<div class="traininfo">' + return_obj.data.train_number + ' ' + return_obj.data.train_name + ' (' + return_obj.data.from + ' to ' + return_obj.data.to +  ')</div></td>';
        htmlcontent += ' </tr></table>';
        htmlcontent += ' </div>';
        htmlcontent += ' <div class="ticketdetail">';
        htmlcontent += ' <table border=1><tr>';
        htmlcontent += ' <td width="10%" style="text-align:center">' + PNRStatus.getDate(return_obj.data.travel_date.timestamp) +  '</td>';

        var passengercount = return_obj.data.passenger.length;
        var widthratio    = 90/passengercount;

        for(var i=0;i<passengercount;i++)
        {
          htmlcontent +=  '<td class="passengerstatus" width="'+widthratio+'%">' + return_obj.data.passenger[i].status + ' ' + return_obj.data.passenger[i].seat_number+ '</td>';
        }
          
        htmlcontent += ' </tr></table>';
        htmlcontent += ' </div>';
        htmlcontent += '</div>';

    var newNode = $(htmlcontent);
    //newNode.html(data);
    if(k.html() == 'Fetching..')
    {
      k.html('');
    }
    k.append(newNode);
    $('#edit_trigger').show();
  }
  PNRStatus.setDisplays();
  PNRStatus.updateListeners();
}

PNRStatus.getPNRStatus = function(pnrInteger)
{
  var url = 'http://pnrapi.appspot.com/' + pnrInteger;// + '?jsonp=pnrcallback';
  var chrome_getJSON = function(url, callback) {
        chrome.extension.sendRequest({action:'getJSON',url:url}, callback);
  }

  chrome_getJSON(url, PNRStatus.callback);
}

PNRStatus.init = function(){
  PNRStatus.fetchAll();
  PNRStatus.setDisplays();

  $('#add_pnr').click(PNRStatus.addPNR);
  $('#edit_pnr').click(PNRStatus.editPNR);
}

PNRStatus.updateListeners = function()
{
  $('.pnr-edit-box input').click(PNRStatus.deletePNR);
}

PNRStatus.setDisplays = function()
{
  if(PNRStatus.pnrnum.length == 0)
  {
    $('#edit_block').show();
    $('#edit_trigger').hide();
  }
  else
  {
    $('#edit_block').hide();
    $('.pnr-edit-box').hide();
  }
}

PNRStatus.editPNR = function(ev)
{
  if($('#edit_block').is(':visible'))
  {
    $('#edit_block').hide();
    $('.pnr-edit-box').hide();
  }
  else
  {
    $('#edit_block').show();
    $('.pnr-edit-box').show();
  }
}

PNRStatus.deletePNR = function(ev)
{
  PNRStatus.deleteFromLocalStorage(this.parentNode.id);
  PNRStatus.fetchAll();
}

PNRStatus.deleteFromLocalStorage = function(num)
{
  if(num){
    PNRStatus.populatePNR();
    PNRStatus.pnrnum.splice(PNRStatus.pnrnum.indexOf(num));
    localStorage['pnrnum'] = PNRStatus.pnrnum.join(',');
  }
}

PNRStatus.addPNR = function(ev)
{
 var pnrnum = localStorage['pnrnum']; 
 if(!pnrnum)
 {
   pnrnum = [];
 }
 else
 {
   pnrnum = pnrnum.split(',')
 }

 var num = $('#pnr_input').val();

 if(num.length == 10 && pnrnum.indexOf(num) == -1)
 {
   pnrnum.push(num);
 }

 localStorage['pnrnum'] = pnrnum.join(',');

 $('#edit_block').hide();
 $('#pnr_input').val('');
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
    $('#parentDiv').html('Fetching..');
  }
  else
  {
    $('#parentDiv').html('');
    PNRStatus.setDisplays();
  }
  for(var i=0;i<PNRStatus.pnrnum.length;i++)
  {
    PNRStatus.getPNRStatus(PNRStatus.pnrnum[i]);
  }

}

PNRStatus.init();

})();

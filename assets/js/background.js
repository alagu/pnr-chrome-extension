var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-24995053-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

TIME_ONEHOUR = 3600;
TIME_INFINITY = 365*86400;
/* Get stored PNR*/
function getStoredPNR()
{
	var pnrnum = localStorage['pnrnum']; 

	pnrnum = pnrnum ? pnrnum.split(',') : [];
	return pnrnum;
}


function trackEvent(event)
{
	_gaq.push(['_trackEvent', event, 'event']);
}

function getJSON(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var resp = xhr.responseText;
			console.log(resp);
			callback(resp);
		}
	}
	xhr.send();  
}

function parsePage(pnr, pnr_html) {
	var return_json = {};
	return_json['status'] = 'OK';
	return_json['data'] = {};
	var ret_data = return_json['data'];
	ret_data['pnr_number'] = pnr;
	var pnr_div = document.createElement("div");
	pnr_div.innerHTML = pnr_html;
	train_number = $(pnr_div).find(".table_border_both:eq(0)").html();
	if(train_number == undefined) {
		return_json['status'] = 'INVALID';
		return return_json;
	}

	ret_data['train_number'] = train_number.trim().replace('*', '');
	chart_prepared = $(pnr_div).find("#center_table tr:last").prev("tr").find(".table_border_both").html().trim();
	ret_data['chart_prepared'] = (chart_prepared == "CHART PREPARED");
	ret_data['train_name'] = $(pnr_div).find(".table_border_both:eq(1)").html();
	var travel_date = $(pnr_div).find(".table_border_both:eq(2)").html().replace(/ /g,'');
	var date_split = travel_date.split("-")
	var travel_timestamp = (new Date(date_split[2], date_split[1], date_split[0])).getTime()/1000
	ret_data['travel_date'] = {'timestamp':travel_timestamp, 'date': travel_date};
	from = $(pnr_div).find(".table_border_both:eq(3)").html();
	ret_data['from'] = {'code': from, 'name': from, 'time': '00:00'};
	to = $(pnr_div).find(".table_border_both:eq(4)").html();
	ret_data['to'] = {'code': to, 'name': to, 'time': '00:00'};
	alight = $(pnr_div).find(".table_border_both:eq(5)").html();
	ret_data['alight'] = {'code': alight, 'name': alight, 'time': '00:00'};
	board = $(pnr_div).find(".table_border_both:eq(6)").html();
	ret_data['board'] = {'code': board, 'name': board, 'time': '00:00', 'timestamp': travel_timestamp};
	ret_data['class'] = $(pnr_div).find(".table_border_both:eq(7)").html().trim();
	passengers = $(pnr_div).find("#center_table tr").length - 3
	ret_data['passenger'] = [];
	for(var i=1; i<passengers+1; i++)
	{
		var selector = "#center_table tr:eq(" + String(i) + ")";
		var passenger = {};
		passenger["seat_number"] = $(pnr_div).find(selector + " .table_border_both:eq(1)").text().trim().replace(/ +(?= )/g,'');
		passenger["status"] = $(pnr_div).find(selector + " .table_border_both:eq(2)").text().trim().replace(/ +(?= )/g,'');
		ret_data['passenger'].push(passenger);
	}
	
	return return_json;
}

function getIndianRailway(pnr, cb) {
	$.get("http://pnrapi.alagu.net/track/" + pnr);
	$.get("http://www.indianrail.gov.in/pnr_Enq.html", function(resp) {
			var d = document.createElement('div');
			d.innerHTML = resp;
			var enquiry_url = d.getElementsByTagName('form')[0].action
			var rand_captcha = String(Math.floor(Math.random() * 1000000));
			var params = {'lccp_pnrno1':pnr, 'submitpnr':'Get Status', 'lccp_cap_val':rand_captcha, 'lccp_capinp_val':rand_captcha}
			$.post(enquiry_url, params, function(pnr_html) {
				var return_json = parsePage(pnr, pnr_html);
				cb(return_json);
			})
		}
	)
}
    
function onRequest(request, sender, callback) {
	if (request.action == 'getJSON') {
		getIndianRailway(request.pnr, callback);
	}
	else if ( request.action == 'storePNR')
	{

		var pnrnum = getStoredPNR();
		var num = request.pnr_num_store + '';

		if(num.length == 10 && pnrnum.indexOf(num) == -1)
		{
			pnrnum.push(num);
		}

		localStorage['pnrnum'] = pnrnum.join(',');
       
		callback(num);
	}
	else if (request.action == 'getStoredPNR')
	{
		callback(getStoredPNR());
	}
	else if (request.action == 'track')
	{
		_gaq.push(['_trackEvent', request.event, 'event']);
	}
}
chrome.extension.onRequest.addListener(onRequest);

/* Post install stuff */
function install_notice() {
	if (localStorage.getItem('install_time'))
	{
		return;
	}

	var now = new Date().getTime();
	localStorage.setItem('install_time', now);
	chrome.tabs.create({url: "installed.html"});
}
install_notice();
  
var Background = {};

if (window.webkitNotifications) {
	Background.timeInDays = function(days_diff)
	{
		return (days_diff)*86400*1000;
	}
      
	Background.timeInHours = function(hours_diff)
	{
		return (hours_diff)*3600*1000;
	}
      
	Background.timeInMins = function(mins_diff)
	{
		return (mins_diff)*60*1000;
	}
	
	Background.getDayString = function(date_obj)
	{
		return date_obj.getDate() + "" + date_obj.getMonth() + "" + date_obj.getYear();
	}
	
	Background.isToday = function(timestamp) {
		var ticketDate = new Date(timestamp*1000);
		var todayDate  = new Date();
		return (Background.getDayString(ticketDate) == Background.getDayString(todayDate));
	}
      
	Background.getDateString = function(timestamp) {
	 	var timeTuple = PNRStatus.getDate(timestamp);
		if (Background.isToday(timestamp)) {
			return "Today";
		}
		else {
			return timeTuple[0] + " " + timeTuple[1];
		}
	}
      
	Background.showPopup = function(data) {
		var status = '';
		if (!data.hasOwnProperty('data') || !data['data'].hasOwnProperty('from'))
		{
			return;
		}
		for (var passenger in data['data']['passenger']) {
			var passengerStatus = data['data']['passenger'][passenger]['status']; 
			status += passengerStatus + ' ';
		}
        
		if (data['data']['from']['time'] != '') {
			status += '. Departs at ' + data['data']['board']['time'];
		}
        
		var notification = window.webkitNotifications.createNotification(
			'icon.png',  
			Background.getDateString(data['data']['board']['timestamp']) + ': ' + data['data']['board']['name'] + ' to ' + data['data']['alight']['name'], // The title.
			'Status - ' + status 
		);
        
		notification.show();
		trackEvent('showpopup');

		setTimeout(function() {
			notification.cancel();
		}, 600000);
	}
	  
	/* Stores PNR, and calls refresh again. */
	Background.storeAndMonitorPNR = function(pnr, pnr_data) {
		Background.storePNR(pnr, pnr_data);
		Background.monitorTicket(pnr);
	}
      
	Background.storePNR  = function(pnr, pnr_data) {
		pnr_data['updateTime'] = (new Date()).getTime();
		localStorage.setItem(Background.cacheKey(pnr), JSON.stringify(pnr_data));
	}
      
	Background.cacheKey = function(pnr) {
		return pnr + "-cached"
	}

	/* Gets the cached PNR status, or returns null */
	Background.getCachedPNRStatus = function(pnr) {
		if (localStorage.getItem(Background.cacheKey(pnr))) {
			data = $.parseJSON(localStorage.getItem(Background.cacheKey(pnr)));
			return data;
		} else {
			PNRStatus.getPNRStatus(pnr,function(pnr_data){ Background.storeAndMonitorPNR(pnr, $.parseJSON(pnr_data));}) 
			return null;
		}
	}
      
	/* Updates next popup time for cached data */
	/* What to notify:
	* 
	* (Travel date < 7 days)  and (Ticket last shown > 1 day)
	* (Travel date < 2 days)  and (Ticket last shown > 6 hours)
	* (Travel date < 1 day)   and (Ticket last shown > 2 hours)
	* (Travel date < 6 hours) and (Ticket last shown > 30 minutes)
	*/   
	Background.updateNextPopupTime = function(pnr_data) {
		var currentTimestamp = (new Date()).getTime();
		var travelTimestamp  = pnr_data['data']['board']['timestamp'] * 1000;
		var difference       = travelTimestamp - currentTimestamp;
		var nextPopupTime    = 0;
		if (difference < 0 )
		{
			// Old ticket
			nextPopupTime = -1;
		}
		else if (difference < Background.timeInHours(2))
		{
			nextPopupTime = currentTimestamp + Background.timeInMins(15);
		}
		else if(difference < Background.timeInHours(6)) 
		{
			nextPopupTime = currentTimestamp + Background.timeInHours(1);
		}
		else if(difference < Background.timeInDays(1)) 
		{
			nextPopupTime = currentTimestamp + Background.timeInHours(2);   
		}
		else if (difference < Background.timeInDays(2)) {
			nextPopupTime = currentTimestamp + Background.timeInHours(6);  
		}
		else if (difference < Background.timeInDays(6)) {
			nextPopupTime = currentTimestamp + Background.timeInDays(1);
		}
		else {
			nextPopupTime = currentTimestamp + difference - Background.timeInDays(6);              
		}	  
		
		localStorage.setItem(pnr_data['data']['pnr_number'] + '-next-pp', nextPopupTime);
          
		return 0;
	}
      
	/* Returns the time when next popup should be shown */
	Background.nextPopupTime = function(pnr) {
		var nextpp = localStorage.getItem(pnr + '-next-pp');
		if (nextpp == null) {
			return 0;
		}
		else if (nextpp == "-1") {
			return -1;
		}
		else {
			return Number(nextpp);
		}
	}
	  
	Background.refreshAndShow = function(pnr, pnr_data) {
		Background.storePNR(pnr, pnr_data);
		Background.showPopup(pnr_data);
		Background.updateNextPopupTime(pnr_data);
	}

	Background.monitorTicket = function(pnr) {
		/*
		- Try to fetch data from localStore.
		- If not, populate the data and save it in localStore
		- See travel_date, ticket_status and last_shown
		- If it fits above conditions, then show popup.
		*/
		var cached_data = Background.getCachedPNRStatus(pnr);
		if(!cached_data) {
			return;
		}
          
		if(cached_data.hasOwnProperty('data') && cached_data.data.hasOwnProperty('travel_date') ){
			var nextPopupTime   = Background.nextPopupTime(pnr);
			if ((new Date()).getTime() > nextPopupTime && nextPopupTime != -1) {
				PNRStatus.getPNRStatus(cached_data['data']['pnr_number'],
				function(pnr_data){ 
					Background.refreshAndShow(cached_data['data']['pnr_number'],$.parseJSON(pnr_data));});
				}
			} 
		}
	  
      
		Background.monitorAllTickets = function() {
			PNRStatus.populatePNR();
			for (var i=0; i< PNRStatus.pnrnum.length; i++) {
				Background.monitorTicket(PNRStatus.pnrnum[i]);
			}
		}
		
		Background.forceRefetchAll = function() {
			PNRStatus.populatePNR();
			for (var i=0; i< PNRStatus.pnrnum.length; i++) {
				PNRStatus.getPNRStatus(PNRStatus.pnrnum[i],function(pnr_data){ Background.storeAndMonitorPNR(PNRStatus.pnrnum[i], $.parseJSON(pnr_data));}) 
			}
		}
      
		setInterval(Background.monitorAllTickets, 120000);
		setInterval(Background.forceRefetchAll, 6*60*60*1000);
		Background.monitorAllTickets();
	}

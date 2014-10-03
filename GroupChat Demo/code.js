"use strict";

var etag=null;
var time = null;
var userColor = {};

function podURL() {
	// temporary hack until we have a nice way for users to select their pod
	//return "http://"+document.getElementById("username").value+".fakepods.com";
	return document.getElementById("podurl").value
}


function reload() {

	var request = new XMLHttpRequest();

	// just fetch everything, for now, since queries don't work yet
	request.open("GET", podURL()+"/_nearby", true);
	if (etag !== null) {
		request.setRequestHeader("Wait-For-None-Match", etag);
	}

	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
    		handleResponse(request.responseText);
    	}
 	}

	request.send();
}

function getRandomColor(){
    var list = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
    var rbg = "#";
    for (var ii=0;ii<6;ii++){
        var color = list[Math.floor(Math.random()*16)];
        rbg += color;
    }
    return rbg;
}

function handleResponse(responseText) {
	var responseJSON = JSON.parse(responseText);
	etag = responseJSON._etag;
	var all = responseJSON._members;
	var messages = [];
	for (var i=0; i<all.length; i++) {
		var item = all[i];
		// consider the 'text' property to be the essential one
		if ('text' in item) {
			messages.push(item)
		}
	}
	messages.sort(function(a,b){return a.time-b.time});
	
	// not being clever, just remove and re-create the whole "out" element
	var out = document.getElementById("out")
	while(out.firstChild) { out.removeChild(out.firstChild) }
	for (i=0; i<messages.length; i++) {
		var message = messages[i];
		message.timeDate = new Date(Number(message.time));
		//div.innerHTML = message.timeDate.toLocaleString()+" "+message._owner+" "+message.text;
        var messTime = message.timeDate.toLocaleString()
        if (time != messTime.split(" ")[0] && messTime.split(" ")[0] != "Invalid"){
            var divDate = document.createElement("div");
            divDate.innerHTML = messTime.split(" ")[0];
            divDate.className = "date";
            time = messTime.split(" ")[0];
            out.appendChild(divDate);
        }
        var div = document.createElement("div");
        //var messTimeSpan = "<span class='time col-md-2'>" + messTime + " </span>";
        var messTimeSpan = "<span class='time col-md-1' title='"+messTime+"'>" + messTime.split(" ")[1] + messTime.split(" ")[2] + " </span>";
        var messOwner = message._owner.substring(7).split(".")[0]
        if (!userColor.hasOwnProperty(messOwner)){
            userColor[messOwner] = getRandomColor();
        }
        var messOwnerSpan = "<span class='owner col-md-1' title='" + message._owner + "'style='background-color:" + userColor[messOwner] + "'>" + messOwner + " </span>";
        var messText = message.text;
        var messTextSpan = "<span class='messText'>" + messText + " </span>";
        div.innerHTML = messTimeSpan + messOwnerSpan + messTextSpan;
        div.className = "message " + message._owner.substring(7).split(".")[0];
		out.appendChild(div);
	}
	document.getElementById("chat").style.visibility = "visible"
	// wait for 100ms then reload when there's new data.  If data
	// comes faster than that, we don't really want it.
	setTimeout(reload, 50);
}


function newmsg() {
    var message = document.getElementById("message").value;
	document.getElementById("message").value = "";
    if (message) {
     	var request = new XMLHttpRequest();
	    request.open("POST", podURL());
    	request.onreadystatechange = function() {
            if (request.readyState==4 && request.status==201) {
				// why does this always print null, even though it's not?
				// console.log("Location:", request.getResponseHeader("Location"));
     		}
		}
		request.setRequestHeader("Content-type", "application/json");
		var content = JSON.stringify({text:message, time:Date.now()});
		request.send(content);
	} 
}
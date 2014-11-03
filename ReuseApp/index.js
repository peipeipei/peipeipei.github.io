"use strict";
$(document).ready(function(){
    //to make things easier to debug 

    $('#forNewItem').click(function(){
        if ($('.newItemForm').hasClass("notVisibleForm")){
            $('.newItemForm').removeClass("notVisibleForm");
            $('.newItemForm').addClass("visibleForm");
        }
        else if ($('.newItemForm').hasClass("visibleForm")){
            $('.newItemForm').removeClass("visibleForm");
            $('.newItemForm').addClass("notVisibleForm");
        }
        
    });
});

function makeJSON(brand, type, condition, description, price, location){
    var file = {};
    file["CrossCloudReuseList"] = true;
    file["brand"] = brand;
    file["condition"] = condition;
    file["description"] = description;
    file["price"] = price;
    file["location"] = location;
    
    var isElectronics = (type == "electronics");
    var isClothing = (type == "clothing");
    var isBooks = (type == "books");
    var isFurniture = (type == "furniture");
    var isOther = (type == "other");
    
    file["isElectronics"] = isElectronics;
    file["isClothing"] = (type == "clothing");
    file["isBooks"] = (type == "books");
    file["isFurniture"] = (type == "furniture");
    file["isOther"] = (type == "other");
    file["isForSale"] =  true; //temporarily set this as true, since we don't have a 'looking for' feature
    file["time"] = Date.now();
    
    return file;
}


$(function(){
    $("#error").html("");  // clear the "Missing Javascript" error message

    var pod = crosscloud.connect();
    var myMessages = [];

    var sendProduct = function () {
        var brand = document.getElementById("brand").value;
        var type = document.getElementById("type").value;
        var condition = document.getElementById("condition").value;
        var description = document.getElementById("description").value;
        var price = document.getElementById("price").value;
        var location = document.getElementById("location").value;
    
        var thisJSON = makeJSON(brand, type, condition, description, price, location);
        console.log(thisJSON);
        //var content = JSON.stringify(thisJSON);
        
        
        myMessages.push(thisJSON);
        pod.push(thisJSON);

        document.getElementById("brand").value = "";
        document.getElementById("type").value = "";
        document.getElementById("description").value = "";
        document.getElementById("condition").value = "";
        document.getElementById("price").value = "";
        document.getElementById("location").value = "";

    };

    $("#submit").click(sendProduct);

    // allow the enter key to be a submit as well
    /*$("#nick").keypress(function (e) {
        if (e.which == 13) {
            $("#helloButton").click();
            return false;
        }
    });*/

    //var show = 12;
    var displayMessages = function (messages) {
        
        messages.sort(function(a,b){return a.when<b.when?1:(a.when===b.when?0:-1)});
        //var count = 0;
        var out = document.getElementById("products");
        out.innerHTML="";
        var i;
        //alert(messages[1].description);
        for (i=0; i<messages.length; i++) {
            var message = messages[i];
            
            //alert(message._id);
            
            var itemType;
            if (message.isBooks){
                itemType = "Books";   
            }
            else if (message.isElectronics){
                itemType = "Electronics"; 
            }
            else if (message.isFurniture){
                itemType = "Furniture";  
            }
            else if (message.isClothing){
                itemType = "Clothing";  
            }
            else{
                itemType = "Other"; 
        }

        if (Number(message.time) > 0) {
            
            var div = document.createElement("div");
            div.className = "productInfo";
            message.timeDate = new Date(Number(message.time))
            var date = message.timeDate.toLocaleString();
            
            var line = "<div class='displayInfo' id='displayBrand'>"+message.brand+"</div>";
            line += "<div>Price: "+message.price+"</div>";
            line += "<div>Condition: "+message.condition+"</div>";
            line += "<div>Description: "+message.description+"</div>";
            line += "<div>Type: "+itemType+"</div>";
            line += "<div>Location: "+message.location+"</div>";

            var link = document.createElement("a");

            div.innerHTML = line;
            link.href=message._id;
            link.appendChild(document.createTextNode("item"));
            div.appendChild(link);
            
            out.appendChild(div);
            
        }
    }
        /*if (count > show) {
            $("#out").append("<p><i>("+(count-show)+" more not shown)</i></p>");
        }*/
    };

    pod.onLogin(function () {
        //$("#products").html("waiting for data...");
        pod.onLogout(function () {
            $("#products").html("<i>not connected</i>");
        });

        pod.query()
            .filter( { CrossCloudReuseList:true } )
            .onAllResults(displayMessages)
            .start();
    });

    function qElec(){
    clearList();
    console.log("refreshing Electronics");
    pod.query()
            .filter( { isElectronics:true } )
            .onAllResults(displayMessages)
            .start();
        }
     function qBook(){
    clearList();
    console.log("refreshing");
    pod.query()
            .filter( { isBooks:true } )
            .onAllResults(displayMessages)
            .start();
        }

     function qClothing(){
    clearList();
    console.log("refreshing");
    pod.query()
            .filter( { isClothing:true } )
            .onAllResults(displayMessages)
            .start();
        }

    function qFurniture(){
    clearList();
    console.log("refreshing");
    pod.query()
            .filter( { isFurniture:true } )
            .onAllResults(displayMessages)
            .start();
        }

     function qOther(){
    clearList();
    console.log("refreshing");
    pod.query()
            .filter( { isOther:true } )
            .onAllResults(displayMessages)
            .start();
        }
    $('#electronicsLink').click(qElec);
    $('#booksLink').click(qBook);
    $('#clothingLink').click(qClothing);
    $('#furnitureLink').click(qFurniture);
    $('#otherLink').click(qOther);

    function clearList(){
        var out = document.getElementById("products");
            out.innerHTML="";
    }

});


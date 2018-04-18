// Prep website for first search
$(document).ready(function() {
    // Login information
    let reg_form = $("#reg_form");
    let login_form = $('#login_form');
    let logout_form = $("#logout_form");
    let reg_toggle = $('.reg_toggle');
    $('.no_ratings').hide();
    // Toggle register and sign in
    reg_toggle.click(function() {
        if (reg_form.is(":visible")){
            reg_form.hide();
            login_form.show();
        } else {
            reg_form.show();
            login_form.hide();
        }
    })
    let current_user;
    let current_ratings = [];
    function getCurrentRatings() {
        ratings = []
        $.getJSON('/my_ratings', {"username":current_user}, function(results) {
            $.each(results, function (index) {
                ratings.push(results[index].beerid)
            });
        });
        return ratings;
    }

    $.getJSON('/users')
    .done(function(data){
        document.getElementById("uname").innerHTML = "User: "+ data;
        current_user = data;
        login_form.hide();
        reg_form.hide();
        logout_form.show();
        $("#my_ratings").show();
    })
    .fail(function(){
        logout_form.hide();
        reg_form.show();
        login_form.hide();
        $("#my_ratings").hide();
    });

    //get mesage for the top
    $.getJSON('/api/messageslatest/')
    .done(function(data){
        document.getElementById("umessage").innerHTML = "Message: "+ data.data;
    })
    .fail(function(){
        console.log("Failure to get messages");
    });



    let search_panel = $("#search_panel")
    let detailed_results = $("#detailed_results")
    let click_on_table = $(".click_on_table")
    let my_ratings_table = $("#my_ratings_table")
    detailed_results.hide();
    click_on_table.hide();
    my_ratings_table.hide();
    $("#results_table").hide();

    // Toggle search bar on click
    $("#search_header").click(function() {
        if (search_panel.is(":visible")){
            search_panel.slideUp();
            $("#toggle_search").attr("src","./resources/icons/expand.png");
        }else{
            search_panel.slideDown();
            $("#toggle_search").attr("src","./resources/icons/minimize.png");
        }
    });

    // Search terms
    let style_search = $('#style');
    let hop_search = $('#hop');
    let malt_search = $('#malt');
    let pairing_search = $('#pairing');
    let search = $('#search');
    let potential_matches = [];
    let results_table = $('#results_table');
    let my_ratings = $('#my_ratings');
    // On click, get search terms and search
    search.click(function() {
    	detailed_results.hide();
        my_ratings_table.hide();
        $('.no_ratings').hide();
        click_on_table.show();
        $.getJSON('https://api.punkapi.com/v2/beers')

        .done(function(data) {
            // Array of all potential matches
            potential_matches = [];
            
            let style = style_search.val().toLowerCase();
            let malt = malt_search.val().toLowerCase();
            let hop = hop_search.val().toLowerCase();
            let pairing = pairing_search.val().toLowerCase();
            for (var i = 0; i < data.length; i++){
                let beer = data[i];
                let match = true;
                // Check style match
                if (style !=''){
                    if (beer.description.toLowerCase().indexOf(style)==-1){
                        match = false;
                    }
                }
                // Check malt match
                if (malt!=''){
                    let malts = beer.ingredients.malt;
                    let local_match = false;
                    for (var j=0; j<malts.length && !local_match; j++){
                        if (malts[j].name.toLowerCase().indexOf(malt)!=-1){
                            local_match = true;
                        }
                    }
                    if (!local_match){
                        match = false;
                    }
                }
                // check hop match
                if (hop!=''){
                    let hops = beer.ingredients.hops;
                    let local_match = false;
                    for (var j=0; j<hops.length && !local_match; j++){
                        if (hops[j].name.toLowerCase().indexOf(hop)!=-1){
                            local_match = true;
                        }
                    }
                    if (!local_match){
                        match = false;
                    }
                }
                // check food pairing match
                if (pairing!=''){
                    let pairings = beer.food_pairing;
                    let local_match = false;
                    for (var j=0; j<pairings.length && !local_match; j++){
                        if (pairings[j].toLowerCase().indexOf(pairing)!=-1){
                            local_match = true;
                        }
                    }
                    if (!local_match){
                        match = false;
                    }
                }
                if (match){
                    potential_matches.push(beer.id);
                }
            }
        })

        .fail(function() {
            alert("Something went wrong. Please contact us with details.");
        })

        .then(function() {
            // Hide search panel
            search_panel.slideUp();
            $("#toggle_search").attr("src","./resources/icons/expand.png");
            // Clear old table if not empty
            if (results_table[0].getElementsByTagName("tr").length > 1) {
                $("#results_table tbody").remove();
                var tbody = document.createElement("tbody");
                $(tbody).appendTo(results_table);
            }

            for (var i = 0; i < potential_matches.length; i++){
                //had to wrap the ajax call in a function so that the timing worked
                //with the value for index i
                (function(i) {
                    $.ajax({
                    type:'GET',
                    url: 'https://api.punkapi.com/v2/beers/' + potential_matches[i],
                    success:function(data){
                        // gotta include this i index in the row
                        var row=document.createElement("tr");
                        var cell1 = document.createElement("td");
                        var cell2 = document.createElement("td");
                        cell1.onclick = function() {
                            showMoreResults(potential_matches[i]);
                        };
                        cell2.onclick = function() {
                            showMoreResults(potential_matches[i]);
                        };
                        var cell3 = document.createElement("td");
                        var cell4 = document.createElement("td");
                        cell3.setAttribute("id", "rating_id" + i);
                        var textnode1=document.createTextNode(data[0].name);
                        var textnode2=document.createTextNode(data[0].tagline);
                        var total = 0
                        $.getJSON('/ratings', {"beerid":potential_matches[i]}, function(results) {
                            try{
                                $.each(results, function (index) {
                                    total += results[index].rating;
                                })
                                var avg = total / results.length;
                                if (results[0].beerid == potential_matches[i]) {
                                    document.getElementById("rating_id" + i).innerHTML = avg;
                                }
                            }catch(e){
                                console.log("No ratings for that beer");
                            }
                        });
                        var btn = document.createElement('input');
                        btn.type = "button";
                        btn.className = "send";
                        btn.setAttribute("id", "button_id" + i);
                        var textnode3 = document.createTextNode("No ratings yet");
                        var textfield = document.createElement('input');                                
                        textfield.type = "text";
                        //update current ratings
                        $.getJSON('/my_ratings', {"username":current_user}, function(results) {
                            $.each(results, function (index) {
                                current_ratings.push(results[index].beerid)
                            });
                        });
                        //if user has never rated the beer before
                        if (!current_ratings.includes(potential_matches[i])) {
                            btn.value = "Add";
                            textfield.name = "No Ratings Yet"
                            textfield.placeholder = "Add a Rating"
                            textfield.setAttribute("id", "textfield_id" + i);
                            cell3.appendChild(textnode3);
                            var div = document.createElement('div');
                            div.appendChild(textfield);
                            cell4.appendChild(btn);
                            cell4.appendChild(div);
                            btn.onclick = (function() {
                                if (textfield.value > 5 || textfield.value < 1) {
                                    alert("Please enter a rating between 1 and 5");
                                }
                                else {
                                    if (current_user) {
                                        $.ajax({
                                            type: 'POST',
                                            url: '/ratings',
                                            data: {
                                                "username":current_user, 
                                                "beerid": potential_matches[i], 
                                                "rating":textfield.value},
                                            success: function(data) {
                                                console.log("success");
                                                //refresh the cell
                                                $.getJSON('/ratings', {"beerid":potential_matches[i]}, function(results2) {
                                                    total = 0;
                                                    $.each(results2, function (index) {
                                                        total += results2[index].rating;
                                                    })
                                                    var avg = total / results2.length;
                                                    if (results2[0].beerid == potential_matches[i]) {
                                                        document.getElementById("rating_id" + i).innerHTML = avg;
                                                    }
                                                });
                                            },
                                            failure: function(errMsg) {alert(errMsg);}
                                        });
                                    }
                                    else {
                                        alert("Please log in to rate a beer");
                                    }
                                // change button onclick
                                btn.value = "Change";
                                textfield.name = "No Ratings Yet"
                                textfield.placeholder = "Change Your Rating"
                                textfield.setAttribute("id", "textfield_id" + i);
                                cell3.appendChild(textnode3);
                                var div = document.createElement('div');
                                div.appendChild(textfield);
                                cell4.appendChild(btn);
                                cell4.appendChild(div);
                                btn.onclick = (function() {
                                    if (textfield.value > 5 || textfield.value < 1) {
                                        alert("Please enter a rating between 1 and 5");
                                    }
                                    else {
                                        if (current_user) {
                                            $.ajax({
                                                type: 'PUT',
                                                url: '/ratings',
                                                data: {
                                                    "username":current_user, 
                                                    "beerid": potential_matches[i], 
                                                    "rating":textfield.value
                                                },
                                                success: function() {
                                                    console.log("success");
                                                },
                                                failure: function(errMsg) {alert(errMsg);}
                                            });
                                        }
                                        else {
                                            alert("Please log in to rate a beer");
                                        }
                                        //refresh the cell
                                        $.getJSON('/ratings', {"beerid":potential_matches[i]}, function(results2) {
                                            total = 0;
                                            $.each(results2, function (index) {
                                                total += results2[index].rating;
                                            })
                                            var avg = total / results2.length;
                                            if (results2[0].beerid == potential_matches[i]) {
                                                document.getElementById("rating_id" + i).innerHTML = avg;
                                            }
                                        });
                                    // $('#button_id' + i).hide();
                                    // $('#textfield_id' + i).hide();
                                    }
                                });
                                }
                            });
                        }
                        //if user has already rated the beer before
                        else {
                            btn.value = "Change";
                            textfield.name = "No Ratings Yet"
                            textfield.placeholder = "Change Your Rating"
                            textfield.setAttribute("id", "textfield_id" + i);
                            cell3.appendChild(textnode3);
                            var div = document.createElement('div');
                            div.appendChild(textfield);
                            cell4.appendChild(btn);
                            cell4.appendChild(div);
                            btn.onclick = (function() {
                                if (textfield.value > 5 || textfield.value < 1) {
                                    alert("Please enter a rating between 1 and 5");
                                }
                                else {
                                    if (current_user) {
                                        $.ajax({
                                            type: 'PUT',
                                            url: '/ratings',
                                            data: {
                                                "username":current_user, 
                                                "beerid": potential_matches[i], 
                                                "rating":textfield.value
                                            },
                                            success: function() {
                                                console.log("success");
                                            },
                                            failure: function(errMsg) {alert(errMsg);}
                                        });
                                    }
                                    else {
                                        alert("Please log in to rate a beer");
                                    }
                                    //refresh the cell
                                    $.getJSON('/ratings', {"beerid":potential_matches[i]}, function(results2) {
                                        total = 0;
                                        $.each(results2, function (index) {
                                            total += results2[index].rating;
                                        })
                                        var avg = total / results2.length;
                                        if (results2[0].beerid == potential_matches[i]) {
                                            document.getElementById("rating_id" + i).innerHTML = avg;
                                        }
                                    });
                                // $('#button_id' + i).hide();
                                // $('#textfield_id' + i).hide();
                                }
                            });
                        }
                        cell1.appendChild(textnode1);
                        cell2.appendChild(textnode2);
                        row.appendChild(cell1);
                        row.appendChild(cell2);
                        row.appendChild(cell3);
                        row.appendChild(cell4);
                        row.setAttribute("id", potential_matches[i]);
                        $(row).appendTo($("#results_table"));
                        }
                    });$('#results_table').show();
                })(i);
            }          
        });
    });


    my_ratings.click(function() {
        results_table.hide();
        detailed_results.hide();
        // Clear old table if not empty
        if (my_ratings_table[0].getElementsByTagName("tr").length > 1) {
            $("#my_ratings_table tbody").remove();
            var tbody = document.createElement("tbody");
            $(tbody).appendTo(my_ratings_table);
        }
        my_ratings_table.show();
        $.getJSON('/my_ratings', {"username":current_user}, function(results) {
            if (results.length == 0) {
                my_ratings_table.hide();
                $('.no_ratings').show();
            } else {
                for (var i = 0; i < results.length; i++){
                //had to wrap the ajax call in a function so that the timing worked
                //with the value for index i
                    (function(i) {
                        $.ajax({
                        type:'GET',
                        url: 'https://api.punkapi.com/v2/beers/' + results[i].beerid,
                        success:function(data){
                            // gotta include this i index in the row
                            var row=document.createElement("tr");
                            var cell1 = document.createElement("td");
                            var cell2 = document.createElement("td");
                            cell1.onclick = function() {
                                showMoreResults(potential_matches[i]);
                            };
                            cell2.onclick = function() {
                                showMoreResults(potential_matches[i]);
                            };
                            var cell3 = document.createElement("td");
                            cell3.setAttribute("id", "my_rating_id" + i);
                            var textnode1=document.createTextNode(data[0].name);
                            var textnode2=document.createTextNode(data[0].tagline);
                            var textnode3=document.createTextNode("No ratings yet");
                            var btn = document.createElement('input');
                            btn.type = "button";
                            btn.className = "send";
                            btn.value = "Change";
                            btn.setAttribute("id", "button_id" + i);
                            var deletebtn = document.createElement('input');
                            deletebtn.type = "button";
                            deletebtn.className = "send";
                            deletebtn.value = "Delete";
                            var textfield = document.createElement('input');                                
                            textfield.type = "text";
                            textfield.name = "Current Rating"
                            var total = 0
                            //Get Rating
                            $.getJSON('/ratings', {"beerid":results[i].beerid}, function(results2) {
                                try{
                                    if (results2[0].beerid == results[i].beerid) {
                                        textfield.value = results2[0].rating;
                                        textfield.placeholder = textfield.value;
                                    }
                                }catch(e){
                                   console.log("No ratings for that beer");
                                }
                            });
                            //Edit rating
                            btn.onclick = (function() {
                                if (textfield.value > 5 || textfield.value < 1) {
                                    alert("Please enter a rating between 1 and 5");
                                }
                                else {
                                    if (current_user) {
                                        $.ajax({
                                            type: 'PUT',
                                            url: '/ratings',
                                            data: {
                                                "username":current_user, 
                                                "beerid": results[i].beerid, 
                                                "rating":textfield.value
                                            },
                                            success: function() {
                                                console.log("success");
                                                //refresh the cell
                                                $.getJSON('/ratings', {"beerid":potential_matches[i]}, function(results2) {
                                                    $.each(results2, function (index) {
                                                        total += results2[index].rating;
                                                    })
                                                    var avg = total / results2.length;
                                                    if (results2[0].beerid == potential_matches[i]) {
                                                        document.getElementById("rating_id" + i).innerHTML = avg;
                                                    }
                                                });
                                            },
                                            failure: function(errMsg) {alert(errMsg);}
                                        });
                                    }
                                    else {
                                        alert("Please log in to rate a beer");
                                    }
                                    textfield.placeholder = "Rating Changed to " + textfield.value;
                                    textfield.value = "";
                                }
                            });
                            //Delete rating
                            deletebtn.onclick = (function() {
                                console.log("Beleted");
                                $.ajax({
                                    type: 'DELETE',
                                    url: '/ratings',
                                    data: {
                                        "username":current_user, 
                                        "beerid": results[i].beerid
                                        // "rating":textfield.value
                                    },
                                    success: function() {
                                        console.log("success")
                                    },
                                    failure: function(errMsg) {alert(errMsg);}
                                });
                                textfield.value = "";
                                textfield.placeholder = "Deleted";
                            });
                            cell1.appendChild(textnode1);
                            cell2.appendChild(textnode2);
                            cell3.appendChild(textfield);
                            cell3.appendChild(btn);
                            cell3.appendChild(deletebtn);
                            row.appendChild(cell1);
                            row.appendChild(cell2);
                            row.appendChild(cell3);
                            row.setAttribute("id", results[i].beerid);
                            $(row).appendTo(my_ratings_table);
                            }
                        });
                    })(i);
                }  
                my_ratings_table.show();
            }
        });
    });

    function getMethods(data) {
    	method_table = document.createElement("table");
        method_table.setAttribute("border", 1);
    	$.each(data, function(key, value) {
    	    var row=document.createElement("tr");
    	    var cell1=document.createElement("td");
    	    var cell2=document.createElement("td");
    	    var textnode1=document.createTextNode(key);
    	    cell1.appendChild(textnode1);
    	    if (key == "mash_temp") {
        		var method_sub_table=document.createElement("table");
        		var temperature=value[0].temp.value + " " + value[0].temp.unit
        		var row1="<tr><td>temp:</td><td>"+temperature+" </td></tr>";
                var duration = value[0].duration + " hours";
        		var row2="<tr><td>duration:</td><td>"+duration+"</td></tr>";
        		$(method_sub_table).append(row1);
        		$(method_sub_table).append(row2);
        		cell2.appendChild(method_sub_table);
    	    } else if (key == "fermentation") {
        		var method_sub_table=document.createElement("table");
        		var temperature=value.temp.value + " " + value.temp.unit;
        		var row1="<tr><td>temp:</td><td>"+temperature+"</td></tr>";
        		$(method_sub_table).append(row1);
        		cell2.appendChild(method_sub_table);
    	    } else {
        		var textnode2=document.createTextNode(value);
        		cell2.appendChild(textnode2);
    	    }
    	    row.appendChild(cell1);
    	    row.appendChild(cell2);
    	    $(method_table).append(row);
    	});
    	return method_table
    }

    function getNestedTable(data) {
    	nested_table = document.createElement("table");
    	$.each(data, function(key, value) {
    	    var row = "<tr></tr>" + key + "</th><td>" + value + "</td></tr>"
    	    $(nested_table).append(row)
    	});
    	return nested_table;
    }
    
    function getMalt(data) {
    	list_table = document.createElement("table")
    	var headRow = "<tr><td>name</td><td>amount</td></tr>";
    	$(list_table).append(headRow);

    	var i = 0;
    	$(data).each(function() {
    	    var igname = $(data)[i].name;
    	    var amount = $(data)[i].amount.value + " " + $(data)[i].amount.unit;
    	    i++;
    	    var rowHTML = "<tr><td>"+igname+"</td><td>"+amount+"</td></tr>";
    	    $(list_table).append(rowHTML);
    	});
    	return list_table;
    }

    function getHop(data) {
    	list_table = document.createElement("table")
    	var headRow = "<tr><td>name</td><td>amount</td><td>add</td><td>attribute</td></tr>";
    	$(list_table).append(headRow);

    	var i = 0;
    	$(data).each(function() {
    	    var igname = $(data)[i].name;
    	    var amount = $(data)[i].amount.value + " " + $(data)[i].amount.unit;
    	    var add = $(data)[i].add;
    	    var attribute = $(data)[i].attribute;
    	    i++;
    	    var rowHTML = "<tr><td>"+igname+"</td><td>"+amount+"</td><td>"+add+"</td><td>"+attribute+"</td></tr>";
    	    $(list_table).append(rowHTML);
    	});
    	return list_table;
    }

    function getIngredients(data) {
    	major_ingredient_table = document.createElement("table");
        major_ingredient_table.setAttribute("border", 1);
    	$.each(data, function(key, value) {
    	    ingredient_malt_table = getMalt(value);
    	    ingredient_hop_table = getHop(value);
    	    var row=document.createElement("tr");
    	    var cell1=document.createElement("td");
                var cell2=document.createElement("td");
                var textnode1=document.createTextNode(key);
    	    if (key == "yeast") {
    		var textnode2=document.createTextNode(value);
    		cell1.appendChild(textnode1);
                    cell2.appendChild(textnode2);
                    row.appendChild(cell1);
                    row.appendChild(cell2);
    	        $(major_ingredient_table).append(row);
    	    } else if (key == "hops"){
                    cell1.appendChild(textnode1);
                    cell2.appendChild(ingredient_hop_table);
                    row.appendChild(cell1);
                    row.appendChild(cell2);
    	        $(major_ingredient_table).append(row);
    	    } else if (key == "malt"){
    		cell1.appendChild(textnode1);
                    cell2.appendChild(ingredient_malt_table);
                    row.appendChild(cell1);
                    row.appendChild(cell2);
    	        $(major_ingredient_table).append(row);
    	    }
    	});
    	return major_ingredient_table;
    }

    function showMoreResults(x) {
        $('#results_table').slideUp();
        // var x = row.id;
        $("#detailed_results tr").remove();
        $.ajax({
            type:'GET',
            url:'https://api.punkapi.com/v2/beers/' + x,
            success:function(data) {
        		$.each(data[0], function(key, value) {
        		    if (key == "id") {
        		    } else if (key == "volume" || key == "boil_volume") {
            			var volume_table=getNestedTable(value)
            			var row=document.createElement("tr");
                        var cell1 = document.createElement("td");
                        var cell2 = document.createElement("td");
                        var textnode1=document.createTextNode(key);
                        cell1.appendChild(textnode1);
                        cell2.appendChild(volume_table);
                        row.appendChild(cell1);
                        row.appendChild(cell2);
        			$(row).appendTo($("#detailed_results"));
        		    } else if (key == "ingredients") {
            			var ingredient_table=getIngredients(value)
            			var row=document.createElement("tr");
                        var cell1 = document.createElement("td");
                        var cell2 = document.createElement("td");
                        var textnode1=document.createTextNode(key);
                        cell1.appendChild(textnode1);
                        cell2.appendChild(ingredient_table);
                        row.appendChild(cell1);
                        row.appendChild(cell2);
        			$(row).appendTo($("#detailed_results"));
        		    } else if (key == "method") {
            			var method_table=getMethods(value)
            			var row=document.createElement("tr");
                        var cell1 = document.createElement("td");
                        var cell2 = document.createElement("td");
                        var textnode1=document.createTextNode(key);
                        cell1.appendChild(textnode1);
                        cell2.appendChild(method_table);
                        row.appendChild(cell1);
                        row.appendChild(cell2);
        			$(row).appendTo($("#detailed_results"));
        		    } else {
            			var row=document.createElement("tr");
                        var cell1 = document.createElement("td");
                        var cell2 = document.createElement("td");
                        var textnode1=document.createTextNode(key);
                        var textnode2=document.createTextNode(value);
                        cell1.appendChild(textnode1);
                        cell2.appendChild(textnode2);
                        row.appendChild(cell1);
                        row.appendChild(cell2);
        			$(row).appendTo($("#detailed_results"));
        		    }
                });
	        }
	    });
        $('#detailed_results').show();
        my_ratings_table.hide();
	}
});

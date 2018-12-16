var stompClient = null;

$(document).ready(function()
{
    
    $("#simulation").submit(function(event) {

		// Prevent the form from submitting via the browser.
		event.preventDefault();
		
		disableForm(true);
		var data = {};
		prefex = '';
		$(this).find(":input").each(function() {
			if($(this).val() != "" && this.name != "")
			{
				data[this.name] = $(this).val();
			}
		});
		
		$.ajax({
			type : "POST",
			contentType : "application/json",
			url : "/start-simulation",
			data : JSON.stringify(data),
			dataType : 'json',
			timeout : 100000,
			success : function(response) {
				
				if(response.status === 'SUCCESS'){
					connect();
					disableForm(true);
				}else{
					errorInfo = "";
					for(i =0 ; i < response.result.length ; i++){
						errorInfo += "<br>" + (i + 1) +". " + response.result[i].defaultMessage;
					}
					disableForm(false);
					$('#error').html("Please correct following errors: " + errorInfo);
					$('#error').show('slow');
				}
				
			},
			error : function(e) {
				disableForm(false);
				$('#error').html(e);
				$('#error').show();
			}
		});

	});
    
});


function disableForm(bool){
	$("#simulation :input").prop("disabled", bool);
	$('#contentprocessbar').show();
}



function connect(){
	
	//console.log("Connecting to SockJS");
    var socket = new SockJS('/sim-status');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, function(frame){
        
    	stompClient.subscribe('/initial', function (messageOutput){
            //console.log("INITIAL: " + messageOutput);
            var progressList = $.parseJSON(messageOutput.body);
            $.each(progressList,function(index, element){
                update(element);
            });
        });

        stompClient.subscribe('/simulation/sim-status', function(messageOutput) {
            //console.log("New Message: " + messageOutput);
            var messageObject = $.parseJSON(messageOutput.body);
            updateMessage(messageObject);
        });
    
    });
}

function updateMessage(newMessage)
{
	var rows = $('#processbarContainer').find('#'+newMessage.jobName);
	if(rows.length === 0){
		appendProcessbar(newMessage.jobName);
    }

	//set stuffs
    switch (newMessage.state) {
		case "HOUSEBIGEN":
			break;
		case "HOUSESTATE":
			var rows = $('#processbarContainer').find("#hose");
			if(rows.length === 0){
				appendProcessbar("hose");
		    }
			$("#hose").removeClass("active info success").addClass("active");
			$("#hose").find('.progress-bar').html(newMessage.progress +"%");
			$('#hose').find('small').html(newMessage.progress +"%");
			$("#hose").find('.progress-bar').css('width',newMessage.progress+'%').attr("aria-valuenow",newMessage.progress);
			break;
		case "HOUSEFINISH":
			$("#hose").remove();
			break;
		case "STATE":
			$('#'+newMessage.jobName).find('.progress-bar').html(newMessage.progress +"%");
			$('#'+newMessage.jobName).find('small').html(newMessage.progress +"%");
			$('#'+newMessage.jobName).find('.progress-bar').css('width',newMessage.progress+'%').attr("aria-valuenow",newMessage.progress);
			break;
		case "DONE":
			$('#'+newMessage.jobName).removeClass("active info success").addClass("success");
			break;
	}
    //end set stuffs
}


function appendProcessbar(id){
	$('#processbarContainer').append(
			'<div id="'+ id +'">' +
				'<div class="clearfix"> <span class="pull-left">State of ' + id +'</span> <small class="pull-right">0%</small></div>'+
				'<div class="progress">'+
					'<div class="progress-bar progress-bar-green" role="progressbar" aria-valuenow="" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em;">0%</div>'+
				'</div>' +
			'</div>'
		);
}


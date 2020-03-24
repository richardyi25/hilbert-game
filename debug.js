function cssDebug(){
	$("#outer *").css({backgroundColor: "rgba(0, 0, 0, 0.3)", border: "1px solid black", boxSizing: "border-box"});
}

print = console.log;

$(document).ready(function(){
	$(document).keydown(function(e){ if(e.which == 192) cssDebug(); });
	//$(document).dblclick(cssDebug);
});

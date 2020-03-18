var theorems = [
	["S", [["a", "b", "c"], [["a", "b"], ["a", "c"]]]],
	["K", ["a", ["b", "a"]]]
];
var mode = "normal";
var thm1, thm2, thm3;
var sub1 = {}, sub2 = {};
/*
Modes:
Normal mode   - Waiting for Apply, Delete, Rename, Specific
Apply mode    - Waiting for Sub, Done, Quit
Specific mode - Waiting for Sub, Done, Quit
Confrim mode  - Waiting for yes/no
*/

// Side effects only
// Takes the value of #input as input and interprets it as a command
const normalCom = ["a", "apply", "d", "delete", "r", "rename", "s", "specific"];

function error(msg){
	$("#error").text("Error: " + msg);
}

function findThm(thm){
	return theorems.filter(pair => pair[0] == thm).length > 0;
}

function checkThm(thm){
	if(!findThm(thm)){
		error("Theorem " + thm + " not found");
		return false;
	}
	return true;
}

function checkNewThm(thm){
	if(findThm(thm)){
		error("Theorem " + thm + " is already taken");
		return false;
	}
	thm = thm.toLowerCase();
	for(var i = 0; i < thm.length; i++){
		var code = thm.charCodeAt(i);
		if(code < 48 || code > 90 && code < 97 || code > 122){
			error("Invalid character " + thm[i] + " at position " + (i + 1));
			return false;
		}
	}
	return true;
}

function checkEOL(rest){
	if(rest.length >= 2){
		error("Expected end of line, found " + rest.slice(1).join(" ") + " instead");
		return false;
	}
	return true;
}

function deleteThm(thm){
	for(var i = 0; i < theorems.length; i++){
		if(theorems[i][0] == thm){
			theorems.splice(i, 1);
			return true;
		}
	}
	return false;
}

function optional(arr, token){
	if(arr.length == 0) return arr;
	if(arr[0].toLowerCase() == token)
		return arr.slice(1);
	return arr;
}

function checkSymbols(thm){
	for(var i = 0; i < thm.length; i++){
		var ch = thm[i];
		if("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789->→() ".indexOf(ch) == -1){
			error("Invalid character " + thm[i] + " at position " + (i + 1));
			return false;
		}
	}
	return true;
}

function checkBrackets(thm){
	var balance = 0, flag = true;
	for(var i = 0; i < thm.length; i++){
		if(thm[i] == "(") ++balance;
		if(thm[i] == ")") --balance;
		if(balance < 0) flag = false;
	}
	if(balance != 0 || !flag){
		error("Not a valid bracket sequence. Please check your brackets.");
		return false;
	}
	return true;
}

function parseHelp(str, thm){
	var result = [], bucket = "";
	for(; thm < str.length; thm++){
		var ch = str[thm];
		if(ch == "("){
			var tmp = parseHelp(str, thm + 1);
			parsed = tmp[0], newthm = tmp[1];

			bucket = parsed;
			thm = newthm;
		}
		else if(ch == ")"){
			result.push(bucket);
			return [result, thm];
		}
		else if(ch == "→"){
			result.push(bucket);
			bucket = "";
		}
		else bucket += ch;
	}
	result.push(bucket);
	return [result, thm];
}

function parseThm(thm){
	if(!checkSymbols(thm) || !checkBrackets(thm)) return false;
	return parseHelp(thm.replace(/ /g, "").replace(/->/g, "→"), 0)[0];
}

function binarizeThm(t){
	var thm = Array.from(t);
	for(var i = 0; i < thm.length; i++)
		if(Array.isArray(thm[i]))
			thm[i] = binarizeThm(thm[i]);
	while(thm.length > 2){
		var last = thm.length - 1;
		thm[last - 1] = [thm[last - 1], thm[last]];
		thm.pop();
	}
	return thm;
}

function flattenThm(t){
	var thm = Array.from(t);
	for(var i = 0; i < thm.length; i++)
		if(Array.isArray(thm[i]))
			thm[i] = flattenThm(thm[i]);
	while(Array.isArray(thm[thm.length - 1])){
		var last = thm.length - 1;
		var tmp = thm[last];
		thm.pop();
		for(var i = 0; i < tmp.length; i++)
			thm.push(tmp[i]);
	}
	return thm;
}

function stringifyThm(thm){
	var result = "";
	for(var i = 0; i < thm.length; i++){
		if(Array.isArray(thm[i]))
			result += "(" + stringifyThm(thm[i]) + ")";
		else
			result += thm[i];

		if(i < thm.length - 1) result += " → ";
	}
	return result;
}

function render(){
	$("#mode").text(mode[0].toUpperCase() + mode.substr(1, mode.length) + " Mode");
	$("#thms").empty();
	for(var i = 0; i < theorems.length; i++){
		var thm = theorems[i];
		$("#thms").append("<div class=\"thm\"><span class=\"thm-name\">"
			+ thm[0]
			+ ":</span><span class=\"thm-body\">"
			+ stringifyThm(thm[1]) + "</span></div>"
		);
	}

	if(mode == "apply"){
		//var s1 = "<div class
		$("#apply").html
	}
}

function parse(e){
	render();
	if(e.which != 13) return;
	$("#error").empty();
	var line = $("#input").val().split("\n")[0].trim();
	if(line == "") return;
	$("#input").val("");
	if(mode == "normal"){
		var tokens = line.split(" ");
		var first = tokens[0].toLowerCase();
		var rest = tokens.slice(1);
		if(normalCom.indexOf(first) == -1){
			error("Invalid command: " + first + " is not a command");
			return;
		}
		if(first == "apply" || first == "a"){
			if(rest.length == 0){
				error("Unexpected end of line when looking for first theorem name");
				return;
			}
			var t1 = rest[0];
			if(!checkThm(t1)) return;
			rest = optional(rest.slice(1), "to");
			if(rest.length == 0){
				error("Unexpected end of line when looking for second theorem name");
				return;
			}
			var t2 = rest[0];
			if(!checkThm(t2)) return;
			rest = optional(rest.slice(1), "as");
			if(rest.length == 0){
				error("Unexpected end of line when looking for new theorem name");
				return;
			}
			if(!checkEOL(rest)) return;
			var t3 = rest[0];
			if(!checkNewThm(t3)) return;
			mode = "apply";
			thm1 = t1; thm2 = t2; thm3 = t3;
		}
		else if(first == "delete" || first == "d"){
			if(!checkThm(rest[0])) return;
			if(!checkEOL(rest)) return;
			thm1 = rest[0];
			mode = "confirm";
		}
		else if(first == "rename" || first == "r"){
			var t1 = rest[0];
			if(!checkThm(t1)) return;
			rest = optional(rest.splice(1), "to");
			var t2 = rest[0];
			if(!checkNewThm(t2)) return;
			if(!checkEOL(rest)) return;
			thm1 = t1; thm2 = t2;
		}
		else if(first == "specific" || first == "s"){
			if(!checkThm(rest[0])) return;
			if(!checkEOL(rest)) return;
			mode = "specific";
			thm1 = rest[0];
		}
	}
	else if(mode == "apply"){
		
	}
	render();
}

function clear(e){
	if(e.which == 13) $("#input").val("");
}

// Event Binding
$(document).ready(function(){
	$("#input").keydown(parse);
	$("#input").keyup(clear);
	render();
});

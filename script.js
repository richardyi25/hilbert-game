/*
function Theorem(name, body){
	this.name = name;
	this.body = body;
	this.getVarsHelper = function(thm){
		var res = {};
		for(var i = 0; i < thm.length; i++){
			if(Array.isArray(thm[i])){
				var get = getVarsHelper(thm[i]);
				for(var key in get)
					res[key] = true;
			}
			else res[thm[i]] = true;
		}
		return res;
	}
	this.getVars = function(thm){
		return Object.keys(getVarsHelper(thm)).sort();
	}
	this.vars = this.getVars(body);
}
*/

var theorems = [
	["S", [["a", "b", "c"], [["a", "b"], ["a", "c"]]], ["a", "b", "c"]],
	["K", ["a", ["b", "a"]], ["a", "b"]]
]; // Current list of theorems
var mode = "normal";
var thm1, thm2, thm3; // Working theorems (like registers)

var sub1 = {}, sub2 = {};
var log = [];
var arrowPtr; // What the current command is displaying, changed when arrow keys or enter is pressed

/*
We judge a function's purity extensionally, that is, if it doesn't modify arguments or produce
side effects and always returns the same output for the same input, it is considered pure
regardless of its interal implementation
*/

/* Pure, string -> array of string
Takes a string, turns all whitespace into spaces, and trims
Then splits by space but treats multiple spaces as one
*/
function tokenize(str){
	str = str.replace(/\t/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();
	var res = [], bucket = "";
	for(var i = 0; i < str.length; i++){
		if(str[i] == " "){
			while(str[i] == " ") ++i;
			--i;
			res.push(bucket);
			bucket = "";
		}
		else bucket += str[i];
	}
	res.push(bucket);
	return res;
}

/* Side Effects Only, string -> void
Display an error message onto the document
*/
function error(msg){
	$("#error").text("Error: " + msg);
}

/* Impure without side effects, string -> boolean
Returns true if the theorem name is found in the lookup table
*/
function findThm(thm){
	return theorems.filter(pair => pair[0] == thm).length > 0;
}

// Assumes thm exists
function getThm(thm){
	return theorems.filter(pair => pair[0] == thm)[0];
}

/* Impure with side effects, string -> boolean
Display an error and returns false if a theorem isn't found
*/
function checkThm(thm){
	if(!findThm(thm)){
		error("Theorem " + thm + " not found");
		return false;
	}
	return true;
}

function checkNewThm(thm){
	if(thm.length > 32){
		error("Theorem name too long");
		return false;
	}
	if(findThm(thm)){
		error("Theorem " + thm + " is already taken");
		return false;
	}
	thm = thm.toLowerCase();
	for(var i = 0; i < thm.length; i++){
		var code = thm.charCodeAt(i);
		if(code < 48 || code > 57 && code < 65 || code > 90 && code < 97 || code > 122){
			error("Invalid character " + thm[i] + " at position " + (i + 1));
			return false;
		}
	}
	return true;
}

function checkVar(varlist, varname){
	for(var i = 0; i < varlist.length; i++)
		if(varname == varlist[i])
			return true;

	error("Variable " + varname + " not found");
	return false;
}

function checkEmpty(rest){
	if(rest.length == 0){
		error("Unexpected end of line");
		return false;
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
	for(var i = 2; i < theorems.length; i++){
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
			if(!tmp) return false;
			parsed = tmp[0], newthm = tmp[1];

			bucket = parsed;
			thm = newthm;
		}
		else if(ch == ")"){
			result.push(bucket);
			return [result, thm];
		}
		else if(ch == "→"){
			if(!bucket) return false;
			result.push(bucket);
			bucket = "";
		}
		else bucket += ch;
	}
	result.push(bucket);
	return [result, thm];
}

function removeNestThm(t){
	var thm = Array.from(t);
	for(var i = 0; i < thm.length; i++){
		if(Array.isArray(thm[i])){
			thm[i] = removeNestThm(thm[i]);
			if(thm[i].length == 1)
				thm[i] = thm[i][0];
		}
	}
	return thm;
}

function parseThm(thm){
	if(!checkSymbols(thm) || !checkBrackets(thm)) return false;
	var res = parseHelp(thm.replace(/ /g, "").replace(/->/g, "→"), 0);
	if(!res){
		error("Expected variable while parsing");
		return false;
	}
	return removeNestThm(res[0]);
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

function subHelp(t, sub){
	var thm = Array.from(t);
	for(var i = 0; i < thm.length; i++){
		if(Array.isArray(thm[i]))
			thm[i] = subHelp(thm[i], sub);
		else if(thm[i] in sub){
			thm[i] = sub[thm[i]];
		}
	}
	return thm;
}

function subThm(thm, sub){
	return removeNestThm(subHelp(thm, sub));
}

function cmpThm(thm1, thm2){
	if(thm1.length != thm2.length) return false;
	for(var i = 0; i < thm1.length; i++){
		if(Array.isArray(thm1[i]) && Array.isArray(thm2[i])){
			if(!cmpThm(thm1[i], thm2[i])) return false;
			else continue;
		}
		else if(thm1[i] !== thm2[i])
			return false;
	}
	return true;
}

function getVarsHelper(thm){
	var res = {};
	for(var i = 0; i < thm.length; i++){
		if(Array.isArray(thm[i])){
			var get = getVarsHelper(thm[i]);
			for(var key in get)
				res[key] = true;
		}
		else res[thm[i]] = true;
	}
	return res;
}

function getVars(thm){
	return Object.keys(getVarsHelper(thm)).sort();
}

function saveProgress(){
	document.cookie = "progress=" + log.join("|");
}

function padRight(str, len){
	for(var i = str.length; i < len; i++)
		str += " ";
	return str;
}

function render(){
	$("#mode").text(mode[0].toUpperCase() + mode.substr(1, mode.length) + " Mode");
	$("#thms").empty();

	var maxlen = 0;
	for(var i = 0; i < theorems.length; i++)
		maxlen = Math.max(maxlen, theorems[i][0].length);

	for(var i = 0; i < theorems.length; i++){
		var thm = theorems[i];
		$("#thms").append("<div class=\"thm\">"
			+ padRight(thm[0] + ":", maxlen + 2) + stringifyThm(binarizeThm(thm[1])) + "</div>"
		);
	}

	if(mode == "apply"){
		var t1 = thm1[0], t2 = thm2[0];
		if(t1 == t2) t2 += "_";
		maxlen = Math.max(t1.length, t2.length);
		$("#apply").html("<div class=\"thm\">" + padRight(t1 + ":", maxlen + 2) +
			stringifyThm(binarizeThm(subThm(thm1[1], sub1))) + "</div><div class = \"thm\">" +
			padRight(t2 + ":", maxlen + 2) + stringifyThm(binarizeThm(subThm(thm2[1], sub2))) + "</div>");
	}
	else if(mode == "specific"){
		$("#apply").html("<div class=\"thm\">" + thm1[0] + ":  " + stringifyThm(binarizeThm(subThm(thm1[1], sub1))) + "</div>");
	}
	else $("#apply").empty();
}

function parse(line, logLines){
	var tokens = tokenize(line);
	var firstOriginal = tokens[0];
	var first = firstOriginal.toLowerCase();
	var rest = tokens.slice(1);

	if(mode == "normal"){
		if(first == "apply" || first == "a"){
			if(!checkEmpty(rest)) return;
			var t1 = rest[0];
			if(!checkThm(t1)) return;
			rest = optional(rest.slice(1), "to");
			if(!checkEmpty(rest)) return;
			var t2 = rest[0];
			if(!checkThm(t2)) return;
			rest = optional(rest.slice(1), "as");
			if(!checkEmpty(rest)) return;
			//if(!checkEOL(rest)) return;
			var t3 = rest[0];
			if(!checkNewThm(t3)) return;
			mode = "apply";
			thm1 = getThm(t1);
			thm2 = getThm(t2);
			thm3 = t3;
			sub1 = {};
			sub2 = {};
		}
		else if(first == "delete" || first == "d"){
			if(!checkThm(rest[0])) return;
			//if(!checkEOL(rest)) return;
			thm1 = rest[0];
			mode = "confirm";
		}
		else if(first == "rename" || first == "r"){
			var t1 = rest[0];
			if(!checkThm(t1)) return;
			rest = optional(rest.splice(1), "to");
			var t2 = rest[0];
			if(!checkNewThm(t2)) return;
			//if(!checkEOL(rest)) return;
			thm1 = getThm(t1);
			thm2 = t2;
			thm1[0] = t2;
		}
		else if(first == "specific" || first == "s"){
			if(!checkThm(rest[0])) return;
			thm1 = getThm(rest[0]);
			rest = optional(rest.slice(1), "as");
			if(!checkEmpty(rest)) return;
			if(!checkNewThm(rest[0])) return;
			mode = "specific";
			thm2 = rest[0];
			sub1 = {};
		}
		else{
			error(firstOriginal + " is not a command");
			return;
		}
	}
	else if(mode == "apply"){
		if(first == "sub" || first == "s"){
			var t1 = thm1[0], t2 = thm2[0];
			if(t1 == t2) t2 += "_";
			rest = optional(rest, "in");
			var id = rest[0];
			if(id != "1" && id != "2" && id != t1 && id != t2){
				error("Invalid theorem " + id + ". Please enter 1, 2, or a theorem name");
				return;
			}
			var thm;
			if(id == "1" || id == "2") thm = id == "1" ? thm1 : thm2;
			else thm = id == t1 ? thm1 : thm2;
			var varname = rest[1];
			if(!checkVar(thm[2], varname)) return;
			rest = optional(rest.slice(1), "with");
			var exp = rest.slice(2).join(" ");
			var newThm = parseThm(exp);
			if(!newThm) return;
			var sub;
			if(id == "1" || id == "2") sub = id == "1" ? sub1 : sub2;
			else sub = id == t1 ? sub1 : sub2;
			sub[varname] = newThm;
		}
		else if(first == "done" || first == "d"){
			var t1 = binarizeThm(subThm(thm1[1], sub1));
			var t2 = binarizeThm(subThm(thm2[1], sub2));
			if(t1.length == 1){
				error("First theorem is too short");
				return;
			}
			if(!cmpThm(t1[0], t2)){
				error("Cannot apply theorems");
				return;
			}
			theorems.push([
				thm3,
				t1[1],
				getVars(t1[1])
			]);
			mode = "normal";
		}
		else if(first == "quit" || first == "q"){
			mode = "normal";
		}
		else{
			error(firstOriginal + " is not a command");
			return;
		}
	}
	else if (mode == "specific"){
		if(first == "sub" || first == "s"){
			var varname = rest[0];
			rest = optional(rest.slice(1), "with");
			if(!checkVar(thm1[2], varname)) return;
			var exp = rest.join(" ");
			var newThm = parseThm(exp);
			if(!newThm) return;
			sub1[varname] = newThm;
		}
		else if(first == "done" || first == "d"){
			var t1 = subThm(thm1[1], sub1);
			theorems.push([thm2, t1, getVars(t1)]);
			mode = "normal";
		}
		else if(first == "quit" || first == "q"){
			mode = "normal"; // reset variables?
		}
		else{
			error(firstOriginal + " is not a command");
			return;
		}
	}
	else if(mode == "confirm"){
		//if(!checkEOL(tokens)) return;
		if(first == "yes" || first == "y"){
			if(!deleteThm(thm1)){
				error("Cannot delete axiom");
				return;
			}
			mode = "normal";
		}
		else if(first == "no" || first == "n"){
			mode = "normal";
		}
		else{
			error("Please enter yes/no");
			return;
		}
	}
	render();
	if(logLines) log.push(line);
	saveProgress();
	return true;
}


function loadProgress(){
	// This breaks if there is a cookie called "progress" from other sites on this domain
	var cookies = document.cookie.split("; "), progress;
	for(var i = 0; i < cookies.length; i++){
		var cookie = cookies[i];
		if(cookie.indexOf("=") == -1) continue;
		var tokens = cookie.split("=");
		if(tokens[0] == "progress") progress = tokens[1];
	}

	if(!progress) return;
	var tmp = progress.split("|");
	log = Array.from(tmp);
	for(var i = 0; i < log.length; i++){
		if(!parse(log[i], false))
			console.log(log[i]);
	}
	arrowPtr = log.length;
}

function loadCommand(){
	if(arrowPtr >= log.length){
		arrowPtr = log.length;
		$("#input").val("");
		return;
	}
	if(arrowPtr < 0){
		arrowPtr = 0;
	}
	$("#input").val(log[arrowPtr]);
}

// Event Binding
$(document).ready(function(){
	$(document).keydown(function(e){
		if(e.which == 13){ // enter
			arrowPtr = log.length;
			e.preventDefault();
			$("#error").empty();
			var line = $("#input").val();
			if(line == "") return;
			if(parse(line, true)){
				$("#input").val("");
				$("#input").css("background-color", "");
			}
			else{
				$("#input").css("background-color", "#FFAAAA");
			}
			arrowPtr = log.length;
		}
		else if(e.which == 38){ // up arrow
			--arrowPtr;
			loadCommand();
		}
		else if(e.which == 40){ // down arrow
			++arrowPtr;
			loadCommand();
		}
		else
			$("#input")[0].focus();
	});

	render();
	loadProgress();
});

'use strict'

var text='apple-score, pie';
var text2='apple';
var arr= text.split(",");
var arr2= text2.split(",");
var a=[];
console.log(a.indexOf(""));

console.log(splitString(text,","));
console.log(splitString(text2,","));
if(splitString(text,",").indexOf("pie")>-1){
	console.log("hello");
}
console.log(splitString(text,",").indexOf("apple"));


function splitString(string,delimeter){
	var textArr= string.split(delimeter);
	var arr=[];
	for(let elem of textArr){
		arr.push(elem.trim());
	}
	return arr;
}
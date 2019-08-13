'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var async = require('async');
var GoogleSpreadsheet = require('google-spreadsheet');
var apiai = require('apiai');
var Promise= require('promise');

var app1 = apiai("a3c9ba4ed4ba41ffa4b8a5e18dc120b8");




//google sheet id
var termSheet="";
var authorSheet="";
var doc = new GoogleSpreadsheet('12GhaeoSgaBUTy6g8BLeKNA9Xmp7UszpWD5heOUb-bIw');
var sheet;

var sheetAuthorID='1Fh7BMclhZbxiSpoc_DwDF4uwpvxC44TQhkbZ77K1JLc';
var sheetTermsID='1F2u1dncLs7ZCSnnjb9HvwY1axltXwq-sGDb60RK_B1k';
// var doc = new GoogleSpreadsheet('1Sbv9hV9INcUmmLbRSuZEnxThOjik2YWv4jwMV6eZbus');
// var doc2= new GoogleSpreadsheet('12GhaeoSgaBUTy6g8BLeKNA9Xmp7UszpWD5heOUb-bIw');
var sheetAuthors;
var sheetTerms;
var docAuthors;
var docTerms;

var queue=[];
app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('<h2>Privacy Policy</h2><ul><li>We respect your privacy. We won’t use your E-mail id and name other than sending you news letter ( if you have subscribed ) or contact you in reference to any issue which is currently open or was open in past between you and TeraBug.</li><li>We won’t share your personal data e.g. E-mail id, Contact Number with any third party which is not related with our application</li><li>We display some paid advertisement on the website,which may lead you to some external website.We are not responsible for the content of the external website.</li><li>Google, one of our third-party advertisers, may add a cookie to determine targeted advertisements based on your preferences and your visit to our site and other sites on the internet. You can choose to opt out of Google’s use of cookies by visiting the Google ad and content network privacy policy.</li></ul>')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	console.log(messaging_events);
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			if (text === 'Generic'){ 
				console.log("welcome to chatbot")
				sendGenericMessage(sender)
				continue
			}
			
			if(event.message.is_echo==undefined || event.message.is_echo==false){
				showMessageBubble(sender);
				saveTextMessage(sender,text);
				handleMessage();}
			if(event.message.is_echo==true){
				console.log("echo message");
			}
			// sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAAEQwLpnPzUBAEnClWW7SRZBjzT1bPrKh8FlJynfMMkwfYFtqPOzx0ipHWcoJyD6nWv4HCXzn9m5d8Tifj5UJqTld7naGYhUjpiX9p938ZCBZB2WhHPbAz5MLSJ6gG4thA8NmzM02z3HrBMfBXAV0TVXyZCHpqXmWwVdhKLYSAZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
		
	})

}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function showMessageBubble(sender){

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			"sender_action": "typing_on",
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})

}

function saveTextMessage(sender,message){

	var messageInfo={};
	messageInfo.msg=message;
	messageInfo.sender=sender;
	queue.push(messageInfo);
}



function handleMessage(){
	async.waterfall([

	

	function (step) {
		// see notes below for authentication instructions! 
	
		var creds = require('./privatekey.json');
		// OR, if you cannot save the file locally (like on heroku) 
		console.log("in auth")
		var creds_json ={
		  "type": "service_account",
		  "project_id": "seecs.edu.pk:api-project-820114714644",
		  "private_key_id": "753e86411765ef0968e31959f84f70f163018b7f",
		  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYfLr+QcuuGmZw\n1aWNjINsk3EDOZlPHy//CtThzb4/S+0WPfTQJiGJLFq+n+IRc9b9utkKtHdwYx0L\nNirw0u64olf5FN2l6gnU2NPFGFRUN3QXJsnv3gMAwnrjS53ytMCSc92jFbb+1uLg\nmL13MIXXhTrivxLRuPtNvJ5m5Dp9c+orc+PFEmmRWLW9A9sRUoHdti6oheOoMzGF\n9f0qooZ165/PLN0DoSbIzS/nxt0LwIe//HyfMxSoM7jAkFMy+lkXk4iaXdZTTnLz\nJuE6SKLAPF+8xgC3eA4LoAof3Y8zcVAo4w/Cr7pJ9TKggW77JNnlDmQiMGkDVqLB\nLtsCcSk9AgMBAAECggEAAPKa1SxTOmAaxAeu82aQ9LcqS0LgLSdhkxKvgoymdo1c\nFzkOp0t/4aNmEWgAb1gDI877lZSicFO7MJhDcTEbMRXxSmxKElMx89KTnIXuhQRN\nknYmkCbpwjre07vkyOPfcwvJBbShEuQR7GeM/MaVYS96kIMYujcwa1NdKbTPZLy+\nbf5usXs8Im5ss/lX8fPC/cgwCSGE3a6gHDwe8CiiZOC4iXPVl4NTFkEfqfkdlen5\nSA2RlTuwuARRv5axw78ybv0DbbFg9YoqCgOi+3bMnSGeycdpdFoHuERzc0UjydDn\neDg2u7mZ9dzh5PqFGqCwUF7lRUhYA194koBNtbr9gQKBgQD+ecmaLFtXO9n+Pb+n\nv2aGnFo3E/xWCGNmy+pso9rWpLgB+9LqgnS+5vM7Ldn2dYf+Kfx7W1LPutOxsF99\nyunVYU+AhA5eyqqiXLU6cPjdNJjRDLHFaEcCWyi0yxv2SzEp2ekSw45TXKjsbRg0\nsxJtUofHYDeRAbQ+WCMXtGtmzQKBgQDZyLEC4cCJNnVgSa9aODTn1To4oms3e8dz\nTcSE+WFE+XPKryDlzRiiwVdaEXiyTzo/M3tF9AQ0IpVhXreoMqhyS3suuDFWyd5K\nlCfKF6KXAgLPq4m2Q/O1XQeMT0W1mbPMeBukNvMVT37bpESq4Yol061m3Er4x5js\nRJI3rJRsMQKBgQCJnm9Kc0aKbJG9jsNBAp99mLypIKPMGwk2pHyIeCx2++mPGRK9\nRAPC4b8Ud/1x7am36Bjk1UR5lr25UHqz2rKOdOu7wq7K0Ktq1twjWMkdR76E/2p8\nKaKNQaNH8reSgKN70J7dSOiFaIzqHy2CAn2qpYFMb1pdjyBcvulrfmS+2QKBgFHq\nvkIyPiSeeloEfVO3LpdBSgwBc8jD40rIprHJx7+VAOvtIbeuhKS7iqrTRY30ZRle\nuPCgD3C4zW15niVDIL8VCzmQiOZ3OgjdX3YRm9OnKv2ILV2Eg8flPTCWpMbhEJNJ\nXkRPcvHCHBpr2HRaL4d47pFxLTYUhb3hMQqF/LIRAoGAKygi1OQTA6O5c9RP5R2w\n5ZaeF7Qby78KBkxeaJMDgqJgSTmkgaCZiAGWvgoQRa+7XuICUY9UYBUkdacvabZ2\nipkpS8kWYA6VkSKolf72hbqRnoROKjkFqMIhvxCqG8JErDY4ja9u3Pgkmq8Bplq/\nBaKFkdxU+EFOr/UPa9z11Dw=\n-----END PRIVATE KEY-----\n",
		  "client_email": "anthropology@api-project-820114714644.seecs.edu.pk.iam.gserviceaccount.com",
		  "client_id": "117327732651137319838",
		  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
		  "token_uri": "https://accounts.google.com/o/oauth2/token",
		  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/anthropology%40api-project-820114714644.seecs.edu.pk.iam.gserviceaccount.com"
		}
		docTerms= new GoogleSpreadsheet(sheetTermsID);

		docTerms.useServiceAccountAuth(creds_json, step);
	},
	function (step){
		var creds_json ={
		  "type": "service_account",
		  "project_id": "seecs.edu.pk:api-project-820114714644",
		  "private_key_id": "753e86411765ef0968e31959f84f70f163018b7f",
		  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYfLr+QcuuGmZw\n1aWNjINsk3EDOZlPHy//CtThzb4/S+0WPfTQJiGJLFq+n+IRc9b9utkKtHdwYx0L\nNirw0u64olf5FN2l6gnU2NPFGFRUN3QXJsnv3gMAwnrjS53ytMCSc92jFbb+1uLg\nmL13MIXXhTrivxLRuPtNvJ5m5Dp9c+orc+PFEmmRWLW9A9sRUoHdti6oheOoMzGF\n9f0qooZ165/PLN0DoSbIzS/nxt0LwIe//HyfMxSoM7jAkFMy+lkXk4iaXdZTTnLz\nJuE6SKLAPF+8xgC3eA4LoAof3Y8zcVAo4w/Cr7pJ9TKggW77JNnlDmQiMGkDVqLB\nLtsCcSk9AgMBAAECggEAAPKa1SxTOmAaxAeu82aQ9LcqS0LgLSdhkxKvgoymdo1c\nFzkOp0t/4aNmEWgAb1gDI877lZSicFO7MJhDcTEbMRXxSmxKElMx89KTnIXuhQRN\nknYmkCbpwjre07vkyOPfcwvJBbShEuQR7GeM/MaVYS96kIMYujcwa1NdKbTPZLy+\nbf5usXs8Im5ss/lX8fPC/cgwCSGE3a6gHDwe8CiiZOC4iXPVl4NTFkEfqfkdlen5\nSA2RlTuwuARRv5axw78ybv0DbbFg9YoqCgOi+3bMnSGeycdpdFoHuERzc0UjydDn\neDg2u7mZ9dzh5PqFGqCwUF7lRUhYA194koBNtbr9gQKBgQD+ecmaLFtXO9n+Pb+n\nv2aGnFo3E/xWCGNmy+pso9rWpLgB+9LqgnS+5vM7Ldn2dYf+Kfx7W1LPutOxsF99\nyunVYU+AhA5eyqqiXLU6cPjdNJjRDLHFaEcCWyi0yxv2SzEp2ekSw45TXKjsbRg0\nsxJtUofHYDeRAbQ+WCMXtGtmzQKBgQDZyLEC4cCJNnVgSa9aODTn1To4oms3e8dz\nTcSE+WFE+XPKryDlzRiiwVdaEXiyTzo/M3tF9AQ0IpVhXreoMqhyS3suuDFWyd5K\nlCfKF6KXAgLPq4m2Q/O1XQeMT0W1mbPMeBukNvMVT37bpESq4Yol061m3Er4x5js\nRJI3rJRsMQKBgQCJnm9Kc0aKbJG9jsNBAp99mLypIKPMGwk2pHyIeCx2++mPGRK9\nRAPC4b8Ud/1x7am36Bjk1UR5lr25UHqz2rKOdOu7wq7K0Ktq1twjWMkdR76E/2p8\nKaKNQaNH8reSgKN70J7dSOiFaIzqHy2CAn2qpYFMb1pdjyBcvulrfmS+2QKBgFHq\nvkIyPiSeeloEfVO3LpdBSgwBc8jD40rIprHJx7+VAOvtIbeuhKS7iqrTRY30ZRle\nuPCgD3C4zW15niVDIL8VCzmQiOZ3OgjdX3YRm9OnKv2ILV2Eg8flPTCWpMbhEJNJ\nXkRPcvHCHBpr2HRaL4d47pFxLTYUhb3hMQqF/LIRAoGAKygi1OQTA6O5c9RP5R2w\n5ZaeF7Qby78KBkxeaJMDgqJgSTmkgaCZiAGWvgoQRa+7XuICUY9UYBUkdacvabZ2\nipkpS8kWYA6VkSKolf72hbqRnoROKjkFqMIhvxCqG8JErDY4ja9u3Pgkmq8Bplq/\nBaKFkdxU+EFOr/UPa9z11Dw=\n-----END PRIVATE KEY-----\n",
		  "client_email": "anthropology@api-project-820114714644.seecs.edu.pk.iam.gserviceaccount.com",
		  "client_id": "117327732651137319838",
		  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
		  "token_uri": "https://accounts.google.com/o/oauth2/token",
		  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/anthropology%40api-project-820114714644.seecs.edu.pk.iam.gserviceaccount.com"
		}
		docAuthors= new GoogleSpreadsheet(sheetAuthorID);
		docAuthors.useServiceAccountAuth(creds_json, step);

	},

	function (step) {

		docTerms.getInfo(function(err, info) {
			console.log(err);
			console.log('Loaded doc: '+info.title+' by '+info.author.email);
			sheetTerms = info.worksheets[0];
			console.log('sheet 1: '+sheetTerms.title+' '+sheetTerms.rowCount+'x'+sheetTerms.colCount);
			docAuthors.getInfo(function(err,info){
				sheetAuthors= info.worksheets[0];
				step();
			});
		
		});
	},
	function (step){

		var message= queue.shift()
		step(null,message.sender,message.msg);
	},



	function (sender,text,step) {
		var json;
		// google provides some query options 


		var request1 = app1.textRequest(text, {
    		sessionId: '12345677'
		});

		request1.on('response', function(response) {
			json= response;
			console.log("-------------------------------------");
			console.log("--------------------s-----------------");
			console.log(text);
			console.log(response);
			console.log("-------------------------------------");

			if(response.result.score>0.55 ){
				if(response.result.action=="input.welcome"){
					step(null,sender,response.result.fulfillment.speech,400);
				}
				else if(response.result.fulfillment.speech==3000){
					step(null,sender,null,
					response.result.fulfillment.speech);
				}
				
				else if(response.result.fulfillment.speech==0){
				step(null,sender,response.result.parameters.Fruits.toLowerCase(),
					response.result.fulfillment.speech);}
				else if(response.result.fulfillment.speech==1){
					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.author],
						response.result.fulfillment.speech);

				}
				else if(response.result.fulfillment.speech==3){
					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.categories],
						response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==5){
				
					step(null,sender,response.result.parameters.author,
						response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==6){
						step(null,sender,response.result.parameters.categories,
						response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==7){

					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.categories],
						response.result.fulfillment.speech);
				}
			}
			else{
				step(null,sender,response.result.fulfillment.speech,404);
			}
			
		});

		request1.on('error', function(error) {
			console.log(error);
		});
		request1.end();
		

		

		
	},
	function (sender, text, id, step){
		console.log("------------------");
		console.log(text);
		console.log("/////////////");
		if(id==404){
			step(null,sender,"I am sorry, i could not process your request");
		}
		else if(id==400){
			step(null,sender,text);
		}
		else if(id==3000){
			step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
		}else if(id==0){
		sheetTerms.getRows({
				offset: 0,
				orderby: "author",
				'query': "term = \""+text+"\""

				}, function( err, rows ){
			console.log(err);

			if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
				step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
			}
			else{
			

				console.log('Read '+rows.length+' rows');
				
				var text1="";
				for(var row in rows){
		
					text1=text1+rows[row].definition+"\n"+rows[row].author+"\n \n";
				}
				step(null,sender,text1);
				}
			});}
		else if(id==1){


			console.log("I am in id 1");
			sheetTerms.getRows({
				offset: 0,
				
				'query': "term = \""+text[0]+"\""

				}, function( err, rows ){
			console.log(err);

			if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
				step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
			}
			else{
			
				console.log('Read '+rows.length+' rows');
				
				var text1="";
				for(var row in rows){
					if(text[1]!=undefined){
				
						if(rows[row].author.indexOf(text[1])!==-1){
							text1=text1+rows[row].definition+"\n \n";}
					
					}
					else{text1=text1+rows[row].definition+"\n"+rows[row].author+"\n \n";}
				}

				step(null,sender,text1);
				}
			});

		}
		else if(id==3){
			sheetAuthors.getRows({offset: 0},function(err,rows){
				console.log(err);
				if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
				}
				else{
					var authors=[];

					for(var row in rows)
					{
						var arrCategory=rows[row].info.split(",");
						for(var index in arrCategory){
							if(arrCategory[index].trim() ==text[1]){
								authors.push(rows[row].author);
							}
						}

						console.log(rows[row].info);
					}

					console.log('Read '+rows.length+' rows');
					for(var author in authors){
						console.log("author hogaya"+authors[author]);

					}
					console.log('Read '+rows.length+' rows');





					//getting data from second sheet and processing for matching



				sheetTerms.getRows({offset:0,
					"query":"term= \""+text[0]+"\""},function(errM,rowsM){
					if(rowsM==undefined || rowsM==null || rowsM.length==undefined ||rowsM.length==0){
						console.log(err);
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
					}
					else{
						var message= "";
						for(var row in rowsM){
							for(var index in authors){
								//assuming names of authors are same in both spreadsheets unlike Kermit The Frog in One
								// and Kermit in another.
								if(rowsM[row].author.trim()==authors[index].trim()){
									message=message+rowsM[row].definition+"\n"+rowsM[row].author+"\n \n";
								}
							}
						}
						if(message==""){
							step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
						}else{
						step(null,sender,message);}
					}

				});	
					
				}
			});

		}
		else if(id==5){
			console.log("author in id 5"+text);
			sheetTerms.getRows({offset:0,
				query:"author = \""+text+"\""},function(err,rows){
					if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
						console.log(err);
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
					}
					else{
						var message="";
						var arr=[];
						//making unique array
						for(var row in rows){
							if(arr.length==0){
								arr.push(rows[row].term.trim());
							}
							if(arr.indexOf(rows[row].term.trim())===-1){
								arr.push(rows[row].term.trim());
							}

						}
						for(var index in arr){
							
								message= message+arr[index]+"\n \n";
							
								
						}
						step(null,sender,message);
					}

				});
		}
		else if(id==6){

			sheetAuthors.getRows({offset:0},function(err,rows){
				if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
						console.log(err);
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
				}else{
					var authors=[];
					for(var row in rows){
						var arrCategory=rows[row].info.split(",");
						for(var index in arrCategory){
							if(arrCategory[index].trim() ==text){
								authors.push(rows[row].author);
							}
						}
					}
					var message="";
					for(var index in authors){
						message=message+authors[index]+"\n \n";

					}
					step(null,sender,message);
				}

			});
		}
		else if(id==7){


			sheetAuthors.getRows({offset: 0},function(err,rows){
				console.log(err);
				if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
				}
				else{
					var authors=[];

					for(var row in rows)
					{
						var arrCategory=rows[row].info.split(",");
						for(var index in arrCategory){
							if(arrCategory[index].trim() ==text[1][0] || arrCategory[index].trim() ==text[1][1]){
								authors.push(rows[row].author);
							}
						}

						console.log(rows[row].info);
					}

					console.log('Read '+rows.length+' rows');
					for(var author in authors){
						console.log("author hogaya"+authors[author]);

					}
					console.log('Read '+rows.length+' rows');





					//getting data from second sheet and processing for matching



				sheetTerms.getRows({offset:0,
					"query":"term= \""+text[0]+"\""},function(errM,rowsM){
					if(rowsM==undefined || rowsM==null || rowsM.length==undefined ||rowsM.length==0){
						console.log(err);
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation");
					}
					else{
						var message= "";
						for(var row in rowsM){
							for(var index in authors){
								if(rowsM[row].author.indexOf(authors[index])!==-1){
									message=message+rowsM[row].definition+"\n"+rowsM[row].author+"\n \n";
								}
							}
						}
						step(null,sender,message);
					}

				});	
					
				}
			});
		}


	},

	function sendTextMessage(sender, text,callback) {
		if(text!=null && sender!=null){
			console.log("----------------------"+text.length+"---------------------------");
			if(text.length>620){
				var string2=text;
				var messages=text.split("\n \n");
				var counter=0;
				var messageRequests=[];
				// while(string2.length>620){
				// 	messages.push(string2.substring(0,620));
				// 	var length=string2.length;
				// 	string2=string2.substring(620,length);

				// }
				//messages.push(string2);
				console.log("_________________________________________________________________");
				console.log("_________________________________________________________________");
				console.log("_________________________________________________________________");
				console.log(text);
				console.log("_________________________________________________________________");
				console.log("_________________________________________________________________");
				console.log("_________________________________________________________________");

				for(var i = 0 ; i < messages.length;i++){
					

				let messageData = { text:messages[i] }
				messageRequests.push(new Promise(function(resolve,reject){
					request({
					url: 'https://graph.facebook.com/v2.6/me/messages',
					qs: {access_token:token},
					method: 'POST',
					json: {
						recipient: {id:sender},
						message: messageData,
					}
					}, function(error, response, body) {
					if (error) {
						console.log('Error sending messages: ', error)
					} else if (response.body.error) {
						console.log('Error: ', response.body.error)
					}
					
					})
				}));
				
				//use promises and call callback once all of these processes have been completed.

				}
				Promise.all(messageRequests).then(function(values){callback();}); 
			}
			else if(text.length==0){
				let messageData = { text:"Sorry! but i could not find any appropriate information. Please contact Ryan and send him the question" }

				request({
					url: 'https://graph.facebook.com/v2.6/me/messages',
					qs: {access_token:token},
					method: 'POST',
					json: {
						recipient: {id:sender},
						message: messageData,
					}
				}, function(error, response, body) {
					if (error) {
						console.log('Error sending messages: ', error)
					} else if (response.body.error) {
						console.log('Error: ', response.body.error)
					}
					callback();
					})
			}

			else{
				let messageData = { text:text }

				request({
					url: 'https://graph.facebook.com/v2.6/me/messages',
					qs: {access_token:token},
					method: 'POST',
					json: {
						recipient: {id:sender},
						message: messageData,
					}
				}, function(error, response, body) {
					if (error) {
						console.log('Error sending messages: ', error)
					} else if (response.body.error) {
						console.log('Error: ', response.body.error)
					}
					callback();
					})
				}
			}
		else{
			callback();
		}

	}
	],function(err){
    if( err ) {
      console.log('Error: '+err);
    }

	})
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
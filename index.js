'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const { Client } = require('pg');

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
var sheetTermsID='1fn4iqkid-vw4vtJ3JXbfm7UziJWvEPOADKIgnHZ-pDs';
var sheetThinkersID='1ZpizEgp1NOuC5apnxK1jBeJE1nQKfm7Q7LGmvFwxya8';
// var doc = new GoogleSpreadsheet('1Sbv9hV9INcUmmLbRSuZEnxThOjik2YWv4jwMV6eZbus');
// var doc2= new GoogleSpreadsheet('12GhaeoSgaBUTy6g8BLeKNA9Xmp7UszpWD5heOUb-bIw');
var sheetAuthors;
var sheetTerms;
var sheetBooks;
var sheetBooksLike;
var sheetBooksDislike;
var docAuthors;
var docTerms;
var docThinkers;
var docThinkersLike;
var docThinkersDislike;
var docAuthorsLike;
var docTermsLike;
var docTermsDislike;
var docAuthorsDislike;
var docAuthorsSource;
var docTermsSource;
var docThinkersSource;
var sheetAuthorsDislike;
var sheetAuthorsLike;
var sheetTermsDislike;
var sheetTermsLike;
var sheetThinkers;
var sheetThinkersLike;
var sheetThinkersDislike;

//database connection
const client= new Client({
			connectionString: process.env.DATABASE_URL,
			ssl: true,
			});
var connectionCounter=0;
var queue=[];
var senderToMessages={};
var senderToIndex={};
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
				if(event.message.quick_reply==undefined){
					console.log("payload is emptyyyyyyyy");
					showMessageBubble(sender);
				
					saveTextMessage(sender,text);
					handleMessage();
				}else{
					console.log("payload is NOT emptyyyyyy");
					console.log(event.message.quick_reply.payload);
					//implement  new function to handle further responses.
					
					handlePayload(sender,event.message);
				}
				
			}
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
const token = "EAAEQwLpnPzUBAHZAKeYt4Vk7Im4R7bXiDSmfsPpzAntan5esy5GZCVdr4PVw5Elh5niZCY6b0Tzi4EkQUQdxTN8KdY8hg5HKEJrZA6zA84uJVj5TLZCZAAJXImgHpdV53Eavmp2TZCmeW5SSvJ9ZAe9sBzABBfU7uGXVMeiAjIQDWwQP0kV6hJUL";
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

function cleanDataOfSender(sender){

	senderToIndex[sender]=undefined;
	senderToMessages[sender]=undefined;
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

function sendQuickResponse(sender, text, index, size){
//
	// let messageData= {
 //    "text":text,
 //    "quick_replies":[
 //      {
 //      	//this is like
 //        "content_type":"text",
 //        "title":"Like",
 //        "payload":"0",
 //        "image_url":"https://image.ibb.co/hTUPc5/Webp_net_resizeimage_4.png"
 //      },
 //      {
 //      	//this is dislike
 //        "content_type":"text",
 //        "title":"Dislike",
 //        "payload":"1",
 //        "image_url":"https://image.ibb.co/gNHAH5/Webp_net_resizeimage.png"
 //      },
 //      {
 //      	//this is more
 //      	"content_type":"text",
 //      	"title":"Next",
 //      	"payload":"2"
 //      }
 //    ]
	// }
	let messageData= {
    "text":text,
    "quick_replies":createQuickReplies(index,size)
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
		hideMessageBubble(sender);
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
function hideMessageBubble(sender){
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			"sender_action": "typing_off",
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


function handlePayload(sender,message){
	if(senderToIndex==undefined || senderToIndex[sender]==undefined || senderToMessages==undefined
		|| senderToMessages[sender]==undefined){
		sendTextMessage(sender,"Sorry no previous history exists");
		return;
	}
	showMessageBubble(sender);
	var messages=senderToMessages[sender].msg;
	console.log(" ;; "+ "sender : "+senderToIndex[sender]);
	
	if(message.quick_reply.payload!="1"){
		senderToIndex[sender]=senderToIndex[sender]+1;
	}
	console.log(senderToIndex[sender]+":::::"+Object.keys(messages).length);
	

	if(message.quick_reply.payload=="0"){
		console.log("in first pay load");
		if(senderToIndex[sender]>=Object.keys(messages).length-1){
			sendTextMessage(sender,"Happy Learning!!");
			hideMessageBubble(sender);
			//start asynctask to add likes 
			saveLike(sender,senderToIndex[sender]-1);
			handleLike();
			

			return;
		}
		saveLike(sender,senderToIndex[sender]-1);
		handleLike();
		sendQuickResponse(sender,messages[senderToIndex[sender]],senderToIndex[sender],messages.length);

	}
	else if(message.quick_reply.payload=="1"){
		// console.log("in second pay load");
		// if(senderToIndex[sender]>=Object.keys(messages).length-1){
		// 	sendTextMessage(sender,"Happy Learning!!");
		// 	hideMessageBubble(sender);
		// 	//start async task to add  dislikes
		// 	saveDislike(sender,senderToIndex[sender]-1);
		// 	handleDislike();
			
			
		// 	return;
		// }
		// saveDislike(sender,senderToIndex[sender]-1);
		// handleDislike();
		
		// sendQuickResponse(sender,messages[senderToIndex[sender]]);
		handleSource(sender,messages);

	}
	else if(message.quick_reply.payload=="2"){
		console.log("in third pay load");
		if(senderToIndex[sender]>=Object.keys(messages).length-1){
			sendTextMessage(sender,"Happy Learning!!");
			hideMessageBubble(sender);
			cleanDataOfSender(sender);
			return;
		}
		
		sendQuickResponse(sender,messages[senderToIndex[sender]],senderToIndex[sender],messages.length);
	}
	hideMessageBubble(sender);

}

var diskLikeQueue=[];
var likeQueue=[];

function saveDislike(sender, index){
	var messageInfo={};
	messageInfo.indx=index;
	messageInfo.sender=sender;
	diskLikeQueue.push(messageInfo);
}
function saveLike(sender,index){
	var messageInfo={};
	messageInfo.indx=index;
	messageInfo.sender=sender;
	likeQueue.push(messageInfo);
}


function saveTextMessage(sender,message){

	var messageInfo={};
	messageInfo.msg=message;
	messageInfo.sender=sender;
	queue.push(messageInfo);
}


function handleDislike(){

	async.waterfall([
		
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
			docAuthorsDislike= new GoogleSpreadsheet(sheetAuthorID);
			docAuthorsDislike.useServiceAccountAuth(creds_json, step);

		}
		,

		function (step) {
			//sheetTermsDislike
			//sheetThinkersDislike
			//sheetAuthorsDislike

		
				docAuthorsDislike.getInfo(function(err,info){
					sheetAuthorsDislike= info.worksheets[0];
					sheetTermsDislike=info.worksheets[4];
					sheetThinkersDislike=info.worksheets[2];
					sheetBooksDislike=info.worksheets[1];
					step();
					
				});
			
			
		},
		function (step){
			var messageInfo= diskLikeQueue.shift()
			step(null,messageInfo);
		},
		function (messageInfo,step){
			if(senderToIndex[messageInfo.sender]==undefined || senderToMessages[messageInfo.sender]==undefined){
				//send apology
				step();
			}
			else{
				//get message
				var message= senderToMessages[messageInfo.sender];
				var rows= message.data;
				var reqRow= rows[messageInfo.indx];
				if(message.id==0 || message.id==1 || message.id==3 || message.id==7 || message.id==9||message.id==10){
					sheetTermsDislike.getRows({offset:0,
						query:"term = \"" + reqRow.term+"\" && definition = \""+reqRow.definition+ "\" && author = \""+reqRow.author+"\""}
						,function(err,rows){
							if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
								console.log(err);
								step();
								//notify administrator of the bug
							}
							else{
								var saveRequestsArray=[];
								console.log(rows[0]);
								for(var row in rows){
									saveRequestsArray.push(new Promise(function(resolve,reject){
										var intDislike=0;
										var dislike=rows[row].dislikes;
										if(dislike!=""){
											intDislike=+dislike;
										}
										
										intDislike=intDislike+1;
										rows[row].dislikes=""+intDislike.toString();
										rows[row].term=""+rows[row].term;
	          							rows[row].author=""+rows[row].author;
	          							rows[row].definition=""+rows[row].definition;
										rows[row].save(resolve);

									}));
								}

								Promise.all(saveRequestsArray).then(function(values){
									console.log("Done disliked");
									request({
											url: 'https://graph.facebook.com/v2.6/me/messages',
											qs: {access_token:token},
											method: 'POST',
											json: {
												recipient: {id:messageInfo.sender},
												"sender_action": "typing_off",
											}
										}, function(error, response, body) {
											step();
											if (error) {
												console.log('Error sending messages: ', error)
											} else if (response.body.error) {
												console.log('Error: ', response.body.error)
											}
										})
									
								});
							}
						});
					}else if(message.id==8){
						sheetThinkersDislike.getRows({offset:0,
							'query':"author = \""+reqRow.author+"\" && thinker = \""+reqRow.thinker+"\" && description = \""+
							reqRow.description+"\""},function(err,rows){
								if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
									console.log(err);
									step();
								//notify administrator of the bug
								}
								else {

									var saveRequestsArray=[];
									console.log(rows[0]);
									for(var row in rows){
									saveRequestsArray.push(new Promise(function(resolve,reject){
										var intDislike=0;
										var dislike=rows[row].dislikes;
										if(dislike!=""){
											intDislike=+dislike;
										}
										
										intDislike=intDislike+1;
										rows[row].dislikes=""+intDislike.toString();
										rows[row].author=""+rows[row].author;
	          							rows[row].thinker=""+rows[row].thinker;
	          							rows[row].description=""+rows[row].description;
										rows[row].save(resolve);

									}));
								}

								Promise.all(saveRequestsArray).then(function(values){
									console.log("Done disliked");
									request({
											url: 'https://graph.facebook.com/v2.6/me/messages',
											qs: {access_token:token},
											method: 'POST',
											json: {
												recipient: {id:messageInfo.sender},
												"sender_action": "typing_off",
											}
										}, function(error, response, body) {
											step();
											if (error) {
												console.log('Error sending messages: ', error)
											} else if (response.body.error) {
												console.log('Error: ', response.body.error)
											}
										})
									
								});

								}
							});
					}
					else if(message.id==12){
						sheetBooksDislike.getRows({offset:0,
							'query':"author = \""+reqRow.author+"\" && title = \""+reqRow.title+"\" && description = \""+
							reqRow.description+"\""},function(err,rows){
								if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
									console.log(err);
									step();
								//notify administrator of the bug
								}
								else {

									var saveRequestsArray=[];
									console.log(rows[0]);
									for(var row in rows){
									saveRequestsArray.push(new Promise(function(resolve,reject){
										var intDislike=0;
										var dislike=rows[row].dislikes;
										if(dislike!=''){
											intDislike=+dislike;
										}
										
										intDislike=intDislike+1;
									
										rows[row].dislikes=""+intDislike.toString();
										rows[row].author=""+rows[row].author;
	          							rows[row].title=""+rows[row].title;
	          							rows[row].description=""+rows[row].description;
										rows[row].save(resolve);

									}));
								}

								Promise.all(saveRequestsArray).then(function(values){
									console.log(values);
									console.log("Done disliked");
									request({
											url: 'https://graph.facebook.com/v2.6/me/messages',
											qs: {access_token:token},
											method: 'POST',
											json: {
												recipient: {id:messageInfo.sender},
												"sender_action": "typing_off",
											}
										}, function(error, response, body) {
											step();
											if (error) {
												console.log('Error sending messages: ', error)
											} else if (response.body.error) {
												console.log('Error: ', response.body.error)
											}
										})
									
								});

								}
							});
					}
			}

		}

		],function(err){
		    if( err ) {
		      console.log('Error: '+err);
		    }

	});
}
function handleLike(){

	async.waterfall([
		
		function (step) {
			//sheetTermsDislike
			//sheetThinkersDislike
			//sheetAuthorsDislike

				try{
						client.connect(function(err, client, done) {
							if(err) throw err;
							
							step();
						});
					}
				catch(err){
					step();
				}
			
			
		},
		function (step){
			var messageInfo= likeQueue.shift()
			step(null,messageInfo);
		},
		function (messageInfo,step){
			if(senderToIndex[messageInfo.sender]==undefined || senderToMessages[messageInfo.sender]==undefined){
				//send apology
				step();
			}
			else{
				//get message
				var message= senderToMessages[messageInfo.sender];
				var rows= message.data;
				var reqRow= rows[messageInfo.indx];
				console.log(reqRow);
				var tableName="prim_terms";
				if(message.id==12){
					tableName="prim_books";
				}
				else if(message.id==8){
					tableName="prim_thinkers";
				}

				var arr=["none","adjectives","nouns","so_phrases","verbs"];
				
				client.query('SELECT * FROM '+tableName+' WHERE id='+reqRow.id+';',function(err,res){
					if(err){
						console.log(err);
						step();

					}else{
						console.log("i am going inside");
						console.log(res.rows);
						var intlike=0;
						var like=res.rows[0].likes;
						if(like!=""){
							intlike=+like;
						}
						
						intlike=intlike+1;
						client.query('UPDATE '+ tableName +' SET likes=\''+intlike.toString()+'\' WHERE id='+res.rows[0].id+';'
							,function(err,res){
								if(err){
									console.log(err);
								}
								step();
							});
						
					}
				});
				
				

			}


		}

		],function(err){

		    if( err ) {
		      console.log('Error: '+err);
		    }

	});
}



function handleMessage(){
	async.waterfall([

	

	// function (step){
	// 	var creds_json ={
	// 	  "type": "service_account",
	// 	  "project_id": "seecs.edu.pk:api-project-820114714644",
	// 	  "private_key_id": "753e86411765ef0968e31959f84f70f163018b7f",
	// 	  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYfLr+QcuuGmZw\n1aWNjINsk3EDOZlPHy//CtThzb4/S+0WPfTQJiGJLFq+n+IRc9b9utkKtHdwYx0L\nNirw0u64olf5FN2l6gnU2NPFGFRUN3QXJsnv3gMAwnrjS53ytMCSc92jFbb+1uLg\nmL13MIXXhTrivxLRuPtNvJ5m5Dp9c+orc+PFEmmRWLW9A9sRUoHdti6oheOoMzGF\n9f0qooZ165/PLN0DoSbIzS/nxt0LwIe//HyfMxSoM7jAkFMy+lkXk4iaXdZTTnLz\nJuE6SKLAPF+8xgC3eA4LoAof3Y8zcVAo4w/Cr7pJ9TKggW77JNnlDmQiMGkDVqLB\nLtsCcSk9AgMBAAECggEAAPKa1SxTOmAaxAeu82aQ9LcqS0LgLSdhkxKvgoymdo1c\nFzkOp0t/4aNmEWgAb1gDI877lZSicFO7MJhDcTEbMRXxSmxKElMx89KTnIXuhQRN\nknYmkCbpwjre07vkyOPfcwvJBbShEuQR7GeM/MaVYS96kIMYujcwa1NdKbTPZLy+\nbf5usXs8Im5ss/lX8fPC/cgwCSGE3a6gHDwe8CiiZOC4iXPVl4NTFkEfqfkdlen5\nSA2RlTuwuARRv5axw78ybv0DbbFg9YoqCgOi+3bMnSGeycdpdFoHuERzc0UjydDn\neDg2u7mZ9dzh5PqFGqCwUF7lRUhYA194koBNtbr9gQKBgQD+ecmaLFtXO9n+Pb+n\nv2aGnFo3E/xWCGNmy+pso9rWpLgB+9LqgnS+5vM7Ldn2dYf+Kfx7W1LPutOxsF99\nyunVYU+AhA5eyqqiXLU6cPjdNJjRDLHFaEcCWyi0yxv2SzEp2ekSw45TXKjsbRg0\nsxJtUofHYDeRAbQ+WCMXtGtmzQKBgQDZyLEC4cCJNnVgSa9aODTn1To4oms3e8dz\nTcSE+WFE+XPKryDlzRiiwVdaEXiyTzo/M3tF9AQ0IpVhXreoMqhyS3suuDFWyd5K\nlCfKF6KXAgLPq4m2Q/O1XQeMT0W1mbPMeBukNvMVT37bpESq4Yol061m3Er4x5js\nRJI3rJRsMQKBgQCJnm9Kc0aKbJG9jsNBAp99mLypIKPMGwk2pHyIeCx2++mPGRK9\nRAPC4b8Ud/1x7am36Bjk1UR5lr25UHqz2rKOdOu7wq7K0Ktq1twjWMkdR76E/2p8\nKaKNQaNH8reSgKN70J7dSOiFaIzqHy2CAn2qpYFMb1pdjyBcvulrfmS+2QKBgFHq\nvkIyPiSeeloEfVO3LpdBSgwBc8jD40rIprHJx7+VAOvtIbeuhKS7iqrTRY30ZRle\nuPCgD3C4zW15niVDIL8VCzmQiOZ3OgjdX3YRm9OnKv2ILV2Eg8flPTCWpMbhEJNJ\nXkRPcvHCHBpr2HRaL4d47pFxLTYUhb3hMQqF/LIRAoGAKygi1OQTA6O5c9RP5R2w\n5ZaeF7Qby78KBkxeaJMDgqJgSTmkgaCZiAGWvgoQRa+7XuICUY9UYBUkdacvabZ2\nipkpS8kWYA6VkSKolf72hbqRnoROKjkFqMIhvxCqG8JErDY4ja9u3Pgkmq8Bplq/\nBaKFkdxU+EFOr/UPa9z11Dw=\n-----END PRIVATE KEY-----\n",
	// 	  "client_email": "anthropology@api-project-820114714644.seecs.edu.pk.iam.gserviceaccount.com",
	// 	  "client_id": "117327732651137319838",
	// 	  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
	// 	  "token_uri": "https://accounts.google.com/o/oauth2/token",
	// 	  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	// 	  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/anthropology%40api-project-820114714644.seecs.edu.pk.iam.gserviceaccount.com"
	// 	}
	// 	docAuthors= new GoogleSpreadsheet(sheetAuthorID);
	// 	docAuthors.useServiceAccountAuth(creds_json, step);

	// },

	function (step) {

			
			// client= new Client({
			// connectionString: process.env.DATABASE_URL,
			// ssl: true,
			// });
			try{
				client.connect(function(err, client, done) {
					if(err) throw err;
					
					step();
				});
			}
			catch(err){
				step();
			}
		
			

			



			// docAuthors.getInfo(function(err,info){
			// 	sheetAuthors= info.worksheets[5];
			// 	sheetTerms=info.worksheets[4];
			// 	sheetThinkers=info.worksheets[2];
			// 	sheetBooks=info.worksheets[1];
			// 	step();
				
			// });
		
		
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
			
			console.log("-------------------------------------");

			if(response.result.score>0.55 ){
				if(response.result.action=="input.welcome"){
					step(null,sender,response.result.fulfillment.speech,400);
				}
				else if(response.result.action=="input.unknown"){
					step(null,sender,response.result.fulfillment.speech,3000)
				}
				
				else if(response.result.fulfillment.speech==0){
				step(null,sender,response.result.parameters.Fruits.toLowerCase(),
					response.result.fulfillment.speech);}
				else if(response.result.fulfillment.speech==1){
					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.author],
						response.result.fulfillment.speech);

				}
				else if(response.result.fulfillment.speech==3){
					console.log(response);
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
				else if(response.result.fulfillment.speech==8){
					step(null, sender,response.result.parameters.thinker,response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==9){
					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.debates],response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==10){
					step(null,sender,[response.result.parameters.categories,response.result.parameters.Fruits.toLowerCase()],response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==11){

					step(null,sender,response.result.parameters.categories,response.result.fulfillment.speech);

				}
				else if(response.result.fulfillment.speech==12){
					step(null,sender,response.result.parameters.books,response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==13){
					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.tags_and.toLowerCase()],response.result.fulfillment.speech);
				}
				else if(response.result.fulfillment.speech==14){
					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.tags_of.toLowerCase()],response.result.fulfillment.speech);

				}
				
				else if(response.result.fulfillment.speech==15){
					step(null,sender,[response.result.parameters.Fruits.toLowerCase(),response.result.parameters.tags_as.toLowerCase()],response.result.fulfillment.speech);

				}
				else{
					step(null,sender,response.result.fulfillment.speech,404);
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
			step(null,sender,"I am sorry, i could not process your request. \nBot is still under construction and we would like to cater your request as soon as possible.\nThank you for your interest.",id);
		}
		else if(id==400){
			step(null,sender,text,id);
		}
		else if(id==3000){
			step(null,sender,text,id);
		}else if(id==0){
			//what is apple?

		client.query('SELECT * FROM prim_terms WHERE term LIKE \''+text+'\';', function(err, res){
				if (err) throw err;
				var rows= res.rows;
				
				if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
					console.log(rows.length);
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
				}
				else{
			

					console.log('Read '+rows.length+' rows');
					rows=shuffle(rows);
					var messageInfo={};
					messageInfo.data=rows;
					messageInfo.id=id;
					messageInfo.parameters=text;
					senderToMessages[sender]=messageInfo;
					console.log("message information added.......");
					var text1="";
					for(var row in rows){
			
						text1=text1+rows[row].pronouns+" "+text+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
					}
					step(null,sender,text1,id);
				}
				
			});
		}
		else if(id==1){
			console.log("I am in id 1");

			//what is term according to author
			client.query('SELECT * FROM prim_terms WHERE term LIKE\''+text[0]+'\' AND author LIKE \''+text[1]+'\';',
				function(err,res){
					if (err) throw err;
					var rows= res.rows;
					if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
					}
					else{

						console.log('Read '+rows.length+' rows');
						rows=shuffle(rows);
						var messageInfo={};

						messageInfo.data=rows;
						messageInfo.id=id;
						messageInfo.parameters=text;
						senderToMessages[sender]=messageInfo;
						var text1="";
						for(var row in rows){
							if(rows[row].pronouns!=""){
							text1=text1+rows[row].pronouns+" "+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
							}
							else{
								text1=text1+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";

							}
						}

						step(null,sender,text1,id);
					}


				});

			

		}
		else if(id==3){
			//what is TERM according to Category
			console.log("in id 3");
			client.query('SELECT * FROM prim_author WHERE nationality LIKE \'%Canadian%\'',function(err,res){
				console.log("Here it is");
				console.log(res.rows.length);
			});

			client.query('SELECT * FROM prim_terms WHERE term =\''+text[0]+'\' AND author '+
				'IN(SELECT author FROM prim_author WHERE born LIKE \'%'+text[1]+
				'%\' OR died LIKE \'%'+ text[1]+'%\' OR gender LIKE \'%'+text[1]+
				'%\' OR ethnicity LIKE \'%'+text[1]+'%\' OR profession LIKE \'%'+text[1]+'%\' OR affiliation LIKE \'%'+text[1]+
				'%\' OR contributed LIKE \'%'+text[1]+'%\' OR nationality LIKE \'%'+text[1]+'%\');',
				function(err,res){
					if (err) throw err;
					var rows= res.rows;
					console.log("Read rows: "+rows.length);
					if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
					}
					else{


						//cater this problem later on. Two queries have to be played
						// second query will find false positive authors which will be evaded while making a message
						//filtering false positives
						// var rows1= res.rows;
						// var rows=[];
						// var falsePositive=false;
						// for(var i in rows1){
						// 	console.log("i am in for loop");
						// 	console.log(splitString(rows1[i].nationality,","));
						// 	//condition = splitString(rows[i].died,",").indexOf(text[1])>-1
						// 	if(splitString(rows1[i].nationality,",").indexOf(text[1])>-1){
						// 		console.log("i know i ave this");
						// 	}
						// 	if(splitString(rows1[i].died,",").indexOf(text[1])>-1 ||
						// 	 splitString(rows1[i].gender,",").indexOf(text[1])>-1 ||
						// 	 splitString(rows1[i].ethnicity,",").indexOf(text[1])>-1 ||
						// 	 splitString(rows1[i].profession,",").indexOf(text[1])>-1 ||
						// 	 splitString(rows1[i].affiliation,",").indexOf(text[1])>-1 ||
						// 	 splitString(rows1[i].contributed,",").indexOf(text[1])>-1 ||
						// 	 splitString(rows1[i].nationality,",").indexOf(text[1])>-1){
						// 		rows.push(rows1[i]);
						// 	}
						// }

						var message="";
						var messageInfo={};
						for(var row in rows){
							if(rows[row].pronouns!=""){
								message=message+rows[row].pronouns+" "+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
								}
							else{
								message=message+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";

								}
						}
						if(message==""){
							console.log("i am in empty");
							step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
						}
						else{
							messageInfo.data=rows;
							messageInfo.id=id;
							messageInfo.parameters=[text];
							senderToMessages[sender]=messageInfo;
							step(null,sender,message,id);
						}

						}

						
					});


				


	

		}
		else if(id==5){
			console.log("author in id 5"+text);
			client.query('SELECT * FROM prim_terms WHERE author = \''+text+'\';',function(err,res){
			if(err) throw err;
			console.log("Read "+res.rows.length);
			var rows= res.rows;

			if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
					console.log(err);
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
				}
				else{
					var message="";
					var arr=[];
					var messageInfo={};
					messageInfo.data=rows;
					messageInfo.id=id;
					senderToMessages[sender]=messageInfo;
					//making unique array
					for(var row in rows){
						if(arr.length==0){
							arr.push(rows[row].term.trim());
						}
						if(arr.indexOf(rows[row].term.trim())===-1){
							arr.push(rows[row].term.trim());
						}

					}
					
					var sortedTerms= arr.sort(function(a,b){
						var splitA = a.split(" ");
					    var splitB = b.split(" ");
					    var lastA = splitA[splitA.length - 1];
					    var lastB = splitB[splitB.length - 1];

					    if (lastA < lastB) return -1;
					    if (lastA > lastB) return 1;
					    return 0;
					});
						
					console.log(sortedTerms);
					for(var index in arr){
						
							message= message+sortedTerms[index]+" ;;";
						
							
					}
					step(null,sender,message,id);
				}
			});
			
		}
		else if(id==6){
			console.log("i am in id = 6");
			client.query('SELECT * FROM prim_author WHERE born LIKE \'%'+text+
				'%\' OR died LIKE \'%'+ text+'%\' OR gender LIKE \'%'+text+
				'%\' OR ethnicity LIKE \'%'+text+'%\' OR profession LIKE \'%'+text+'%\' OR affiliation LIKE \'%'+text+
				'%\' OR contributed LIKE \'%'+text+'%\' OR nationality LIKE \'%'+text+'%\' ORDER BY author ASC;',function(err,res){
				if(err) throw err;
				var rows= res.rows;
				var message="";

				if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
						console.log(err);
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
				}
				else{
					for(var index in rows){
						message=message+rows[index].author+" ;;";
						
					}
					step(null,sender,message,id);
				}


			});

		
		}
		else if(id==7){

			console.log("I am in id 7");
			client.query('SELECT * FROM prim_terms WHERE term = \''+ text[0]+'\' AND author '+ 
				'IN(SELECT author FROM prim_author WHERE born LIKE \'%'+text[1][0]+
				'%\' OR died LIKE \'%'+ text[1][0]+'%\' OR gender LIKE \'%'+text[1][0]+
				'%\' OR ethnicity LIKE \'%'+text[1][0]+'%\' OR profession LIKE \'%'+text[1][0]+'%\' OR affiliation LIKE \'%'+text[1][0]+
				'%\' OR contributed LIKE \'%'+text[1][0]+'%\' OR nationality LIKE \'%'+text[1][0]+'%\'' +
				'OR born LIKE \'%'+text[1][1]+
				'%\' OR died LIKE \'%'+ text[1][1]+'%\' OR gender LIKE \'%'+text[1][1]+
				'%\' OR ethnicity LIKE \'%'+text[1][1]+'%\' OR profession LIKE \'%'+text[1][1]+'%\' OR affiliation LIKE \'%'+text[1][1]+
				'%\' OR contributed LIKE \'%'+text[1][1]+'%\' OR nationality LIKE \'%'+text[1][1]+'%\');',function(err,res){
					if(err) throw err;
					var rows= res.rows;
					if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
					}
					var message="";
					for(var row in rows){
						if(rows[row].pronouns!=""){
							message=message+rows[row].pronouns+" "+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
						}
						else{
							message=message+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
						}
					}
					if(message!=""){
						var messageInfo={};
						messageInfo.data=rows;
						messageInfo.id=id;
						senderToMessages[sender]=messageInfo;
						step(null,sender,message,id);
					}
					else{
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);

					}

			});

		}
		else if(id==8){
			//#requirement
			client.query('SELECT * FROM prim_thinkers WHERE thinker = \''+text+'\'',function(err,res){
				if(err) throw err;
				var rows= res.rows;
				var messageInfo={};
				var message="";
				rows=shuffle(rows);
				for(var row in rows){
					message=message+rows[row].description+"\n"+rows[row].author+"\n \n";
				}
				messageInfo.data=rows;
				messageInfo.id=id;
				senderToMessages[sender]=messageInfo;
				client.query('SELECT * FROM prim_author WHERE author = \''+text+'\'',function(err,res){
					if(err) throw err;
					var rows2= res.rows;
					if(rows2==undefined || rows2==null || rows2.length==undefined || rows2.length==0){
								console.log(err);
								step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
							}
							else{
								//here i return
								var categoryMessage="";
								var arrCategory=[];
								if(rows[row].born!=undefined){
									arrCategory.push(rows[row].born);
								}
								if(rows[row].died!=undefined){
									arrCategory.push(rows[row].died);
								}
								if(rows[row].century!=undefined){
									arrCategory=arrCategory.concat(rows[row].century.split(","));
								}
								if(rows[row].nationality!=undefined){
									arrCategory=arrCategory.concat(rows[row].nationality.split(","));
								}
								if(rows[row].gender!=undefined){
									arrCategory.push(rows[row].gender);
								}
								if(rows[row].ethnicity!=undefined){
									arrCategory=arrCategory.concat(rows[row].ethnicity.split(","));
								}
								if(rows[row].profession!=undefined){
									arrCategory=arrCategory.concat(rows[row].profession.split(","));
								}
								if(rows[row].affiliation!=undefined){
									arrCategory=arrCategory.concat(rows[row].affiliation.split(","));
								}
								if(rows[row].contributed!=undefined){
									arrCategory=arrCategory.concat(rows[row].contributed.split(","));
								}
								if(rows[row].facts!=undefined){
									arrCategory=arrCategory.concat(rows[row].facts.split(","));
								}
								var tMessages=[arrCategory,message];
								step(null,sender,tMessages,id);
							}

				});

			});
			// sheetThinkers.getRows({offset:0,
			// 	'query':"thinker = \""+text+"\""},function(err,rows){
			// 		if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 			console.log(err);
			// 			step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 		}
			// 		var messageInfo={};
			// 		var message="";
			// 		rows=shuffle(rows);
			// 		for(var row in rows){
			// 			message=message+rows[row].description+"\n"+rows[row].author+"\n \n";
			// 		}
			// 		messageInfo.data=rows;
			// 		messageInfo.id=id;
			// 		senderToMessages[sender]=messageInfo;
			// 		sheetAuthors.getRows({offset:0,
			// 			'query':"author=\""+text+"\""},function(err2,rows2){
			// 				if(rows2==undefined || rows2==null || rows2.length==undefined || rows2.length==0){
			// 					console.log(err);
			// 					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 				}
			// 				else{
			// 					//here i return
			// 					var categoryMessage="";
			// 					var arrCategory=[];
			// 					arrCategory.push(rows[row].born);
			// 					arrCategory.push(rows[row].died);
							
			// 					arrCategory=arrCategory.concat(rows[row].century.split(","));
			// 					arrCategory=arrCategory.concat(rows[row].nationality.split(","));
			// 					arrCategory.push(rows[row].gender);
			// 					arrCategory=arrCategory.concat(rows[row].ethnicity.split(","));
			// 					arrCategory=arrCategory.concat(rows[row].profession.split(","));
			// 					arrCategory=arrCategory.concat(rows[row].affiliation.split(","));
			// 					arrCategory=arrCategory.concat(rows[row].contributed.split(","));
			// 					arrCategory=arrCategory.concat(rows[row].facts.split(","));
								
			// 					var tMessages=[arrCategory,message];
			// 					step(null,sender,tMessages,id);
			// 				}
			// 			});
					
			// 	});
		}
		else if(id==9){
			console.log("I am in id 9");

			client.query('SELECT * FROM prim_terms WHERE term = \''+text[0]+'\' AND tone LIKE \'%'+text[1]+'%\';',function(err,res){
				if(err) throw err;
				var rows= res.rows;
				var message="";
				var messageInfo={};
				for(var row in rows){
					if(rows[row].pronouns!=""){
							message=message+rows[row].pronouns+" "+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";}
					else{
							message=message+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";}

						}
				
				messageInfo.data=rows;
				messageInfo.id=id;
				senderToMessages[sender]=messageInfo;
				step(null,sender,message,id);
			});


			// });
			// sheetTerms.getRows({offset: 0,
			// 	'query': "term = \""+text[0]+"\""},function(err,rows){
			// 		if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 			console.log(err);
			// 			step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 		}else{
			// 		rows=shuffle(rows);
			// 		var messageInfo={};
			// 		var selectedRows=[];
			// 		var message="";
			// 		var selectedRows=[];
			// 		for(var row in rows){
			// 			var debateArray=rows[row].tone.split(",");
			// 			var trimDebateArray=[];
			// 			for(var index in debateArray){
			// 				trimDebateArray.push(debateArray[index].trim());
			// 			}
			// 			if(trimDebateArray.indexOf(text[1])>-1){
			// 				selectedRows.push(rows[row]);
			// 				if(rows[row].pronouns!=""){
			// 					message=message+rows[row].pronouns+" "+text[0]+" is "+rows[row].definition+"\n"+rows[row].author+"\n \n";}
			// 				else{
			// 					message=message+text[0]+" is "+rows[row].definition+"\n"+rows[row].author+"\n \n";}

							
			// 			}

			// 		}
			// 		messageInfo.data=selectedRows;
			// 		messageInfo.id=id;
			// 		senderToMessages[sender]=messageInfo;
			// 		step(null,sender,message,id);}

			// 	});
		}
		else if(id==10){
			console.log("i am in id 10");

			client.query('SELECT * FROM prim_terms WHERE term = \''+ text[1]+'\' AND author '+ 
				'IN(SELECT author FROM prim_author WHERE (born LIKE \'%'+text[0][0]+
				'%\' OR died LIKE \'%'+ text[0][0]+'%\' OR gender LIKE \'%'+text[0][0]+
				'%\' OR ethnicity LIKE \'%'+text[0][0]+'%\' OR profession LIKE \'%'+text[0][0]+'%\' OR affiliation LIKE \'%'+text[0][0]+
				'%\' OR contributed LIKE \'%'+text[0][0]+'%\' OR nationality LIKE \'%'+text[0][0]+'%\')' +
				'AND (born LIKE \'%'+text[0][1]+
				'%\' OR died LIKE \'%'+ text[0][1]+'%\' OR gender LIKE \'%'+text[0][1]+
				'%\' OR ethnicity LIKE \'%'+text[0][1]+'%\' OR profession LIKE \'%'+text[0][1]+'%\' OR affiliation LIKE \'%'+text[0][1]+
				'%\' OR contributed LIKE \'%'+text[0][1]+'%\' OR nationality LIKE \'%'+text[0][1]+'%\'));',function(err,res){

					if(err) throw err;

					var rows= res.rows;
					if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
						console.log(err);
						step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
					}else{
						var message="";
						var messageInfo={};
						for(var row in rows){
						if(rows[row].pronouns!=""){
							message=message+rows[row].pronouns+" "+text[1]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";

							}
						else{
							message=message+text[1]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";}
							
						}
						messageInfo.data=rows;
						messageInfo.id=id;
						senderToMessages[sender]=messageInfo;
						step(null,sender,message,id);
					}




			});
			
			// sheetAuthors.getRows({offset:0},function(err,rows){
			// 	if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 		console.log(err);
			// 		step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 	}else{
			// 		var categories=text[0];
			// 		var selectedAuthors=[];
			// 		for(var row in rows){
			// 			var splitCategories=[];
			// 			splitCategories.push(rows[row].born);
			// 			splitCategories.push(rows[row].died);
			// 			splitCategories=splitCategories.concat(rows[row].century.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].nationality.split(","));
			// 			splitCategories.push(rows[row].gender);
			// 			splitCategories=splitCategories.concat(rows[row].ethnicity.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].profession.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].affiliation.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].contributed.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].facts.split(","));
			// 			var trimSPlitCategories=[];
			// 			var check=true;
			// 			for(var i in splitCategories){
			// 				trimSPlitCategories.push(splitCategories[i].trim());
			// 			}
			// 			console.log(trimSPlitCategories);
			// 			for(var j in categories){
			// 				var category=categories[j];
			// 				if(trimSPlitCategories.indexOf(category)===-1){
			// 					check=false;
			// 					break;
			// 				}
			// 			}
			// 			if(check){
			// 				selectedAuthors.push(rows[row].author);
			// 			}
			// 		}


			// 		//finding terms by these authors
			// 		sheetTerms.getRows({offset:0,
			// 			'query':"term = \""+text[1]+"\""},function(err,rowsM){
			// 				if(rowsM==undefined || rowsM==null || rowsM.length==undefined || rowsM.length==0){
			// 					console.log(err);
			// 					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 				}else{
			// 				rowsM=shuffle(rowsM);
			// 				var message="";
			// 				var messageInfo={};
			// 				var selectedRows=[];
			// 				console.log(selectedAuthors);
			// 				for(var row in rowsM){
			// 					if(selectedAuthors.indexOf(rowsM[row].author)>-1){
			// 						selectedRows.push(rowsM[row]);
			// 						if(rowsM[row].pronouns!=""){
			// 							message=message+rowsM[row].pronouns+" "+text[1]+" is "+rowsM[row].definition+"\n"+rowsM[row].author+"\n \n";

			// 						}
			// 						else{
			// 							message=message+text[1]+" is "+rowsM[row].definition+"\n"+rowsM[row].author+"\n \n";
			// 						}
			// 					}
			// 				}
			// 				messageInfo.data=selectedRows;
			// 				messageInfo.id=id;
			// 				senderToMessages[sender]=messageInfo;
			// 				step(null,sender,message,id);}
			// 			});
			// 	}
			// });
		}
		else if(id==11){


			console.log("I am in id 11");

			client.query('SELECT author FROM prim_author WHERE (born LIKE \'%'+text[0][0]+
				'%\' OR died LIKE \'%'+ text[0][0]+'%\' OR gender LIKE \'%'+text[0][0]+
				'%\' OR ethnicity LIKE \'%'+text[0][0]+'%\' OR profession LIKE \'%'+text[0][0]+'%\' OR affiliation LIKE \'%'+text[0][0]+
				'%\' OR contributed LIKE \'%'+text[0][0]+'%\' OR nationality LIKE \'%'+text[0][0]+'%\')' +
				'AND (born LIKE \'%'+text[0][1]+
				'%\' OR died LIKE \'%'+ text[0][1]+'%\' OR gender LIKE \'%'+text[0][1]+
				'%\' OR ethnicity LIKE \'%'+text[0][1]+'%\' OR profession LIKE \'%'+text[0][1]+'%\' OR affiliation LIKE \'%'+text[0][1]+
				'%\' OR contributed LIKE \'%'+text[0][1]+'%\' OR nationality LIKE \'%'+text[0][1]+'%\');',function(err,res){
					if(err) throw err;
					var rows= res.rows;
					var message="";
					for(var row in rows){
						message=message+rows[row].author+" ;;";
					}
					step(null,sender,message,id);

			});
			// sheetAuthors.getRows({offset:0},function(err,rows){
			// 	if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 		console.log("999999");
			// 		console.log(err);
			// 		step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 	}else{
			// 		var categories=text;
			// 		var selectedAuthors=[];
			// 		for(var row in rows){
			// 			var splitCategories=[];
			// 			splitCategories.push(rows[row].born);
			// 			splitCategories.push(rows[row].died);
			// 			splitCategories=splitCategories.concat(rows[row].century.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].nationality.split(","));
			// 			splitCategories.push(rows[row].gender);
			// 			splitCategories=splitCategories.concat(rows[row].ethnicity.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].profession.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].affiliation.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].contributed.split(","));
			// 			splitCategories=splitCategories.concat(rows[row].facts.split(","));
			// 			var trimSPlitCategories=[];
			// 			var check=true;
			// 			for(var i in splitCategories){
			// 				trimSPlitCategories.push(splitCategories[i].trim());
			// 			}
			// 			for(var j in categories){
			// 				var category=categories[j];
			// 				if(trimSPlitCategories.indexOf(category)===-1){
			// 					check=false;
			// 					break;
			// 				}
			// 			}
			// 			if(check){
			// 				selectedAuthors.push(rows[row].author);
			// 			}
			// 		}
			// 		if(selectedAuthors.length==0){
			// 			step(null,sender,"There are no such authors.\nI am sorry for inconvinience!",id);
			// 		}
			// 		else{
			// 			var message="";
			// 			for(var i in selectedAuthors){
			// 				message=message+selectedAuthors[i]+"\n \n";
			// 			}
			// 			step(null,sender,message,id);
			// 		}
			// 	}
			// });


		}
		else if(id==12){

			client.query('SELECT * FROM prim_books WHERE title=\''+text+'\';',function(err,res){
				if(err) throw err;
				var rows= res.rows;
				if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
					console.log(rows.length);
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
				}
				else{
					rows=shuffle(rows);
					console.log('Read '+rows.length+' rows');
					var messageInfo={};
					messageInfo.data=rows;
					messageInfo.id=id;
					messageInfo.parameters=text;
					senderToMessages[sender]=messageInfo;
					console.log("message information added.......");
					var text1="";
					for(var row in rows){
			
						text1=text1+text+" "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
					}
					step(null,sender,text1,id)

				}


			});

			// sheetBooks.getRows({
			// 	offset: 0,
			// 	'query': "title = \""+text+"\""

			// 	}, function( err, rows ){
			// console.log(err);

			// if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 	console.log(rows.length);
			// 	step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// }
			// else{
			
			// 	rows=shuffle(rows);
			// 	console.log('Read '+rows.length+' rows');
			// 	var messageInfo={};
			// 	messageInfo.data=rows;
			// 	messageInfo.id=id;
			// 	messageInfo.parameters=text;
			// 	senderToMessages[sender]=messageInfo;
			// 	console.log("message information added.......");
			// 	var text1="";
			// 	for(var row in rows){
		
			// 		text1=text1+text+" "+rows[row].description+"\n"+rows[row].author+"\n \n";
			// 	}
			// 	step(null,sender,text1,id);
			// 	}
			// });
		}
		else if(id==13){

			console.log("I am in id 13");
			client.query('SELECT * FROM prim_terms WHERE term= \''+text[0]+'\' AND tags_and LIKE \'%'+text[1]+'%\'',function(err,res){
				if(err) throw err;
				var rows= res.rows;
				if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
					console.log(err);
					
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
				}
				else{
					var messageInfo={};
					messageInfo.data=rows;
					messageInfo.id=id;
					messageInfo.parameters=text;
					senderToMessages[sender]=messageInfo;
					
					var message="";
					for(var row in rows){
						if(rows[row].pronouns!=""){
					
							message=message+rows[row].pronouns+" "+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
						}else{
							message=message+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";

						}
					}

					step(null,sender,message,id);

				}


			});
			// sheetTerms.getRows({
			// 	offset: 0,
			// 	'query': "term=\""+text[0]+"\""
			// },function(err,rows){
			// 	if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 		console.log(err);
					
			// 		step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 	}
			// 	else{
			// 		rows=shuffle(rows);
			// 		var newRows=[];
			// 		console.log('Read '+rows.length+' rows');
			// 		console.log(" ;; \n ");
			// 		console.log(rows[0]);
			// 		console.log(" ;; \n");
			// 		for( var i in rows){

			// 			if(rows[i].tagsand!=undefined){
							
			// 				var tags_and=rows[i].tagsand.split(",");

			// 				var trim_tags_and=[];
			// 				for(var j = 0; j<tags_and.length; j++){
			// 					trim_tags_and.push(tags_and[j].trim());
			// 				}
						

			// 				if(trim_tags_and.indexOf(text[1])>-1){
			// 					newRows.push(rows[i]);
			// 				}
			// 			}
			// 		}
			// 		var messageInfo={};
			// 		messageInfo.data=newRows;
			// 		messageInfo.id=id;
			// 		messageInfo.parameters=text;
			// 		senderToMessages[sender]=messageInfo;
			// 		console.log("message information added.......");
			// 		var message="";
			// 		for(var row in newRows){
			// 			if(newRows[row].pronouns!=""){
					
			// 				message=message+newRows[row].pronouns+" "+text[0]+" is "+newRows[row].definition+"\n"+newRows[row].author+"\n \n";
			// 			}else{
			// 				message=message+text[0]+" is "+newRows[row].definition+"\n"+newRows[row].author+"\n \n";

			// 			}
			// 		}

			// 		step(null,sender,message,id);
					



			// 	}

			// });
		}
		else if (id==14) {
			console.log("I am in id 14");
			client.query('SELECT * FROM prim_terms WHERE term= \''+text[0]+'\' AND tags_of LIKE \'%'+text[1]+'%\';',function(err,res){
				//if(err){ throw err;}
				if(err!=null){
					console.log(err);
				}
				else{
					var rows= res.rows;
				}
				
				if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
					console.log(err);
					
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
				}
				else{
					
					var messageInfo={};
					messageInfo.data=rows;
					messageInfo.id=id;
					messageInfo.parameters=text;
					senderToMessages[sender]=messageInfo;
					
					var message="";
					for(var row in rows){
						if(rows[row].pronouns!=""){
					
							message=message+rows[row].pronouns+" "+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";
						}else{
							message=message+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";

						}
					}

					step(null,sender,message,id);

				}


			});

			// sheetTerms.getRows({
			// 	offset: 0,
			// 	'query': "term=\""+text[0]+"\""
			// },function(err,rows){
			// 	if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 		console.log(err);
					
			// 		step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 	}
			// 	else{
			// 		rows=shuffle(rows);
			// 		var newRows=[];
			// 		console.log('Read '+rows.length+' rows');
					
			// 		for( var i in rows){

			// 			if(rows[i].tagsof!=undefined){
							
			// 				var tags_of=rows[i].tagsof.split(",");

			// 				var trim_tags_of=[];
			// 				for(var j = 0; j<tags_of.length; j++){
			// 					trim_tags_of.push(tags_of[j].trim());
			// 				}
						

			// 				if(trim_tags_of.indexOf(text[1])>-1){
			// 					newRows.push(rows[i]);
			// 				}
			// 			}
			// 		}
			// 		var messageInfo={};
			// 		messageInfo.data=newRows;
			// 		messageInfo.id=id;
			// 		messageInfo.parameters=text;
			// 		senderToMessages[sender]=messageInfo;
			// 		console.log("message information added.......");
			// 		var message="";
			// 		for(var row in newRows){
					
			// 			if(newRows[row].pronouns!=""){
					
			// 				message=message+newRows[row].pronouns+" "+text[0]+" is "+newRows[row].definition+"\n"+newRows[row].author+"\n \n";
			// 			}else{
			// 				message=message+text[0]+" is "+newRows[row].definition+"\n"+newRows[row].author+"\n \n";

			// 			}					}

			// 		step(null,sender,message,id);
					



			// 	}

			// });


		}else if(id==15){
			client.query('SELECT * FROM prim_terms WHERE term= \''+text[0]+'\' AND tags_as LIKE \'%'+text[1]+'\'%',function(err,res){
				if(err) throw err;
				var rows= res.rows;
				if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
					console.log(err);
					
					step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
				}
				else{
					var messageInfo={};
					messageInfo.data=rows;
					messageInfo.id=id;
					messageInfo.parameters=text;
					senderToMessages[sender]=messageInfo;
					
					var message="";
					for(var row in rows){
						if(rows[row].pronouns!=""){
					
							message=message+rows[row].pronouns+" "+text[0]+" is "+rows[row].description+"\n"+rows[row].author+"\n \n";
						}else{
							message=message+text[0]+" is "+rows[row].description+"\n \n"+"_______________________\n"+rows[row].author+" ;;";

						}
					}

					step(null,sender,message,id);

				}


			});

			// sheetTerms.getRows({
			// 	offset: 0,
			// 	'query': "term=\""+text[0]+"\""
			// },function(err,rows){
			// 	if(rows==undefined || rows==null || rows.length==undefined || rows.length==0){
			// 		console.log(err);
					
			// 		step(null,sender,"I am sorry but i could not find any such term. Please contact Ryan for further infromation",450);
			// 	}
			// 	else{
			// 		rows=shuffle(rows);
			// 		var newRows=[];
			// 		console.log('Read '+rows.length+' rows');
					
			// 		for( var i in rows){

			// 			if(rows[i].tagsas!=undefined){
							
			// 				var tags_as=rows[i].tagsas.split(",");

			// 				var trim_tags_as=[];
			// 				for(var j = 0; j<tags_as.length; j++){
			// 					trim_tags_as.push(tags_as[j].trim());
			// 				}
						

			// 				if(trim_tags_as.indexOf(text[1])>-1){
			// 					newRows.push(rows[i]);
			// 				}
			// 			}
			// 		}
			// 		var messageInfo={};
			// 		messageInfo.data=newRows;
			// 		messageInfo.id=id;
			// 		messageInfo.parameters=text;
			// 		senderToMessages[sender]=messageInfo;
			// 		console.log("message information added.......");
			// 		var message="";
			// 		for(var row in newRows){
					
			// 			if(newRows[row].pronouns!=""){
					
			// 				message=message+newRows[row].pronouns+" "+text[0]+" is "+newRows[row].definition+"\n"+newRows[row].author+"\n \n";
			// 			}else{
			// 				message=message+text[0]+" is "+newRows[row].definition+"\n"+newRows[row].author+"\n \n";

			// 			}			
			// 		}

			// 		step(null,sender,message,id);
					



			// 	}

			// });

		}


	},

	function (sender,text,id,callback){
		if(id==8){
			var categoryMessage=text[0];
			var requestArray=[];
			for(var index in categoryMessage){
				var messageData={
					text:categoryMessage[index]
				}

				requestArray.push(new Promise(function(resolve,reject){
					request({
					url: 'https://graph.facebook.com/v2.6/me/messages',
					qs: {access_token:token},
					method: 'POST',
					json: {
						recipient: {id:sender},
						message: messageData,
					}
					}, function(error, response, body) {
						resolve();
					if (error) {
						console.log('Error sending messages: ', error)
					} else if (response.body.error) {
						console.log('Error: ', response.body.error)
					}
					
					});

				}));
				
			}
			Promise.all(requestArray).then(function(resolve){
				callback(null,sender,text[1],id);
			});
		}
		else{
			callback(null,sender,text,id);
		}
	}
	,
	function sendTextMessage(sender, text,id,callback) {
		//client.done();
		var quickReplies=[
			 {
		      	//this is like
		        "content_type":"text",
		        "title":"Like",
		        "payload":"0",
		        "image_url":"https://image.ibb.co/hTUPc5/Webp_net_resizeimage_4.png"
		      },
		      {
		      	//this is dislike
		        "content_type":"text",
		        "title":"Dislike",
		        "payload":"1",
		        "image_url":"https://image.ibb.co/gNHAH5/Webp_net_resizeimage.png"
		      },
		      {
		      	//this is more
		      	"content_type":"text",
		      	"title":"Next",
		      	"payload":"2"
		      }
		    ];
		
		if(text!=null && sender!=null){
			console.log("----------------------"+text.length+"---------------------------");
			if(text.length>620){
				var string2=text;
				var messages="";
				
				messages=text.split(";;");
				
				
				var counter=0;
				var messageRequests=[];
				// HERE THE MESSAGEREQUESTS ARRAY WILL BE SAVED 
				

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

				//for(var i = 0 ; i < messages.length;i++){
				let messageData={};
				
				if(id==0 || id==1 || id==3 || id==7 || id==8 || id==9|| id==10 || id==12 || id==13|| id==14 || id==15){
					if(id==12){
						messageData = { 
						text:messages[0],
						"quick_replies":createQuickRepliesWithoutSource(0,messages.length)
					 	}
					}
					else{
						messageData = { 
							text:messages[0],
							"quick_replies":createQuickReplies(0,messages.length)
						 }
					}
					senderToMessages[sender].msg=messages;
					senderToIndex[sender]=0;
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
				else{
					

					for(var index in messages){
						console.log(messages[index]);
						messageData = { 
							text:messages[index]
					 	}
						messageRequests.push(new Promise(function(resolve,reject){

							resolve(sender);
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
						}));}
						console.log(messages);
						Promise.all(messageRequests).then(function(values){
					
					callback(null,values[0]);}); 
						
				}

				
				//use promises and call callback once all of these processes have been completed.

				//}
				
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
				var messages=text.split(";;");
				let messageData={};
				if(id==0 || id==1 || id==3 || id==7 || id== 8 ||id==9|| id==10 || id==12 || id==13 || id==14 || id==15){

					if(id==12){
						messageData = { 
						text:messages[0],
						"quick_replies":createQuickRepliesWithoutSource(0,messages.length)
					 	}
					}
					else{
						messageData = { 
							text:messages[0],
							"quick_replies":createQuickReplies(0,messages.length)
						 }
					}
					 senderToMessages[sender].msg=messages;
					senderToIndex[sender]=0;
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
				else{
					var messageRequests=[];
					for(var index in messages){
						console.log(messages[index]);
						messageData = { 
							text:messages[index]
					 	}
						messageRequests.push(new Promise(function(resolve,reject){
							console.log("sending");
							resolve(sender);
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
						}));}
						Promise.all(messageRequests).then(function(values){
					
					callback(null,values[0]);}); 
				}}
			}
		else{
			callback();
		}

	},
	
	],function(err){
    if( err ) {
    	//hide message bubble
    	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			"sender_action": "typing_off",
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
      console.log('Error: '+err);
    }

	})
}


//shuffle function
function shuffle(array) {
	
	
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function createQuickReplies(index,realSize){
	var size= realSize-1;

	var indexing=(index+1).toString()+"/"+size.toString();
	console.log(" ;;  ;; i am in "+indexing+" ;; \n \n")

	var quickReplies=[
			 {
		      	//this is like
		        "content_type":"text",
		        "title":"Like",
		        "payload":"0",
		        "image_url":"https://image.ibb.co/i5gJ8a/Pasted_File_at_August_17_2017_12_08_AM.png"
		      },
		      {
		      	//this is dislike
		        "content_type":"text",
		        "title":"Source",
		        "payload":"1"
		      },
		      {
		      	//this is more
		      	"content_type":"text",
		      	"title":indexing,
		      	"payload":"2"
		      }
		    ];
	return quickReplies;

}
function splitString(string,delimeter){
	var arr=[];
	if(string!=undefined){
	var textArr= string.split(delimeter);
	
	for(let elem of textArr){

		arr.push(elem.trim());
	}
	return arr;}
	else{ return arr;}
}
function createQuickRepliesWithoutSource(index,realSize){
	var size= realSize-1;

	var indexing=(index+1).toString()+"/"+size.toString();
	console.log(" ;;  ;; i am in "+indexing+" ;; \n \n")

	var quickReplies=[
			 {
		      	//this is like
		        "content_type":"text",
		        "title":"Like",
		        "payload":"0",
		        "image_url":"https://image.ibb.co/i5gJ8a/Pasted_File_at_August_17_2017_12_08_AM.png"
		      },
		      {
		      	//this is more
		      	"content_type":"text",
		      	"title":indexing,
		      	"payload":"2"
		      }
		    ];
	return quickReplies;

}

function sendQuickResponseWithoutSource(sender, text, index, size){
//
	// let messageData= {
 //    "text":text,
 //    "quick_replies":[
 //      {
 //      	//this is like
 //        "content_type":"text",
 //        "title":"Like",
 //        "payload":"0",
 //        "image_url":"https://image.ibb.co/hTUPc5/Webp_net_resizeimage_4.png"
 //      },
 //      {
 //      	//this is dislike
 //        "content_type":"text",
 //        "title":"Dislike",
 //        "payload":"1",
 //        "image_url":"https://image.ibb.co/gNHAH5/Webp_net_resizeimage.png"
 //      },
 //      {
 //      	//this is more
 //      	"content_type":"text",
 //      	"title":"Next",
 //      	"payload":"2"
 //      }
 //    ]
	// }
	let messageData= {
    "text":text,
    "quick_replies":createQuickRepliesWithoutSource(index,size)
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
		hideMessageBubble(sender);
	})

}

function handleSource(sender,messages){


	var message= senderToMessages[sender];
	var rows= message.data;
	
	var reqRow= rows[senderToIndex[sender]];
	var citation=reqRow.citation;
	var lng="\""+reqRow.lng+"\"";

	var requestArray=[];
	
		let messageData = { text:citation }

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
					sendQuickResponseWithoutSource(sender,lng,senderToIndex[sender],messages.length);
					});


	
	

}
function testQuery(){
	

	

}


// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

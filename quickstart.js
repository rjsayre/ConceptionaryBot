var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var Promise= require('promise');

//2, 35 needs to be entered again
// spreadsheet key is the long id in the sheets URL 

var sheetAuthorID='1Sbv9hV9INcUmmLbRSuZEnxThOjik2YWv4jwMV6eZbus';
var sheetTermsID='1F2u1dncLs7ZCSnnjb9HvwY1axltXwq-sGDb60RK_B1k';
// var doc = new GoogleSpreadsheet('1Sbv9hV9INcUmmLbRSuZEnxThOjik2YWv4jwMV6eZbus');
// var doc2= new GoogleSpreadsheet('12GhaeoSgaBUTy6g8BLeKNA9Xmp7UszpWD5heOUb-bIw');
//1F2u1dncLs7ZCSnnjb9HvwY1axltXwq-sGDb60RK_B1k
var sheet;
var sheet2;
var doc;
var doc2;



async.waterfall([

  function (step){

    step(null,1);
  },
  function (id,step) {
    // see notes below for authentication instructions! 
    
    var creds = require('./privatekey.json');
    // OR, if you cannot save the file locally (like on heroku) 
    console.log("in auth")
    var creds_json ={
      "type": "service_account",
      "project_id": "kitchen-28900",
      "private_key_id": "f57e99452c628c1f9caaf60e8ce6dafa00081a3a",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC6WYyLuHNBEgBP\nussGaALmJ7hkiY6P5dKAHUvY3JtU9TYh0tFb6cB6ZqLZK+GxoN+Voqs3Ndpq2mgu\nQCVxiBB6lAw/FP5b+vXFZJFWDX6Bg4qRTfEmj3Jh6om/gLzr5dBXbDhKobskZ5ld\nw6tcjWJXcGKDIcdM3xmOeZL4McP3WHqtbIdHrfDjlYwX6CwAu9lBs6sKkl8smlaI\nm7P0TbChwqKNnS5g3aVmAO179/lNEjf95Iyw6Cnzsp4SUTbbT6QlhLdu8OKgBi2F\nxqsPVDaVcmDCl641njs9QvJzW8b7hlms8ykbs1lyryM7OF1ycFZ688E1WzxvDUKC\nE2pvHZYdAgMBAAECggEAEgEN4FVD+WZKVmmsgjlxXO2QgKd+Tm58wyOmzNR/mMU6\nONQGpd6J2f7pk+7hQYlSoME/Jo3oRN5GJisiEvvQ5RmXAfnpcKyTVezB/UeU0Iw2\nH+ohDEHcDL7IFpL9wxLd6Vxg0evEn3SiRNoJ8olhwM3wY/f9qp0mzx+gMKTqPeQ0\neC/J5Va2IfwOUG00mEvVgvRDI9MaDIM3Szl6qfEsFqGiZvOyUDp9gxL7yxGFtBx3\nvbUyTnbxPmWpLVM/D2973CBH36BlPZvU2pZuZQE55qDB21FEjQw/Xjbi4jYkDA7f\nyKcgVwLK1CD97dlj8vhCj24n9t+MdbK97VBFjucnBwKBgQDhbdCPyg4CPIItMU/Q\nhGZ5d+TnO8LIil+4IbZq2nIWshuY92pVnEKxNzT1seFN94BwUwIjfH0ovt5PFi5P\nca6hQwOK62RoWEWe9vc6kqn1cMaMm5J5Rp+a4had+gb9cSzlPRf/tdg3gXQU4Diu\nFjr3MqoCmXENcVM6aOelkuB0YwKBgQDTnwdQQEKbJFldQCQ2eKuwF5QRvAA5jsqW\nKcmFXbUAlzjBO4yV1NUoUMPw6gJebE4Ed9RtmTOUUdeYCXDtHNssGW/4fXkoPVhZ\nMw4RMc9CUJznWOLwvcWRlkd5pV2r6r0+d7rwVMuwFgsVMdWOxaLpOVcXR2oLoZxe\n5pBiwwWTfwKBgQDC2K46eoTdPfuuoD7Clo4UU6MQksDroV7Wwpzvgty17UCZWNEa\nKjQjBPrLmvKI93KWo8jnb0SnIUL5zMw+cp5kWI4JVyi0YAfdPM24XOh2cwHKqvVR\nyc9OijjOVzwPd/E8OzAxH7ZBU61IFf4nyqMw4yO7l3D2E4vCosYGgQtszQKBgQC5\n7/3uDjg3tm1qmMP4tHgt5dms52HPMN5hqF+vddFmrngomFkDARk1LhmroQDp1AGM\nvXkBv11pkat7o7f8LqGIkuUmEaEVsSjiXxCaHQi9fLUQNLJZ0nQ4YjF0+c5fEoaq\nz2qKZgb+NbARNFMu+goVH9Oc2ZuckqghXjY5AJ/yowKBgQDcmrh0AQNFuL63R6UM\nl8ADomMU1Cn2dte1ClWy2t8BJ3vTi4cusDcvNB92gQIrrYFzo21s9puCfBUyfrSk\nXX/IWqpC6gbckjqpmkTy+3DejIi4Qaz9V4oyuomEz8RgYLnvbFuqhq91UiF4/ywU\n+vAwrMSkOWYe/dJzpY8IcaOVyg==\n-----END PRIVATE KEY-----\n",
      "client_email": "sheetsdemo@kitchen-28900.iam.gserviceaccount.com",
      "client_id": "114148646155367006182",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://accounts.google.com/o/oauth2/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/sheetsdemo%40kitchen-28900.iam.gserviceaccount.com"
    }
    doc= new GoogleSpreadsheet(sheetAuthorID);
    if(id==1){
       
    }
    else if(id==0){

    }
    doc.useServiceAccountAuth(creds_json,step);
   
    
  },

  function (step){
     var creds_json ={
      "type": "service_account",
      "project_id": "kitchen-28900",
      "private_key_id": "f57e99452c628c1f9caaf60e8ce6dafa00081a3a",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC6WYyLuHNBEgBP\nussGaALmJ7hkiY6P5dKAHUvY3JtU9TYh0tFb6cB6ZqLZK+GxoN+Voqs3Ndpq2mgu\nQCVxiBB6lAw/FP5b+vXFZJFWDX6Bg4qRTfEmj3Jh6om/gLzr5dBXbDhKobskZ5ld\nw6tcjWJXcGKDIcdM3xmOeZL4McP3WHqtbIdHrfDjlYwX6CwAu9lBs6sKkl8smlaI\nm7P0TbChwqKNnS5g3aVmAO179/lNEjf95Iyw6Cnzsp4SUTbbT6QlhLdu8OKgBi2F\nxqsPVDaVcmDCl641njs9QvJzW8b7hlms8ykbs1lyryM7OF1ycFZ688E1WzxvDUKC\nE2pvHZYdAgMBAAECggEAEgEN4FVD+WZKVmmsgjlxXO2QgKd+Tm58wyOmzNR/mMU6\nONQGpd6J2f7pk+7hQYlSoME/Jo3oRN5GJisiEvvQ5RmXAfnpcKyTVezB/UeU0Iw2\nH+ohDEHcDL7IFpL9wxLd6Vxg0evEn3SiRNoJ8olhwM3wY/f9qp0mzx+gMKTqPeQ0\neC/J5Va2IfwOUG00mEvVgvRDI9MaDIM3Szl6qfEsFqGiZvOyUDp9gxL7yxGFtBx3\nvbUyTnbxPmWpLVM/D2973CBH36BlPZvU2pZuZQE55qDB21FEjQw/Xjbi4jYkDA7f\nyKcgVwLK1CD97dlj8vhCj24n9t+MdbK97VBFjucnBwKBgQDhbdCPyg4CPIItMU/Q\nhGZ5d+TnO8LIil+4IbZq2nIWshuY92pVnEKxNzT1seFN94BwUwIjfH0ovt5PFi5P\nca6hQwOK62RoWEWe9vc6kqn1cMaMm5J5Rp+a4had+gb9cSzlPRf/tdg3gXQU4Diu\nFjr3MqoCmXENcVM6aOelkuB0YwKBgQDTnwdQQEKbJFldQCQ2eKuwF5QRvAA5jsqW\nKcmFXbUAlzjBO4yV1NUoUMPw6gJebE4Ed9RtmTOUUdeYCXDtHNssGW/4fXkoPVhZ\nMw4RMc9CUJznWOLwvcWRlkd5pV2r6r0+d7rwVMuwFgsVMdWOxaLpOVcXR2oLoZxe\n5pBiwwWTfwKBgQDC2K46eoTdPfuuoD7Clo4UU6MQksDroV7Wwpzvgty17UCZWNEa\nKjQjBPrLmvKI93KWo8jnb0SnIUL5zMw+cp5kWI4JVyi0YAfdPM24XOh2cwHKqvVR\nyc9OijjOVzwPd/E8OzAxH7ZBU61IFf4nyqMw4yO7l3D2E4vCosYGgQtszQKBgQC5\n7/3uDjg3tm1qmMP4tHgt5dms52HPMN5hqF+vddFmrngomFkDARk1LhmroQDp1AGM\nvXkBv11pkat7o7f8LqGIkuUmEaEVsSjiXxCaHQi9fLUQNLJZ0nQ4YjF0+c5fEoaq\nz2qKZgb+NbARNFMu+goVH9Oc2ZuckqghXjY5AJ/yowKBgQDcmrh0AQNFuL63R6UM\nl8ADomMU1Cn2dte1ClWy2t8BJ3vTi4cusDcvNB92gQIrrYFzo21s9puCfBUyfrSk\nXX/IWqpC6gbckjqpmkTy+3DejIi4Qaz9V4oyuomEz8RgYLnvbFuqhq91UiF4/ywU\n+vAwrMSkOWYe/dJzpY8IcaOVyg==\n-----END PRIVATE KEY-----\n",
      "client_email": "sheetsdemo@kitchen-28900.iam.gserviceaccount.com",
      "client_id": "114148646155367006182",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://accounts.google.com/o/oauth2/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/sheetsdemo%40kitchen-28900.iam.gserviceaccount.com"
    }
    doc2= new GoogleSpreadsheet(sheetTermsID);
    doc2.useServiceAccountAuth(creds_json,step);
  },
  function (step) {
    console.log("yayyy authenticated");
   doc.getInfo(function(err, info) {
    console.log('Loaded doc: '+info.title+' by '+info.author.email);
    sheet = info.worksheets[0];
    console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
    doc2.getInfo(function(err,info2){
      console.log(err);
      sheet2= info2.worksheets[0];
      step();

    });
    
    });
  },
  function (step) {
    
    // google provides some query options 
    sheet2.getRows({
      offset: 0,
      query: "term = \"testerm1\"",
      // 'query': "in"

      
    }, function( err, rows ){
      if(rows==undefined || rows==null || rows.length==undefined ||rows.length==0){
        console.log("row is 0");
        console.log(err);
         step();
    }
    else{
        console.log(err);
        var authors=[];
        var asynArrays=[];
        for(var row in rows){
        console.log(rows[row].author +"::::"+rows[row].dislikes);
        if(rows[row].dislikes==""){
          rows[row].dislikes="0";
          rows[row].term=""+rows[row].term;
          rows[row].author=""+rows[row].author;
          asynArrays.push(new Promise(function(resolve,reject){
            rows[row].save(resolve);
          }));
          
          console.log("assumption wins");
        }

        // var dislikes= +rows[row].dislikes;
        // dislikes=dislikes+1;
        // rows[row].dislikes=""+dislikes;
        // rows[row].save();
      }
      Promise.all(asynArrays).then(function(values){
        step();
      });
      
      // for(var row in rows)
      // {
      //   var arrCategory=rows[row].info.split(",");
      //   for(var index in arrCategory){
      //     if(arrCategory[index].trim() =="pigs"){
      //       authors.push(rows[row].author);
      //     }
      //   }
        
      //   console.log(rows[row].info);
      // }

      console.log('Read '+rows.length+' rows');
      for(var author in authors){
        console.log("author hogaya"+authors[author]);

      }
      //step();
    

      
      
      }
      
      // the row is an object with keys set by the column headers 
      //rows[0].hello = 'new val';
      //rows[0].save(); // this is async 
 
      // deleting a row 
      //rows[0].del();  // this is async 
 
      
    });
  }
  // function workingWithCells(step) {
  //   sheet.getCells({
  //     'min-row': 1,
  //     'max-row': 5,
  //     'return-empty': true
  //   }, function(err, cells) {
  //     var cell = cells[0];
  //     console.log('Cell R'+cell.row+'C'+cell.col+' = '+cell.value);
 
  //     // cells have a value, numericValue, and formula 
  //     cell.value == '1'
  //     cell.numericValue == 1;
  //     cell.formula == '=ROW()';
 
  //     // updating `value` is "smart" and generally handles things for you 
  //     cell.value = 123;
  //     cell.value = '=A1+B2'
  //     cell.save(); //async 
 
  //     // bulk updates make it easy to update many cells at once 
  //     cells[0].value = 1;
  //     cells[1].value = 2;
  //     cells[2].formula = '=A1+B1';
  //     sheet.bulkUpdateCells(cells); //async 
 
  //     step();
  //   });
  // },
  // function managingSheets(step) {
  //   doc.addWorksheet({
  //     title: 'my new sheet'
  //   }, function(err, sheet) {
 
  //     // change a sheet's title 
  //     sheet.setTitle('new title'); //async 
 
  //     //resize a sheet 
  //     sheet.resize({rowCount: 50, colCount: 20}); //async 
 
  //     sheet.setHeaderRow(['name', 'age', 'phone']); //async 
 
  //     // removing a worksheet 
  //     sheet.del(); //async 
 
  //     step();
  //   });
  // }
], function(err){
    if( err ) {
      console.log('Error: '+err);
    }
});


function trim (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
var pg = require('pg');


var query1 = 'CREATE TABLE LittUser(user_id SERIAL PRIMARY KEY, user_name TEXT, password TEXT, real_name TEXT, toy TEXT, spot TEXT, bg_color TEXT, bio TEXT, website  TEXT, location TEXT, image_URL  TEXT)';
var query2 = 'CREATE TABLE Litts(litt_id SERIAL Primary key, user_id INT, Date timestamp DEFAULT now(), text TEXT)';

var conString = process.env.DATABASE_URL || 'postgres://localhost:5432/';


pg.connect(conString, function(err, client, done) {
	
   // set up User table
   client.query(query1);
   
   // set up Litt table
   client.query(query2);
/*
  client.query('SELECT * FROM my_table', function(err, result) {
    done();
    if(err) return console.error(err);
    console.log(result.rows);
  });
  */
  
  var testData = require('./test_data.json');
  
  var sampleTweets = {};
  
  for (var i in testData){
  	var data = testData[i];
  	var insertQ = 'INSERT INTO LittUser(user_name, password, real_name, toy, spot, bg_color, bio, image_URL, location, website) VALUES (';
  	//insertQ += i + ',';
  	insertQ += '\'' + data.userName + '\',';
  	insertQ += '\'' + data.password + '\',';
  	insertQ += '\'' + data.realName + '\',';
  	insertQ += '\'' + data.toy + '\',';
  	insertQ += '\'' + data.spot + '\',';
  	insertQ += '\'' + data.bgColor + '\',';
  	insertQ += '\'' + data.bio + '\',';
  	insertQ += '\'' + data.img + '\',';
  	insertQ += '\'' + data.location + '\',';
  	insertQ += '\'' + data.website + '\'';
  	insertQ += ')';
  	
  	client.query(insertQ);
  	
  	sampleTweets[data.userName] = data.messages;
  	
  }
  
  console.log('SampleTweets = ' + sampleTweets);
  client.query('SELECT user_id, user_name FROM LittUser', function(err, result) {
  	console.log('results = ' + result);
 
  	for (var i in result.rows){
  		var row = result.rows[i];
  		console.log('row = ' + row);
  		var messages = sampleTweets[row['user_name']];
  		
  		console.log('row name ' + row['user_name']);
  		console.log('messages ' + messages);
    	for (var j in messages){
			var message = messages[j];
			console.log(result.rows);
			insertQ = 'INSERT INTO Litts(user_id, text) VALUES (';
			insertQ += row['user_id'] + ',';
			insertQ += '\'' + message + '\'';
			insertQ += ')';
	
			client.query(insertQ);
  		}
  	}
  });
  
  done();

  
});

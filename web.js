// api
var restify = require('restify');

// pg
var pg = require('pg');
var conString = process.env.DATABASE_URL || 'postgres://localhost:5432/';


function respond(req, res, next) {
  res.send('hello ' + req.params.name);
}

function getAll(req, res, next){
	pg.connect(conString, function(err, client, done) {
		var returnObj = {};
		client.query('SELECT user_id, user_name, password, real_name, toy, spot, bg_color, bio, website, location, image_URL FROM LittUser', function(err, result) {
    		done();
    		if(err) res.send(err);
    		returnObj.Users = result.rows;
    		client.query('SELECT * FROM Litts ORDER BY litt_id DESC;', function(err, result) {
    			done();
    			if(err) res.send(err);
    			returnObj.Litts = result.rows;
    			res.send(returnObj);
    		});
    		
  		});
	});
}

function postNewLitt(req, res, next){
  console.log(req.body);
  if (req.params.litt === undefined) {
    return next(new restify.InvalidArgumentError('Litt message must be supplied'))
  }
  
  pg.connect(conString, function(err, client, done) {
  	var insertQ = 'INSERT INTO Litts(user_id, text) VALUES (';
	insertQ += req.params.userId + ',';
	insertQ += '\'' + req.params.litt + '\'';
	insertQ += ')';
	client.query(insertQ, function(err, result) {
		done();
    	var returnObject = {};
    	if(err) {
    		returnObject.success=0;
    		returnObject.message=err;
    		res.send(returnObject);
    	} else {
    		client.query('SELECT * FROM Litts ORDER BY litt_id DESC LIMIT 1;', function(err, result) {
    			done();
    			returnObject.success=1;
    			returnObject.litt_id = result.rows[0]["litt_id"];
    			res.send(returnObject);
    		});
    	}
	});
	
  });
  
}

function postNewUser(req, res, next){
  console.log(req.body);
  if (req.params.userName === undefined) {
    return next(new restify.InvalidArgumentError('User name must be supplied'))
  }
  
  pg.connect(conString, function(err, client, done) {
  	var insertQ = 'INSERT INTO LittUser(user_name, password, real_name, toy, spot, bg_color, bio, location, image_URL, website) VALUES (';
  	//insertQ += i + ',';
  	insertQ += '\'' + req.params.userName + '\',';
  	insertQ += '\'' + req.params.password + '\',';
  	insertQ += '\'' + req.params.realName + '\',';
  	insertQ += '\'' + req.params.toy + '\',';
  	insertQ += '\'' + req.params.spot + '\',';
  	insertQ += '\'' + req.params.bgColor + '\',';
  	insertQ += '\'' + req.params.bio + '\',';
  	insertQ += '\'' + req.params.location + '\',';
  	insertQ += '\'http://www.redrovercamping.com/sites/all/themes/rr2/images/default_usr.png\',';
  	insertQ += '\'' + req.params.website + '\'';
  	insertQ += ')';
  	
  	client.query(insertQ);
	client.query(insertQ, function(err, result) {
		done();
		var returnObject = {};
    	if(err) {
    		returnObject.success=0;
    		returnObject.message=err;
    		res.send(returnObject);
    	} else {
    		client.query('SELECT user_id FROM LittUser WHERE user_name = \''+req.params.userName+'\'', function(err, result) {
				done();
    			returnObject.success=1;
    			returnObject.userId = result.rows[0]["user_id"];
    			res.send(returnObject);
    		});
    	}
	});
	
  });
  
}

function authUser(req, res, next){
	console.log(req.params.u);
	pg.connect(conString, function(err, client, done) {
	
		var query = "SELECT user_id FROM LittUser ";
		query += " WHERE user_name = '"+req.params.u+"' ";
		query += "AND password = '"+req.params.p+"'";
		console.log(query);
		client.query(query, function(err, result) {
			done();
    		if(err) res.send(err);
    		var returnObj = {};
    		console.log(result.rowCount);
    		if (result.rowCount == 1){
    			returnObj.success = 1;
    			returnObj.userId = result.rows[0]["user_id"];
    		} else
    			returnObj.success = 0;
    			
    		console.log(returnObj);
    		res.send(returnObj);
		});
	});
}



var server = restify.createServer();
server.use(restify.bodyParser());
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.get('/api/all', getAll);
server.post('/api/:userId/litt', postNewLitt);

server.post('/api/auth', authUser);
server.post('/api/newUser', postNewUser);


var PORT = process.env.PORT || 5000;

server.listen(PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});

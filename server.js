const express = require('express');
const cors = require('cors');
const app = express(); //server-app
const protect = require('./protect');
const users = require("./users");
const messages = require("./messages");

//use middleware
app.use(cors());
//app.use(express.static('client')); //serve client files
app.use('/', protect); //protecting the routes
app.use('/users', users);       //route  
app.use('/messages', messages); //route 

// start server
var port = process.env.PORT || 3000;

app.listen(port, function () {
    //console.log('Server listening on port 3000!');
});

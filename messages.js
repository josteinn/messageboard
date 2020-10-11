const express = require('express');
const dbHandler = require("./dbhandler");
const global = require('./global');
const router = express.Router();

router.use(express.json({limit: '1mb'}));

//general error handling
router.use(function (err, req, res, next) {
    errorHandler(err, req, res);
});

// api ====================================================
// create new message -------------------------------------
router.post('/', async function (req, res) {     
    try {
        
        let title = req.body.title;
        let msg = req.body.msg;
        
        if (!title) {
            res.status(500).json({err: "SRV02", msg: "Missing valid message data"});
            return;
        }
        
        let result = await dbHandler.addMessage(title, msg, global.logindata.id);
        res.status(200).json(result[0]); 
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }            
});

// list messages ------------------------------------------
router.get('/', async function (req, res) {    
    try {
        let result = await dbHandler.getMessages();
        res.status(200).json(result);
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }              
});

// get a message ------------------------------------------
router.get('/:id', async function (req, res) {     
    try {
        let id = req.params['id'];
        let result = await dbHandler.getMessage(id);        
        res.status(200).json(result[0]);        
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }             
});

// delete message -----------------------------------------
router.delete('/:id', async function (req, res) {     
    try {
        let id = req.params['id'];
        let userid = global.logindata.id;
        let result = await dbHandler.delMsg(id, userid);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        }
        else {
            res.status(500).json({err: "DB00", msg: "Database error", descr: "Can't delete"});
        }
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }    
});

//general error handling --------------------------------
router.use(function (err, req, res, next) {
    res.status(500).json({err: "SRV00", msg: "Server error", details: err});
});

// export------------------------------------------------
module.exports = router;
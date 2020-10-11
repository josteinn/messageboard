const express = require('express');
const dbHandler = require("./dbhandler");
const global = require('./global');
const jimp = require('jimp');
const multer = require('multer');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const router = express.Router();

router.use(express.json({limit: '1mb'}));

//configuring multer
let storage = multer.memoryStorage()
let filesizeLimit = {fileSize: 1000000}
let uploadFormdata = multer({ storage: storage, limits: filesizeLimit }).single("avatar");

// api ====================================================
// create new user ----------------------------------------
router.post('/', function (req, res) { 
    
    //formdata or json?
    let contentType = req.headers["content-type"];
    
    if (contentType.search("multipart/form-data") != -1) {
        uploadFormdata(req, res, function(err){
            handleFormdata(req, res, err);
        });
    }
    else {
        handleJsondata(req, res);
    }     
});

// login -------------------------------------------------
router.post('/auth/', async function (req, res) {     
    
    try {
        
        let email = req.body.email;
        let psw = req.body.psw;
                
        if (!email || !psw) {
            res.status(500).json({err: "SRV01", msg: "Missing valid user data"});
            return;
        }        
        
        let result = await dbHandler.getUserPsw(email);        

        if (result.length == 0) {
            res.status(401).json({err: "AUTH03", msg: "User doesn't exist."});
        }
        else {
            let check = bcrypt.compareSync(psw, result[0].psw);
            if (check) {
                let payload = {id: result[0].id};
                let tok = jwt.sign(payload, global.secret, {expiresIn: "12h"});
                let downdata = {
                    email: result[0].email,
                    avatar: result[0].avatar,
                    token: tok
                }
                res.status(200).json(downdata);
            }
            else {
                res.status(401).json({err: "AUTH04", msg: "Wrong password."});
            }
        }      
    }
    catch(err) {
        res.status(500).json({err: "SRV00", msg: "Server error", dscr: err.message});
    }         
});

// delete user -------------------------------------------
router.delete('/', async function (req, res) {     
    try {
        let userid = global.logindata.id;
        let result = await dbHandler.delUser(userid);

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

// list users -------------------------------------------
router.get('/', async function (req, res) {     
    try {
        let result = await dbHandler.getUsers();
        res.status(200).json(result); 
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }           
});

// get a single user ------------------------------------
router.get('/:userid', async function (req, res) {
    let userid = req.params['userid'];    
    try {
        let result = await dbHandler.getUser(userid);
        res.status(200).json(result[0]); 
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }           
});

//general error handling --------------------------------
router.use(function (err, req, res, next) {
    res.status(500).json({err: "SRV00", msg: "Server error", details: err});
});

// helper functions ======================================
// handleJsondata ----------------------------------------
async function handleJsondata(req, res) {

    let imagedata = "";
    let imgBs64 = req.body.avatar;
    let email = req.body.email;
    let psw = req.body.psw;

    if (!email || !psw) {
        res.status(500).json({err: "SRV01", msg: "Missing valid user data"});
        return;
    }

    psw = bcrypt.hashSync(psw, 10);    
    
    let buffer = Buffer.from(imgBs64.replace(/^data:image\/\w+;base64,/, ""),'base64');        

    //handle the image
    if (imgBs64) {
        try {
            let image = await jimp.read(buffer);
            image.greyscale();        
            image.resize(100, 100);        
            imagedata = await image.getBase64Async("image/png"); //image as text data       
        }
        catch(err) {
            res.status(500).json({err: "IMG00", msg: "Can't handle image", dscr: err.message});
            return;
        }
    }
    
    try {
        let result = await dbHandler.addUser(email, psw, imagedata);
        res.status(200).json(result[0]); //send response
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }    
}

// handleFormdata ----------------------------------------
async function handleFormdata(req, res, err) {           
    
    //error handling for multer
    if (err) {
        res.status(500).json({err: "FILE00", msg: "Can't handle file", dscr: err.message});
        return;
    } 
    
    let imagedata = ""; 
    let imageFile = req.file;
    let email = req.body.email;
    let psw = req.body.psw;
    
    if (!email || !psw) {
        res.status(500).json({err: "SRV01", msg: "Missing valid user data"});
        return;
    }
    
    psw = bcrypt.hashSync(psw, 10);  

    //handle the image
    if (imageFile) {
        try {
            let image = await jimp.read(imageFile.buffer);
            image.greyscale();        
            image.resize(100, 100);        
            imagedata = await image.getBase64Async("image/png"); //image as text data                
        }
        catch(err) {
            res.status(500).json({err: "IMG00", msg: "Can't handle image", dscr: err.message});
            return;
        }
    }
    
    try{
        let result = await dbHandler.addUser(email, psw, imagedata);
        res.status(200).json(result[0]); //send response 
    }
    catch(err) {
        res.status(500).json({err: "DB00", msg: "Database error", details: err});
    }
       
}

// export------------------------------------------------
module.exports = router;
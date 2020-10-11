let jwt = require('jsonwebtoken');
let global = require('./global');

function protect(req, res, next) {
        
    //exeptions -------------------------
    if (req.path == '/users/auth/') {        
        next();
    }
    else if (req.path == '/users/' && req.method == 'POST') {
        next();
    }
    else if (req.path == '/' && req.method == 'GET') {
        next();
    }
    else {
        //protecting ---------------------
        let token = req.headers['authorization'];

        if (token) {
            try {
                global.logindata = jwt.verify(token, global.secret);
                next();
            }
            catch(err) {
                res.status(403).json({code: "AUTH01" , msg: "No valid token."});
            }            
        }
        else {
            res.status(403).json({code: "AUTH02", msg: "No token."});
        }        
    }      

}

// export --------------------------------
module.exports = protect;
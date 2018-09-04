var express = require('express');
var router = express.Router();
var request = require("request");
var phoney = require ("phone");

let salt = '95188462337';         // Random numeric string.
let timestamp = Math.floor(new Date().getTime() / 1000)-15;
let access_key = 'FEF80B413EBC9F9C1B6D'; // Unique string for each user, assigned by Rapyd.
let secret_key = 'a6084a1fe12d425053bc714fba40ff8107f3c4183a912b8c8a6aaabadec1be9e0eb9703507da5136'; // Never transmit the secret key by itself.

function sign(input) {
    let crypto = require('crypto');
    let hash = crypto.createHash('sha256');
    hash.update(input);
    let signature = Buffer.from(hash.digest('hex')).toString('base64');
    return signature; }

// Register
router.get('/register', function(req, res) {
  res.render('register');
});

// login
router.get('/login', function(req, res) {
    res.render('login');
});

// Register User
router.post('/register', function(req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var phone = phoney(req.body.phone)[0];
    //Validation
// Validation
    req.checkBody('fname', 'First Name is required').notEmpty();
    req.checkBody('lname', 'Last Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('phone', 'Phone is required').notEmpty();

    var errors = req.validationErrors();

    // Configure the request
    let body = {
        first_name: fname,
        last_name: lname,
        phone_number: phone,
        email: email
    };

    let toSign = salt + timestamp + access_key + secret_key + JSON.stringify(body);
    let signature = sign(toSign);
    console.log('   signature:   ' + signature);

    // Set the headers
    var headers = {
        'Content-Type':     'application/json',
        'access_key':       'FEF80B413EBC9F9C1B6D',
        'salt':             '95188462337',
        'signature':        signature,
        'timestamp':        timestamp
    };
    var options = {
        url: 'https://sandboxapi.rapyd.net/v1/user',
        method: 'POST',
        headers: headers,
        json: {
            first_name: fname,
            last_name: lname,
            phone_number: phone,
            email: email
        }
    };

    if (errors){
        res.render('register',{
            errors:errors
        });
    } else{

        request(options, function(error, response, body) {
                if (body.status.status !== 'SUCCESS') {
                    // throw new Error(error);
                    console.log(body);
                    req.flash('error_msg', (body.status.error_code).toLowerCase());
                    res.redirect('/users/register');
                }else{
                    console.log(body);
                    req.flash('success_msg', 'You are registered and can now login using your id(please keep it safe): '
                        + body.data.id);
                    res.redirect('/users/login');
                }
            }
        );
    }
});

// login user
router.post('/login', function(req, res) {
    var phone = phoney(req.body.phone)[0];
    var id = req.body.id;
    //Validation
// Validation
    req.checkBody('phone', 'Phone is required').notEmpty();
    req.checkBody('id', 'ID is required').notEmpty();

    var errors = req.validationErrors();


    // Configure the request

    let toSign = salt + timestamp + access_key + secret_key;
    let signature = sign(toSign);
    console.log('   signature:   ' + signature);

    // Set the headers
    var headers = {
        'Content-Type': 'application/json',
        'access_key': 'FEF80B413EBC9F9C1B6D',
        'salt': '95188462337',
        'signature': signature,
        'timestamp': timestamp
    };
    var options = {
        url: 'https://sandboxapi.rapyd.net/v1/user/' + phone,
        method: 'GET',
        headers: headers
    };

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {

        request(options, function (error, response, body) {
            var obj = JSON.parse(body);
            if (obj.data.id === id){
                if (obj.status.status !== 'SUCCESS') {
                    // throw new Error(error);
                    req.flash('error_msg', (obj.status.error_code).toLowerCase());
                    res.redirect('/users/register');
                } else {
                    console.log(body);
                    req.flash('success_msg', 'Welcome Back '+ obj.data.first_name + '!');
                    res.render('index', {
                        fname: obj.data.first_name,
                        lname: obj.data.last_name,
                        email: obj.data.email,
                        phone: obj.data.phone_number
                    });
                }
            } else{
                req.flash('error_msg', 'wrong phone number or id, please try again');
                res.redirect('/users/login');
            }

            }
        );
    }
});

module.exports = router;

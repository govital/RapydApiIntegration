var express = require('express');
var router = express.Router();
var request = require("request");

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// Deposite
router.post('/deposite', function(req, res) {
    var sum = req.body.sum;
    var currency = req.body.currency;
    var phone = req.body.phone;
// Validation
    req.checkBody('sum', 'sum is required').notEmpty();
    req.checkBody('currency', 'currency is required').notEmpty();

    var errors = req.validationErrors();

    // Configure the request
    let body = {
        amount: sum,
        currency: currency,
        phone_number: phone
    };

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
        url: 'https://sandboxapi.rapyd.net/v1/account/deposite',
        method: 'POST',
        headers: headers,
        json: {
            amount: sum,
            currency: currency,
            phone_number: phone
        }
    };

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {

        request(options, function (error, response, body) {
                // var obj = JSON.parse(body)
                if (body.status.status !== 'SUCCESS') {
                    // throw new Error(error);
                    req.flash('error_msg', (body.status.error_code).toLowerCase());
                    res.redirect('/');
                } else {
                    console.log(body);
                    req.flash('success_msg', 'Welcome Back '+ body.data.first_name + '!');
                    res.redirect('/');
                }
            }
        );
    }
});




module.exports = router;

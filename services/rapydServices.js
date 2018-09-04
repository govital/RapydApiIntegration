var request = require("request");



function sign(input) {
    let crypto = require('crypto');
    let hash = crypto.createHash('sha256');
    hash.update(input);
    let signature = Buffer.from(hash.digest('hex')).toString('base64');
    return signature; }

let salt = '95188462337';         // Random numeric string.
let timestamp = Math.floor(new Date().getTime() / 1000)-15;
let access_key = 'FEF80B413EBC9F9C1B6D'; // Unique string for each user, assigned by Rapyd.
let secret_key = 'a6084a1fe12d425053bc714fba40ff8107f3c4183a912b8c8a6aaabadec1be9e0eb9703507da5136'; // Never transmit the secret key by itself.

let body = {
    first_name: "Tal",
    last_name: "Gokhberg",
    phone_number: "+12625357876",
    email: "govital9@gmail.com"
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
// Configure the request
var options = {
    url: 'https://sandboxapi.rapyd.net/v1/user',
    method: 'POST',
    headers: headers,
    json: {
        first_name: "Tal",
        last_name: "Gokhberg",
        phone_number: "+12625357876",
        email: "govital9@gmail.com"
    }
};

request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    }
);
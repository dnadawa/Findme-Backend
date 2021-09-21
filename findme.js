const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const fs = require("fs");
const https = require("https");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID);

const corsConfig = {
    origin: "*",
    methods: ["POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
    preflightContinue: true
}

app.post('/sendEmail', cors(corsConfig), (req, res) => {
    const to = req.body.to;
    const subject = req.body.subject;
    const message = req.body.msg;

    const msg = {
        to: to, // Change to your recipient
        from: {
            name: 'Findme',
            email: 'noreply@find-me.dk',
        },
        subject: subject,
        text: message,
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent to '+to);
            res.send({status: 'successful'});
        })
        .catch((error) => {
            console.error(error+' -> '+to);
            res.send({status: 'failed', error: error});
        });
});

app.get('/', (req, res) => {
    res.send("Hello World!");
});

// app.listen(3000, ()=>console.log('Server Started'));

const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.prkcar.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.prkcar.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/api.prkcar.com/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

https.createServer(credentials, app)
    .listen(7000, function () {
        console.log('Server started on port 5000')
    })
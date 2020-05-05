require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// View engine setup
app.engine('handlebars', exphbs({
    defaultLayout:false,
}));
app.set('view engine', 'handlebars');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('contact', {layout:false});
});

app.post('/send', (req, res) => {
    //console.log(req.body);

    const output = `
        <p>You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${req.body.name}</li>
            <li>Name: ${req.body.email}</li>
        </ul>
        <h3>Message</h3>
        <p>${req.body.message}</p>
    `;
    async function main() {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL, // Your email user grabbed from your own .env file
            pass: process.env.PASSWORD // Your gmail password grabbed from your own .env file
        },
        tsl:{
            rejectUnauthorized:false
        }
        });
    
        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: process.env.EMAIL , // sender address, can also work with strings (eg. '"Test Email" <myEmail@host.com>')
        to: process.env.TEST_EMAIL, // list of receivers, can also work with strings (eg. 'myEmail@host.com')
        subject: "Hello, Just Testing ✔", // Subject line
        text: "Hello world?", // plain text body
        html: output // html body
        });
    
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.render('contact', {msg:'Email has been sent'});
    }

    main().catch(console.error);
});
app.listen(3000, () => console.log('Server Started...'));
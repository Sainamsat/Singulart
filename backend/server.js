const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const { authenticateJWT } = require('./auth');

//Create connection

const db = mysql.createConnection({
    host: 'localhost',
    user: 'Sainama',
    password: 'Password123@',
    database: 'singulart'
});

//Connect

db.connect((err) => {
    if (err) {
        throw err;
    } 
    console.log('Mysql connected.');
})

const app = express();



app.use(cors());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser('82e4e438a0705fabf61f9854e3b575af'));

var token_secret = '82e4e438a0705fabf61f9854e3b575af'



app.get('/',(req, res) => {
    let sql = 'SELECT * FROM User;';
    db.query(sql, (err, result) =>{
        if (err) throw err;
        res.send(result);
    })
});

app.get('/artworks',(req,res) => {
    let sql = 'SELECT * FROM Gallery NATURAL JOIN (SELECT * FROM Artwork INNER JOIN User ON Artwork.artist_id = User.user_id) AS T;';
    db.query(sql, (err,result) => {
        if (err) throw err;
        console.log(result)
        res.send(result);
    })
})


app.get('/getArtists', (req,res) => {
    let sql = 'SELECT * FROM Artist NATURAL JOIN User';
    db.query(sql, (err,result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.get('/getArtists/:id', (req,res) => {
    let sql = `SELECT * FROM Artist NATURAL JOIN User where id = ${req.params.id}`;
    db.query(sql, (err,result) => {
        if (err) throw err;
        res.send(result);
    })
})

app.post('/signin', (req,res,next) => {
    email = req.body.email;
    password = req.body.password

    if (email && password) {
        let sql = `SELECT * FROM User WHERE email = ? AND password = ?;`;
        let query = db.query(sql,[email, password], (err,result) => {
            if (err) throw err;
            if (result.length>0) {
                req.session.loggedIn = true;
                req.session.email = email;
                // console.log('in sign in *** ' + req.session.email);
                // let payload = {
                //     email: req.session.email,
                // }
                // let token = jwt.sign(payload, token_secret, {
                //     expiresIn: 25
                // });
                // res.cookie('token', token, {
                //     expires: new Date(Date.now() + 20000),
                //     httpOnly: true,
                // }) 
                return res.redirect('/auth');
            } else {
                var Err = new Error("Incorrect Email and/or Password !")
                Err.status = 401;
                return next(Err)
            }
        });
    } else {
        res.send('Please fill both the fields')
    }
    
    
})

app.get('/auth', (req, res) => {

    

    let payload = {
        email: req.session.email,
        hiahoa: 'ljlanjan',
    }
    let token = jwt.sign(payload, token_secret, {
        expiresIn: 25
    });
    res.cookie('token', token, {
        expires: new Date(Date.now() + 1200000),
        httpOnly: true,
    }) 
    res.json({
        token
    });
   
})

app.get('/main', (req,res) => {
    // console.log('In main *** ', req.get('set-cookie'));
    res.send({loggedIn:1});    
})

app.listen('8000', () => {
    console.log('Server started on port 8000...')
})



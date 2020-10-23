const express = require ('express');
const app = express();
const { pool } = require("./dbconfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');

const PORT = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
}));


app.use(flash());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/users/register', (req, res) => {
    res.render('register');
});

app.get('/users/login', (req, res) => {
    res.render('login');
});

app.get('/users/dashboard', (req, res) => {
    res.render('dashboard', { user: 'Andrey'});
});

app.get('/users/register_end', (req, res) =>{
    res.render('register_end');
});

app.post("/user/register", async (req, res) => {
    let { name, lastName, email, password, password2, subject, phone } = req.body;

    let errors = [];

    if (!name || !lastName || !email || !password || !password2 || !subject || !phone ){
        errors.push({message: "Пожалуйста, заполните все поля"});
    }

    if (password.length < 6){
        errors.push({message: "Пароль должен состоять хотя бы из 6 символов"});
    }

    if (password != password2){
        errors.push({message: "Пароли не совпадают"});
    }
    
    if (errors.length > 0){
        res.render('register', {errors});
        console.log({errors});
    }else{

        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        let mistake = false; 
        pool.query(
            `SELECT * FROM teacher
            WHERE phone = $1`, [phone], (err, results) => {
                if(err){
                    throw err;
                }
                if(results.rows.length > 0){
                    mistake = true;
                    errors.push({message: 'Такой номер телефона уже используется'});
                }
            }
        )

        pool.query (
            `SELECT * FROM teacher
            WHERE email = $1`, [email], (err, results) => {
                if (err){
                    throw err
                }

                console.log(results.rows);

                if (results.rows.length > 0){
                    errors.push({message: 'Аккаунт с такой почтой уже существует'});
                    res.render('register', {errors});
                    console.log({errors});
                }
                else if (mistake === true){
                    res.render('register', {errors});
                    console.log({errors});
                }
                else{
                    pool.query(
                        `INSERT INTO teacher (first_name, last_name, email, subject, password, phone)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id, password`, [name, lastName, email, subject, hashedPassword, phone], (err, results) => {
                          if(err){
                              throw err
                          }
                          console.log(results.rows);
                          req.flash('success_msg', "Вы зарегистрированы! Пожалуйста, войдите в систему.");
                          res.redirect('/users/register_end');
                        }
                    );
                }
            }
        )
    }
});

app.post("/user/register_end", async (req, res) => {
    let {gender , yearOfBirth, additionalInfo, achievements, pricePerLesson, lengthOfLesson } = req.body;

    pool.query(
        `INSERT INTO teacher_info (gender, achievements , additional_info, price_per_lesson, length_of_lesson, year_of_birth)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`, [gender, achievements, additionalInfo, pricePerLesson, lengthOfLesson, yearOfBirth], (err, results) => {
          if(err){
              throw err
          }
          console.log(results.rows);
          req.flash('success_msg', "Вы зарегистрированы! Пожалуйста, войдите в систему.");
          res.redirect('/users/login');
        }
    );
});


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});











// const http = require('http');
// const path = require('path');
// const fs = require ('fs');
// const {Client} = require('pg');
// const client = new Client({
//     user: "postgres",
//     password: "5570358735Adg",
//     host: "localhost",
//     database: "mainbase"
// })


// server.listen(PORT , () => console.log('Server running on port ' + PORT));















// const server = http.createServer((req, res) => {
//     let filePath = path.join(__dirname,
//          '',
//           req.url === '/' ? 'index.html' : req.url
//         );

//     let extname = path.extname(filePath);

//     let contentType = 'text/html';

//     switch(extname){
//         case '.js':
//             contentType = 'text/javascript';
//             break;
//         case '.css':
//             contentType = 'text/css';
//             break;
//         case '.json':
//             contentType = 'application/json';
//             break;
//         case '.png':
//             contentType = 'image/png';
//             break;
//         case '.jpg':
//             contentType = 'image/jpg';
//             break;
//     }

    
    
//     fs.readFile(filePath, (err, content) => {
//         if (err){
//             if (err.code == 'ENOENT'){
//                 fs.readFile(path.join(__dirname, '', '404.html'), (err, content) => {
//                    res.writeHead(200, { 'Content-Type': 'text/html' });
//                    res.end(content, 'utf8');
//                 });
//             }
//             else {
//                 res.writeHead(500);
//                 res.end('Server error: ' + err.code);
//             }
//         }
//         else{
//             res.writeHead(200, {'Content-Type': contentType});
//             res.end(content, 'utf8');
//             console.log(filePath, contentType);
//         }
//     });
// });

// const {Client} = require('pg');

// const client = new Client({
//     user: "postgres",
//     password: "5570358735Adg",
//     host: "localhost",
//     database: "mainbase"
// })


// async function register(){
//     var name = document.getElementById("name").value;
//     alert(name);
//     try{
//     await client.connect();
    
//     alert("add");
//     await client.query("insert into test value ("+name+")");
//     }
//     catch(ex){
//         console.log("Error: " + ex);
//         alert("error");
//     }
//     finally{
//         await client.end();
//         console.log("Client disconnected.");
//         alert("finally");
//     }
// }





// async function register(){
//     try{
//     await client.connect();
//     console.log("Connected succ");
//     const results = await client.query("select * from test");
//     console.table(results.rows);
//     }
//     catch (ex){
//         console.log("MISTAKE IS:" + ex);
//     }
//     finally{
//         await client.end();
//         console.log ("Disconnected");
//     }
// }

// module.exports.register = register;
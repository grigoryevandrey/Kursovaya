const express = require('express');
const app = express();
const {
    pool
} = require("./dbconfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");


const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false
}));
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get('/', (req, res) => {
    res.render('index', {
        okOk: req.isAuthenticated()
    });
    console.log(req.isAuthenticated());
});

app.get('/profile', checkNotAuthenticated, (req, res) => {
    // store userId on login into session or any global variable 
    var userId = req.user.id;
    res.redirect('/profile/' + userId)
}); // =>directs to http://localhost:8080/profile for every signup.



app.get('/profile/:id', function (req, res) {
    let id = req.params.id,
        name = '',
        lastName = '',
        subject = '',
        gender = '',
        achievements = '',
        additionalInfo = '',
        pricePerLesson = '',
        lengthOfLesson = '',
        yearOfBirth = '';
    pool.query(
        `SELECT * 
        FROM teacher
        LEFT JOIN teacher_info ON teacher_info.id=teacher.id
        WHERE teacher.id = $1`, [id], (err, results) => {
            if (err) {
                throw (err);
            }
            if (results.rows[0].gender !== null) {
                name = results.rows[0].first_name;
                lastName = results.rows[0].last_name;
                subject = results.rows[0].subject;
                gender = results.rows[0].gender;
                achievements = results.rows[0].achievements;
                additionalInfo = results.rows[0].additional_info;
                pricePerLesson = results.rows[0].price_per_lesson;
                lengthOfLesson = results.rows[0].length_of_lesson;
                yearOfBirth = results.rows[0].year_of_birth;
                res.render('userPage', {
                    name: name,
                    lastName: lastName,
                    subject: subject,
                    gender: gender,
                    achievements: achievements,
                    additionalInfo: additionalInfo,
                    pricePerLesson: pricePerLesson,
                    lengthOfLesson: lengthOfLesson,
                    yearOfBirth: yearOfBirth
                });
            } else {
                res.redirect('/');
            }

        }
    );


});

app.get('/users/register', checkAuthenticated, (req, res) => {
    res.render('register');
});

app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render('login');
});

app.get('/users/userpage', (req, res) => {
    res.render('userPage');
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.user.first_name
    });
});

app.get('/users/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', "Вы вышли из системы");
    res.redirect('/users/login');
});

app.get('/users/register_end', (req, res) => {
    res.render('register_end');
});

app.get('/search', (req, res) => {
    let resultat = [];
    pool.query(
        `SELECT * 
        FROM teacher
        LEFT JOIN teacher_info 
        ON teacher_info.id=teacher.id`, (err, results) => {
            if (err) {
                throw (err);
            }
            for (let i = 0; i < results.rows.length;i++){
                resultat[i] = {};
                for (let key in results.rows[i]){
                    resultat[i][key] = results.rows[i][key];
                    
                }
            }
            // console.log(typeof(resultat[0].first_name));
            res.render('search', {
                resultatF: function() {
                    return 'Base64.decode("' + Buffer.from(JSON.stringify(resultat)).toString('base64') + '")';
                },
                length: resultat.length
            });
        }
    );
});


app.post("/user/register", async (req, res) => {
    let option = req.body.subject;
    let {
        name,
        lastName,
        email,
        password,
        password2,
        subject,
        phone,
    } = req.body;

    switch (option){
        case "1": 
        subject = "Мастерство выпивания пива";
        break;
        case "2": 
        subject = "Техника прогуливания пар";
        break;
        case "3": 
        subject = "Искусство ругательств";
        break;
        case "4": 
        subject = "Навык курения";
        break;
        case "5": 
        subject = "Рыгание";
        break;
        default:
            subject = "'Err'";
    }

    let errors = [];

    if (!name || !lastName || !email || !password || !password2 || !subject || !phone) {
        errors.push({
            message: "Пожалуйста, заполните все поля"
        });
    }

    if (password.length < 6) {
        errors.push({
            message: "Пароль должен состоять хотя бы из 6 символов"
        });
    }

    if (password != password2) {
        errors.push({
            message: "Пароли не совпадают"
        });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors
        });
        console.log({
            errors
        });
    } else {

        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        let mistake = false;
        pool.query(
            `SELECT * FROM teacher
            WHERE phone = $1`, [phone], (err, results) => {
                if (err) {
                    throw err;
                }
                if (results.rows.length > 0) {
                    mistake = true;
                    errors.push({
                        message: 'Такой номер телефона уже используется'
                    });
                }
            }
        )

        pool.query(
            `SELECT * FROM teacher
            WHERE email = $1`, [email], (err, results) => {
                if (err) {
                    throw err
                }

                console.log(results.rows);

                if (results.rows.length > 0) {
                    errors.push({
                        message: 'Аккаунт с такой почтой уже существует'
                    });
                    res.render('register', {
                        errors
                    });
                    console.log({
                        errors
                    });
                } else if (mistake === true) {
                    res.render('register', {
                        errors
                    });
                    console.log({
                        errors
                    });
                } else {
                    pool.query(
                        `INSERT INTO teacher (first_name, last_name, email, subject, password, phone)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id, password`, [name, lastName, email, subject, hashedPassword, phone], (err, results) => {
                            if (err) {
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

app.post("/search/go", async (req, res) =>{
    let option = req.body.searchSelector;
    let resultat = [];
    let subject = "";
    console.log(typeof(option));
    switch (option){
        case "2": 
        subject = "Мастерство выпивания пива";
        break;
        case "3": 
        subject = "Техника прогуливания пар";
        break;
        case "4": 
        subject = "Искусство ругательств";
        break;
        case "5": 
        subject = "Навык курения";
        break;
        case "6": 
        subject = "Рыгание";
        break;
        default:
            subject = "'Err'";
    }

    if (option === "1" || subject === "'Err'"){
       res.redirect('/search');
    }
    else{
        
    pool.query(
        `SELECT * 
        FROM teacher
        LEFT JOIN teacher_info 
        ON teacher_info.id=teacher.id
        WHERE subject = $1`,[subject], (err, results) => {
            if (err) {
                throw (err);
            }
            for (let i = 0; i < results.rows.length;i++){
                resultat[i] = {};
                for (let key in results.rows[i]){
                    resultat[i][key] = results.rows[i][key];
                    
                }
            }
            // console.log(typeof(resultat[0].first_name));
            res.render('search', {
                resultatF: function() {
                    return 'Base64.decode("' + Buffer.from(JSON.stringify(resultat)).toString('base64') + '")';
                },
                length: resultat.length
            });
        }
    );

}
});

app.post("/user/register_end", async (req, res) => {
    let option = req.body.gender;
    let {
        gender,
        yearOfBirth,
        additionalInfo,
        achievements,
        pricePerLesson,
        lengthOfLesson
    } = req.body;

    switch (option){
        case "1": 
        gender = "Мужской";
        break;
        case "2": 
        gender = "Женский";
        break;
        default:
        gender = "'Err'";
    }
// сделать проверку авторизован ли пользователь, и заносить по айдишнику юзера который это вносит 
    pool.query(
        `INSERT INTO teacher_info (gender, achievements , additional_info, price_per_lesson, length_of_lesson, year_of_birth)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`, [gender, achievements, additionalInfo, pricePerLesson, lengthOfLesson, yearOfBirth], (err, results) => {
            if (err) {
                throw err
            }
            console.log(results.rows);
            req.flash('success_msg', "Вы зарегистрированы! Пожалуйста, войдите в систему.");
            res.redirect('/users/login');
        }
    );
});

app.post('/user/login', passport.authenticate('local', {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}));

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile/:id');
    }
    next();
}


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
}

app.listen(PORT, () => {
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
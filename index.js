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
const e = require('express');

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
    let teachers = [],
    reviews = [];




    pool.query(`SELECT * 
    FROM teacher_rating
    WHERE average >= 4`, (err, results) => {
        if (err) {
            throw err;
        }
        

        let len = results.rows.length;
        let randNums = [0,0,0];

        if (len === 1) {
          randNums = [0,0,0];
        }
        else if (len === 2) {
            randNums = [0,1,0];
            
        } else {
            randNums.forEach((item, i, arr) => {
                arr[i] = getRandomInt(len);
        });
            while (randNums[1] == randNums[0]) {
                randNums[1] = getRandomInt(len);
            }
            while (randNums[2] == randNums[0] || randNums[2] == randNums[1]) {
                randNums[2] = getRandomInt(len);
            }
          
        }

        

        randNums.forEach((item, i, arr) => {
                arr[i] = results.rows[item].teacher_id;
        });
        

        pool.query (`SELECT *
        FROM teacher
        LEFT JOIN teacher_info ON teacher_info.id=teacher.id
        LEFT JOIN teacher_rating ON teacher_rating.teacher_id=teacher.id
        WHERE teacher.id = $1 OR teacher.id = $2 OR teacher.id = $3`, [randNums[0], randNums[1], randNums[2]], (err, results) => {
            if (err) {
                throw err;
            }

            if(results.rows.length == 1) {
                for (let i = 0; i < 3; i++) {
                    teachers[i] = results.rows[0];
                }
            }
            else if (results.rows.length == 2){
                    teachers[0] = results.rows[0];
                    teachers[1] = results.rows[1];
                    teachers[2] = results.rows[0];
            }
            else {
                results.rows.forEach((item, i, arr) => {
                    teachers[i] = item; 
               });
            }

           
            // console.log(teachers);
            
           
            
            pool.query (`SELECT *
            FROM reviews
            WHERE rating > 3`, (err, results) => {
                let lenRev = results.rows.length;
                let randRev = [0,0,0];


                if (lenRev  === 1) {
                    randRev = [0,0,0];
                    
                  }
                  else if (lenRev  === 2) {
                    randRev = [0,1,0];
                      
                  } else {
                      
                    randRev.forEach((item, i, arr) => {
                          arr[i] = getRandomInt(lenRev);
                  });
                      while (randRev[1] == randRev[0]) {
                        randRev[1] = getRandomInt(lenRev);
                      }
                      while (randRev[2] == randRev[0] || randRev[2] == randRev[1]) {
                        randRev[2] = getRandomInt(lenRev);
                      }
                    
                  }
          
                //   console.log(randRev);

                  randRev.forEach((item, i, arr) => {
                          arr[i] = results.rows[item].id;
                  });

                  pool.query (`SELECT *
                  FROM reviews
                  LEFT JOIN teacher ON teacher.id=reviews.teacher_id
                WHERE reviews.id = $1 OR reviews.id = $2 OR reviews.id = $3`, [randRev[0], randRev[1], randRev[2]], (err, results) => {
                    if (err) {
                        throw err;
                    }

                    if(results.rows.length == 1) {
                        for (let i = 0; i < 3; i++) {
                            reviews[i] = results.rows[0];
                        }
                    }
                    else if (results.rows.length == 2){
                        reviews[0] = results.rows[0];
                            reviews[1] = results.rows[1];
                            reviews[2] = results.rows[0];
                    }
                    else {
                        results.rows.forEach((item, i, arr) => {
                            reviews[i] = item; 
                     }); 
                    }
                    
                //    console.log(reviews);

                   res.render('index', {
                    okOk: req.isAuthenticated(),
                    teachersFunction: function() {
                        return 'Base64.decode("' + Buffer.from(JSON.stringify(teachers)).toString('base64') + '")';
                    },
                    reviewsFunction: function() {
                        return 'Base64.decode("' + Buffer.from(JSON.stringify(reviews)).toString('base64') + '")';
                    }

                });
                });

                function getRandomInt(max) {
                    return Math.floor(Math.random() * Math.floor(max));
                  }
            });
        });
        
        
        // console.log(getRandomInt(len));

        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
          }
          
    });

    
});

app.get('/profile', checkNotAuthenticated, (req, res) => {
    
    var userId = req.user.id;
    res.redirect('/profile/' + userId)
});



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
        yearOfBirth = '',
        rating = '';

    let reviewResults = [];
    pool.query(
        `SELECT * 
        FROM teacher
        LEFT JOIN teacher_info ON teacher_info.id=teacher.id
        LEFT JOIN teacher_rating ON teacher_rating.teacher_id=teacher.id
        WHERE teacher.id = $1`, [id], (err, results) => {
            if (err) {
                throw (err);
            }
            if (results.rows.length > 0) {
                name = results.rows[0].first_name;
                lastName = results.rows[0].last_name;
                subject = results.rows[0].subject;
                gender = results.rows[0].gender;
                achievements = results.rows[0].achievements;
                additionalInfo = results.rows[0].additional_info;
                pricePerLesson = results.rows[0].price_per_lesson;
                lengthOfLesson = results.rows[0].length_of_lesson;
                yearOfBirth = results.rows[0].year_of_birth;
                rating = results.rows[0].average;

                pool.query(`SELECT * 
                FROM reviews
                WHERE teacher_id = $1`, [id], (err,results) => {
                if(err){
                    throw(err);
                }
                
                let checker = false;

                for (let i = 0; i < results.rows.length; i++) {
                    reviewResults[i] = {};
                    for (let key in results.rows[i]) {
                        reviewResults[i][key] = results.rows[i][key];
                    }
                    checker = true;
                }
                if (!checker) {
                reviewResults = [{
                    message: "Нет отзывов"
                }];
            }

                res.render('userPage', {
                    okOk: req.isAuthenticated(),
                    id: id,
                    name: name,
                    lastName: lastName,
                    subject: subject,
                    gender: gender,
                    achievements: achievements,
                    additionalInfo: additionalInfo,
                    pricePerLesson: pricePerLesson,
                    lengthOfLesson: lengthOfLesson,
                    yearOfBirth: yearOfBirth,
                    rating: rating,
                    resultsReviewFunction: function() {
                        return 'Base64.decode("' + Buffer.from(JSON.stringify(reviewResults)).toString('base64') + '")';
                    },
                    reviewLength: reviewResults.length,
                    errors: []
                });
                });

                
            } else {
                res.redirect('/');
            }

        }
    );


});

// app.get('/users/register', checkAuthenticated, (req, res) => {
//     res.render('register', {
//         okOk: req.isAuthenticated(),
//         errors: []
//     });
// });

app.get('/users/register', (req, res) => {
    res.render('register', {
        okOk: false,
        errors: []
    });
});

app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render('login', {
        okOk: req.isAuthenticated()
    });
});

// app.get('/users/userpage', (req, res) => {
//     res.render('userPage', {
//         okOk: req.isAuthenticated(),
//     });
// });

app.get('/users/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', "Вы вышли из системы. ");
    res.redirect('/users/login');
});

app.get('/users/register_end',checkNotAuthenticated, (req, res) => {
    const id = req.user.id;
    let gender = '',
    achievements = '',
    additionalInfo ='',
    pricePerLesson = '',
    lengthOfLesson = '',
    yearOfBirth = '',
    showMe = false;
    pool.query(
        `SELECT *
        FROM teacher_info
        WHERE id = $1`, [id], (err, results) => {
            if (err) {
                throw (err);
            }
            if(results.rows.length > 0){    
                gender = results.rows[0].gender;
                achievements = decodeURIComponent(results.rows[0].achievements);
                additionalInfo = decodeURIComponent(results.rows[0].additional_info);
                pricePerLesson = results.rows[0].price_per_lesson;
                lengthOfLesson = results.rows[0].length_of_lesson;
                yearOfBirth = results.rows[0].year_of_birth;   
                showMe = results.rows[0].show_me;
               res.render('register_end', {
                okOk: req.isAuthenticated(),
                gender: gender,
                achievements: achievements,
                additionalInfo: additionalInfo,
                pricePerLesson: pricePerLesson,
                lengthOfLesson: lengthOfLesson,
                yearOfBirth: yearOfBirth,
                showMe: showMe,
                errors: []
            });
            }
            else{
                res.render('register_end', {
                    okOk: req.isAuthenticated(),
                    gender: gender,
                    achievements: achievements,
                    additionalInfo: additionalInfo,
                    pricePerLesson: pricePerLesson,
                    lengthOfLesson: lengthOfLesson,
                    yearOfBirth: yearOfBirth,
                    showMe: showMe,
                    errors: []
                });
            }
        });
});

app.get('/search', (req, res) => {
    let resultat = [];
    let reviewResults = [[]];
    let teachId = [];
    let option = 1;
    pool.query(
        `SELECT * 
        FROM teacher
        LEFT JOIN teacher_info ON teacher_info.id=teacher.id
        LEFT JOIN teacher_rating ON teacher_rating.teacher_id=teacher.id
        WHERE show_me = $1`, [true], (err, results) => {
            if (err) {
                throw (err);
            }
            for (let i = 0; i < results.rows.length;i++){
                resultat[i] = {};
                for (let key in results.rows[i]){
                    resultat[i][key] = results.rows[i][key];
                }
                teachId[i] = results.rows[i].id;
            }
            // console.log(typeof(resultat[0].first_name));
            pool.query(`SELECT * 
            FROM reviews`,async (err,resultss) => {
            if(err){
                throw(err);
            }
            
        for (let i = 0; i < teachId.length; i++) {
            let checker = false;
            for (let j = 0; j < resultss.rows.length; j++) {
                if (teachId[i] === resultss.rows[j].teacher_id) {
                if (reviewResults[i] === undefined) {
                    reviewResults[i] = [];
                    reviewResults[i][0] = resultss.rows[j];
                }
                else {
                reviewResults[i].push(resultss.rows[j]);  
                 }   
                 
            checker = true;
                }
                
            }
            
            if (!checker) {
                reviewResults[i] = [{
                    message: "Нет отзывов"
                }];
            }
        }

        res.render('search', {
            okOk: req.isAuthenticated(),
            resultatF: function() {
                return 'Base64.decode("' + Buffer.from(JSON.stringify(resultat)).toString('base64') + '")';
            },
            resultsReviewFunction: function() {
                return 'Base64.decode("' + Buffer.from(JSON.stringify(reviewResults)).toString('base64') + '")';
            },
            reviewLength: reviewResults.length,
            length: resultat.length,
            option: option
        });
        });
        }
    );
});

app.post("/buy", async (req, res) => {
   
   let {
       teacherPrice,
       teacherId,
       fullName,
       phoneOfCustomer,
       numberOfLessons,
       emailOfCustomer
   } = req.body;

    let price = numberOfLessons * teacherPrice;

    console.log({
        teacherPrice,
        teacherId,
        fullName,
        phoneOfCustomer,
        numberOfLessons,
        emailOfCustomer
    });

res.render('payment', {
    price,
    teacherId,
    fullName,
    phoneOfCustomer,
    numberOfLessons,
    emailOfCustomer
            });


});

app.post("/purchase", async (req, res) => {
    let {
        price,
        teacherId,
        fullName,
        phoneOfCustomer,
        numberOfLessons,
        emailOfCustomer
    } = req.body;

    console.log ({
        price,
        teacherId,
        fullName,
        phoneOfCustomer,
        numberOfLessons,
        emailOfCustomer
    } );
    pool.query(
    `INSERT INTO deals (teacher_id, price, number_of_lessons_bought, full_name, email_of_customer, phone_of_customer, reviewed, date_of_deal)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [teacherId, price, numberOfLessons, fullName, emailOfCustomer, phoneOfCustomer, false, dateOfAction()], (err, results) => {
        if (err) {
            throw err
        }

        res.render('successfullBuy', {
            price: price,
            numberOfLessons: numberOfLessons            
        });
        req.flash('success_msg', "Заказ зарегистрирован.");
    }
    
);
});

app.post("/review", async(req,res) => {
    
    let {
        teacherId,
        phoneOfCustomer,
        review
    } = req.body;
    let errors = [];
    let orderId = 0,
    fullName = '',
    emailOfCustomer = '',
    ratingRate = 1;
    let option = req.body.ratingRate;


    review = JSON.stringify(review);
    review = review.escapeSpecialChars();


    switch (option){
        case "2": 
        ratingRate = 2;
        break;
        case "3": 
        ratingRate = 3;
        break;
        case "4": 
        ratingRate = 4;
        break;
        case "5": 
        ratingRate = 5;
        break;
        default:
            ratingRate = 1;
    }

    if(!phoneOfCustomer || !review) {
        errors.push({
            message:"Заполните все поля. "
        });
    }

    pool.query(`SELECT * 
    FROM deals
    WHERE teacher_id = $1 AND phone_of_customer = $2 AND reviewed = $3`,[teacherId, phoneOfCustomer, false], (err, results) => {
        if (err) {
            throw err;
        }
        
        if(results.rows.length == 0) {
            errors.push({
            message: "Телефон указан неверно, либо вы уже оставляли отзыв. "
            });
        }
        else {
            orderId = results.rows[0].id;
            fullName = results.rows[0].full_name;
            emailOfCustomer = results.rows[0].email_of_customer;
        }

        if (errors.length > 0) {
        let id = teacherId,
        name = '',
        lastName = '',
        subject = '',
        gender = '',
        achievements = '',
        additionalInfo = '',
        pricePerLesson = '',
        lengthOfLesson = '',
        yearOfBirth = '',
        rating = '';

    let reviewResults = [];
    pool.query(
        `SELECT * 
        FROM teacher
        LEFT JOIN teacher_info ON teacher_info.id=teacher.id
        WHERE teacher.id = $1`, [id], (err, results) => {
            if (err) {
                throw (err);
            }
            if (results.rows.length > 0) {
                name = results.rows[0].first_name;
                lastName = results.rows[0].last_name;
                subject = results.rows[0].subject;
                gender = results.rows[0].gender;
                rating = results.rows[0].rating;
                achievements = results.rows[0].achievements;
                additionalInfo = results.rows[0].additional_info;
                pricePerLesson = results.rows[0].price_per_lesson;
                lengthOfLesson = results.rows[0].length_of_lesson;
                yearOfBirth = results.rows[0].year_of_birth;

                pool.query(`SELECT * 
                FROM reviews
                WHERE teacher_id = $1`, [id], (err,results) => {
                if(err){
                    throw(err);
                }
                
                let checker = false;

                for (let i = 0; i < results.rows.length; i++) {
                    reviewResults[i] = {};
                    for (let key in results.rows[i]) {
                        reviewResults[i][key] = results.rows[i][key];
                    }
                    checker = true;
                }
                if (!checker) {
                reviewResults = [{
                    message: "Нет отзывов"
                }];
            }
                res.render('userPage', {
                    okOk: req.isAuthenticated(),
                    id: id,
                    name: name,
                    lastName: lastName,
                    rating: rating,
                    subject: subject,
                    gender: gender,
                    achievements: achievements,
                    additionalInfo: additionalInfo,
                    pricePerLesson: pricePerLesson,
                    lengthOfLesson: lengthOfLesson,
                    yearOfBirth: yearOfBirth,
                    errors: errors,
                    resultsReviewFunction: function() {
                        return 'Base64.decode("' + Buffer.from(JSON.stringify(reviewResults)).toString('base64') + '")';
                    },
                    reviewLength: reviewResults.length
                });
                });

                
            } else {
                res.redirect('/');
            }

        }
    );
            console.log({
                errors
            });
        } else {
            pool.query(`INSERT INTO reviews (teacher_id, full_name, email_of_customer, review, rating, date_of_review)
            VALUES ($1, $2, $3, $4, $5, $6)`, [teacherId, fullName, emailOfCustomer, review, ratingRate, dateOfAction()], (err, results) => {
                if(err){
                    throw err;
                }

                switch (ratingRate) {
                    case 1:      
                    pool.query(`UPDATE teacher_rating
                    SET one = one + 1,
                    number_of_ratings = number_of_ratings + 1
                    WHERE teacher_id = $1`, [teacherId], (err) => {
                        if (err){
                            throw err;
                        }
                    });
                    break;
                    case 2:
                    pool.query(`UPDATE teacher_rating
                    SET two = two + 1,
                    number_of_ratings = number_of_ratings + 1
                    WHERE teacher_id = $1`, [teacherId], (err) => {
                        if (err){
                            throw err;
                        }
                    });
                    break;
                    case 3:
                    pool.query(`UPDATE teacher_rating
                    SET three = three + 1,
                    number_of_ratings = number_of_ratings + 1
                    WHERE teacher_id = $1`, [teacherId], (err) => {
                        if (err){
                            throw err;
                        }
                    });
                    break;
                    case 4:
                    pool.query(`UPDATE teacher_rating
                    SET four = four + 1,
                    number_of_ratings = number_of_ratings + 1
                    WHERE teacher_id = $1`, [teacherId], (err) => {
                        if (err){
                            throw err;
                        }
                    });
                    break;
                    case 5:
                    pool.query(`UPDATE teacher_rating
                    SET five = five + 1,
                    number_of_ratings = number_of_ratings + 1
                    WHERE teacher_id = $1`, [teacherId], (err) => {
                        if (err){
                            throw err;
                        }
                    });
                    break;
                    default:
                        throw err;
                }

                pool.query (`UPDATE teacher_rating
                SET average = (one + two * 2 + three * 3 + four * 4 + five * 5) ::float / number_of_ratings
                WHERE teacher_id = $1`, [teacherId], (err) => {
                    if (err) {
                        throw err;
                    }
                });

                pool.query(`UPDATE deals
                SET reviewed = $1
                WHERE id = $2`, [true, orderId], (err) => {
                    if(err){
                        throw err;
                    }
                });

                res.render('successfulReview');
            } );
        }
    });

   


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
            message: "Пожалуйста, заполните все поля. "
        });
    }

    if (password.length < 8 || password.length > 20) {
        errors.push({
            message: "Пароль должен иметь от 8 до 20 символов. "
        });
    }

    if (password != password2) {
        errors.push({
            message: "Пароли не совпадают. "
        });
    }

    if (errors.length > 0) {
        res.render('register', {
            okOk: req.isAuthenticated(),
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
        );

        pool.query(
            `SELECT * FROM teacher
            WHERE email = $1`, [email], (err, results) => {
                if (err) {
                    throw err
                }


                if (results.rows.length > 0) {
                    errors.push({
                        message: 'Аккаунт с такой почтой уже существует'
                    });
                    res.render('register', {
                        okOk: req.isAuthenticated(),
                        errors
                    });
                    console.log({
                        errors
                    });
                } else if (mistake === true) {
                    res.render('register', {
                        okOk: req.isAuthenticated(),
                        errors
                    });
                    console.log({
                        errors
                    });
                } else {
                    pool.query(
                        `INSERT INTO teacher (first_name, last_name, email, subject, password, phone, date_of_register)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id, password`, [name, lastName, email, subject, hashedPassword, phone, dateOfAction()], (err, results) => {
                            if (err) {
                                throw err
                            }
                            
                            let teacherId = results.rows[0].id; 

                            pool.query(
                                `INSERT INTO teacher_rating (teacher_id, one, two, three, four, five, average, number_of_ratings)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,[teacherId, 0, 0, 0, 0, 0, 0, 0,], (err, results) => {
                                    if(err) {
                                        throw err;
                                    }
                                    
                            req.flash('success_msg', "Вы зарегистрированы! Пожалуйста, войдите в систему.");
                            res.redirect('/users/login');
                                }
                            );
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
    let reviewResults = [[]];
    let subject = "";
    let teachId = [];
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
        LEFT JOIN teacher_info ON teacher_info.id=teacher.id
        LEFT JOIN teacher_rating ON teacher_rating.teacher_id=teacher.id
        WHERE subject = $1 AND show_me = $2`,[subject, true], async (err, results) => {
            if (err) {
                throw (err);
            }
            for (let i = 0; i < results.rows.length;i++){
                resultat[i] = {};
                for (let key in results.rows[i]){
                    resultat[i][key] = results.rows[i][key];   
                }
                teachId[i] = results.rows[i].id;
            }
            
                pool.query(`SELECT * 
                FROM reviews`,async (err,resultss) => {
                if(err){
                    throw(err);
                }
                
            for (let i = 0; i < teachId.length; i++) {
                let checker = false;
                reviewResults[i] = [];
                for (let j = 0; j < resultss.rows.length; j++) {
                    if (teachId[i] === resultss.rows[j].teacher_id) {
                    reviewResults[i].push(resultss.rows[j]);  
                    checker = true;
                    }
                    
                }
                
                if (!checker) {
                    reviewResults[i] =  [{
                        message: "Нет отзывов"
                    }];
                }
            }
        

            res.render('search', {
                okOk: req.isAuthenticated(),
                resultatF: function() {
                    return 'Base64.decode("' + Buffer.from(JSON.stringify(resultat)).toString('base64') + '")';
                },
                resultsReviewFunction: function() {
                    return 'Base64.decode("' + Buffer.from(JSON.stringify(reviewResults)).toString('base64') + '")';
                },
                reviewLength: reviewResults.length,
                length: resultat.length,
                option: option
            });
            });
            
            
            
            // console.log(typeof(resultat[0].first_name));
            
            
        }
    );

}
});

app.post("/user/register_end", checkNotAuthenticated,  (req, res) => {
    let option = req.body.gender;
    let id = req.user.id;
    let {
        gender,
        yearOfBirth,
        additionalInfo,
        achievements,
        pricePerLesson,
        lengthOfLesson,
        showMe
    } = req.body;
    console.log(showMe);
    
    let showMeToDB = false;

    if (showMe){
        showMeToDB = true;
    }

    let errors = [];

    additionalInfo = JSON.stringify(additionalInfo);
    additionalInfo = additionalInfo.escapeSpecialChars();

    achievements = JSON.stringify(achievements);
    achievements = achievements.escapeSpecialChars();


    if (!yearOfBirth || !additionalInfo || !achievements || !pricePerLesson || !lengthOfLesson) {
        errors.push({
            message: "Пожалуйста, не оставляйте поля пустыми. "
        })
    }

    if (isNaN(yearOfBirth) || isNaN(pricePerLesson) || isNaN(lengthOfLesson)) {
        errors.push({
            message: "Поля года рождения, стоимости занятия и длительности занятия могут принимать только числовые значения. "
        })       
    }

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

if (errors.length > 0) {

        pool.query(
            `SELECT *
            FROM teacher_info
            WHERE id = $1`, [id], (err, results) => {
                if (err) {
                    throw (err);
                }
                if(results.rows.length > 0){    
                    gender = results.rows[0].gender;
                    achievements = results.rows[0].achievements;
                    additionalInfo = results.rows[0].additional_info;
                    pricePerLesson = results.rows[0].price_per_lesson;
                    lengthOfLesson = results.rows[0].length_of_lesson;
                    yearOfBirth = results.rows[0].year_of_birth;   
                    showMe = results.rows[0].show_me;
                   res.render('register_end', {
                    okOk: req.isAuthenticated(),
                    gender: gender,
                    achievements: achievements,
                    additionalInfo: additionalInfo,
                    pricePerLesson: pricePerLesson,
                    lengthOfLesson: lengthOfLesson,
                    yearOfBirth: yearOfBirth,
                    showMe: showMe,
                    errors: errors
                });
                }
                else{
                    res.render('register_end', {
                        okOk: req.isAuthenticated(),
                        gender: gender,
                        achievements: achievements,
                        additionalInfo: additionalInfo,
                        pricePerLesson: pricePerLesson,
                        lengthOfLesson: lengthOfLesson,
                        yearOfBirth: yearOfBirth,
                        showMe: showMe,
                        errors: errors
                    });
                }
            });
    console.log({
        errors
    });
} else {
    
    pool.query(`SELECT * FROM teacher_info
    WHERE id = $1`, [id],  (err, results) =>  {
        if (err){
            throw err;
        }
        if (results.rows.length > 0) {
            pool.query(
                `UPDATE teacher_info
                SET gender = $1,
                achievements = $2,
                additional_info = $3, 
                price_per_lesson = $4, 
                length_of_lesson = $5, 
                year_of_birth = $6, 
                show_me = $7
                WHERE id = $8`, [gender, achievements, additionalInfo, pricePerLesson, lengthOfLesson, yearOfBirth, showMeToDB, id], (err, results) => {
                 if (err) {
                     throw err;
                 }
                 console.log("update");
                 req.flash('success_msg', "Данные обновлены.");
                    res.redirect('/search');
                }
            );
        }
        else {

            pool.query(
                `INSERT INTO teacher_info (gender, achievements , additional_info, price_per_lesson, length_of_lesson, year_of_birth, show_me, id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id`, [gender, achievements, additionalInfo, pricePerLesson, lengthOfLesson, yearOfBirth, showMeToDB, id], (err, results) => {
                    if (err) {
                        throw err
                    }
                    console.log("insert");
                    req.flash('success_msg', "Вы зарегистрированы! Пожалуйста, войдите в систему.");
                    res.redirect('/search');
                }
            );
        }
    });
    
}
});

app.post('/user/login', passport.authenticate('local', {
    successRedirect: '/profile/',
    failureRedirect: "/users/login",
    failureFlash: true
}));

// app.post('/user/login', passport.authenticate('local'), (req, res) => {
//     res.render("/users/register_end");
// });

// app.post('/user/login', passport.authenticate('local', {
//     successRender: "/users/register_end",
//     failureRedirect: "/users/login",
//     failureFlash: true
// }));

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
    let id = req.user.id;
        return res.redirect('/profile/' + id);
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



app.use(function (req, res, next) {
    res.status(404).render('404');
});



function dateOfAction() {
    let now = new Date();
    
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();

    year = addZero(year);
    month = addZero(month);
    day = addZero(day);
    hour = addZero(hour);
    minute = addZero(minute);

    let dateOfAction = `${day}.${month}.${year} в ${hour}:${minute}`;


    return dateOfAction;
}


function addZero(num) {
    if (num >= 0 && num < 10) {
        return `0${num}`;
    } else {
        return num;
    }
}

String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "")
               .replace(/\\'/g, "")
               .replace(/\\"/g, '')
               .replace(/\\&/g, "")
               .replace(/\\r/g, "")
               .replace(/\\t/g, "")
               .replace(/\\b/g, "")
               .replace(/\\f/g, "")
               .replace(/\"/g, "");
};



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

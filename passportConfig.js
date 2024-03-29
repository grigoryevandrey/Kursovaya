const LocalStrategy = require("passport-local").Strategy;
const { pool } = require('./dbconfig');
const bcrypt = require("bcrypt");
const { authenticate } = require("passport");

function initialize (passport) {
const authenticateUser = (email, password, done) => {
           pool.query(
               `SELECT * FROM teacher WHERE email = $1`, [email], (err, results) => {
                   if (err){
                       throw err
                   }

                   console.log(results.rows);

                   if (results.rows.length > 0){

                    const user =  results.rows[0];


                    bcrypt.compare(password, user.password, (err, isMatch   ) => {
                         if(err){
                             throw err
                         }

                         if (isMatch){
                             return done(null, user)
                         }else{
                             return done(null, false, {message: "Пароль не подходит."});
                         }
                    });
                   }
                   else{
                       return done(null, false, {message: "Такая почта не зарегестрирована."});
                   }
               }
           );
}
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
      },
      authenticateUser
     )
    );
    passport.serializeUser((user, done) => done(null, user.id));


    passport.deserializeUser((id, done) =>{
        pool.query(
            `SELECT * FROM teacher WHERE id = $1`, [id], (err, results) => {
                if (err) {
                    throw err
                }
                return done(null, results.rows[0]);
            }
        );
    });
}

module.exports = initialize;
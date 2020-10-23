const LocalStrategy = require("passport-local").Strategy;
const { pool } = require('./dbconfig');
const bcrypt = require("bcrypt");

function initialize (passport) {
    passport.use(new LocalStrategy({
        user
    }))
}
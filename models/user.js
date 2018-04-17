var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local : {
        username: String,
        password: String,
    },

    // attributes for twitter profile information
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },

    signupDate : { type: Date, default: Date.now() },

    favorites : {
        color: String,
        luckyNumber: Number
    }
});

userSchema.methods.generateHash = function (password) {
    //Generate salted has of plaintext password
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function (password) {

    // create hash of password entered, compare to stored hash
    // if hashes match, passwords used to create them were the same
    return bcrypt.compareSync(password, this.local.password);
};

User = mongoose.model('User', userSchema);

module.exports = User;
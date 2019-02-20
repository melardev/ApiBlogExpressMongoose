const User = require('../models/user.model');
const UsersDto = require("../dtos/users.dto");

const isEmpty = function (obj) {
    for (let key in obj) {
        if (this.hasOwnProperty(key))
            return false;
    }
    return true;
};

exports.login = function (req, res, next) {
    // If we land here it means passport has authenticated
    // the user succesfully so now we pass the token back

    return res.send(UsersDto.loginSuccess(req.user));
};

exports.register = function (req, res, next) {

    // validations
    const body = req.body;
    const errors = {};

    // validate form
    if (!body.username || body.username.trim() === '')
        errors.username = 'Username is required';

    if (!body.first_name || body.first_name.trim() === '')
        errors.first_name = 'Username is required';

    if (!body.last_name || body.last_name.trim() === '')
        errors.last_name = 'Username is required';

    if (!body.email || body.email.trim() === '')
        errors.email = 'Email is required';

    if (!body.password || body.password.trim() === '')
        errors.password = 'Password must not be empty';

    if (!body.password_confirmation || body.password_confirmation.trim() === '')
        errors.password_confirmation = 'Confirmation password must not be empty';

    if (!isEmpty(errors)) {
        //return res.status(422).send({});
        return res.status(422).json({success: false, errors});
    }

    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;

    return User.findOne({
        $or: [{
            'username': username // should I replace it with RegExp?
        }, {
            'email': new RegExp(["^", email, "$"].join(""), "i")
        }]
    }).then(user => {

        if (user != null) {
            // If the user exists, return Error
            if (user.username === body.username)
                errors.username = 'username: ' + body.username + 'is already taken';

            if (user.email === body.email)
                errors.email = 'Email: ' + body.email + 'is already taken';

            if (isEmpty(errors)) {
                return res.status(403).json({
                    success: false,
                    errors
                });
            }
        }
        user = new User({
            firstName, lastName,
            email: email,
            username: username,
            password: password
        });

        return user.save().then(user => {

            if (user) {
                res.json(UsersDto.registerDto());
            } else
                console.log('user is empty ...???');
        }).catch(err => {
            throw err
        });
    }).catch(err => {
        console.error(err);
        // res.status(500).json({success: false, error: user});
        res.status(500).json({
            success: false,
            full_messages: err
        });
    });
};
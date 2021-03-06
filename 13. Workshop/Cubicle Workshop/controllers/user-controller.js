const encryption = require('../util/encryption');
const errorService = require('../services/error-service');
const userService = require('../services/user-service');

module.exports = {
    get: {
        register: (req, res) => {
            res.render('users/register');
        },
        
        login: (req, res) => {
            res.render('users/login');
        },

        logout: (req, res) => {
            req.logout();
            res.redirect('/');
        }
    },

    post: {
        register: (req, res) => {
            const { username, password, repeatPassword} = req.body;
            if (password !== repeatPassword) {
                res.locals.globalError = 'Passwords must match!';
                res.render('users/register');
                return;
            }
            
            const salt = encryption.generateSalt();
            const hashedPass = encryption.generateHashedPassword(salt, password);
            
            userService
                .create(username, hashedPass, salt)
                .then(user => {
                    req.logIn(user, (err, user) => {
                        if (err) {
                            errorService.credentialError(res, err);
                        } else {
                            res.redirect('/');
                        }
                    });
                }).catch((err) => errorService.handleError(err, '/'));  
        },

        login: (req, res) => {
            const { username, password } = req.body;
    
            userService
                .get(username)
                .then(user => {
                    if (!user || !user.authenticate(password)) {
                        errorService.credentialError(res, 'Invalid user data');
                        return;
                    }
                    req.logIn(user, (err, user) => {
                        if (err) {
                            errorService.credentialError(res, err);
                        } else {
                            res.redirect('/');
                        }
                    });
                }).catch((err) => errorService.handleError(res, err, 'users/login'));  
        }
    }    
};
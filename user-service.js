const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoDBConnectionString = process.env.MONGO_URL;
let Schema = mongoose.Schema;
let userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    favourite: String,
    history: String
});

let User;

module.exports.connect = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString);

        db.on('error', err => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model('users', userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {

        if (userData.password != userData.password2) {
            reject('Passwords do not match');
        } else {

            bcrypt.hash(userData.password, 10).then(hash => {

                userData.password = hash;

                let newUser = new User(userData);

                newUser.save().then(() => {
                    resolve('User: ' + userData.userName + ' successfully registered');  
                }).catch(err => {
                    if (err.code == 11000) {
                        reject('User Name already taken');
                    } else {
                        reject('There was an error creating the user: ' + err);
                    }
                })
            }).catch(err => reject(err));
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
        .limit(1)
        .exec()
        .then((users) => {
            if (users.length == 0) {
                reject('Unable to find user ' + userData.userName);
            } else {
                bcrypt.compare(userData.password, users[0].password).then((res) => {
                    if (res === true) {
                        resolve(users[0]);
                    } else {
                        reject('Incorrect password for user ' + userData.userName);
                    }
                });
            }
        }).catch((err) => {
            reject('Unable to find user ' + userData.userName);
        });
    });
};

module.exports.getFavourites = function (id) {
    return new Promise(function (resolve, reject) {
        User.findById(id)
            .exec()
            .then(user => {
                resolve(user.favourite)
            }).catch(err => {
                reject(`Unable to get favourite for user with id: ${id}`);
            });
    });
}

module.exports.addFavourites = function (id, favId) {
    return new Promise(function (resolve, reject) {
        User.findById(id).exec().then(user => {
            if (user.favourite.length < 50) {
                User.findByIdAndUpdate(id,
                    { $addToSet: { favourite: favId } },
                    { new: true }
                ).exec()
                    .then(user => { resolve(user.favourite); })
                    .catch(err => { reject(`Unable to update favourite for user with id: ${id}`); })
            } else {
                reject(`Unable to update favourite for user with id: ${id}`);
            }
        })
    });
}

module.exports.removeFavourites = function (id, favId) {
    return new Promise(function (resolve, reject) {
        User.findByIdAndUpdate(id,
            { $pull: { favourite: favId } },
            { new: true }
        ).exec()
            .then(user => {
                resolve(user.favourite);
            })
            .catch(err => {
                reject(`Unable to update favourite for user with id: ${id}`);
            })
    });
}

module.exports.getHistory = function (id) {
    return new Promise(function (resolve, reject) {
        User.findById(id)
            .exec()
            .then(user => {
                resolve(user.history)
            }).catch(err => {
                reject(`Unable to get history for user with id: ${id}`);
            });
    });
}

module.exports.addHistory = function (id, historyId) {
    return new Promise(function (resolve, reject) {
        User.findById(id).exec().then(user => {
            if (user.favourite.length < 50) {
                User.findByIdAndUpdate(id,
                    { $addToSet: { history: historyId } },
                    { new: true }
                ).exec()
                    .then(user => { resolve(user.history); })
                    .catch(err => { reject(`Unable to update history for user with id: ${id}`); })
            } else {
                reject(`Unable to update history for user with id: ${id}`);
            }
        })
    });
}

module.exports.removeHistory = function (id, historyId) {
    return new Promise(function (resolve, reject) {
        User.findByIdAndUpdate(id,
            { $pull: { history: historyId } },
            { new: true }
        ).exec()
            .then(user => {
                resolve(user.history);
            })
            .catch(err => {
                reject(`Unable to update history for user with id: ${id}`);
            })
    });
}
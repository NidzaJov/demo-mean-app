const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
const User = require('../models/user');

exports.createUser = (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        imagePath: req.file? url + '/images/' + req.file.filename : '',
        role: req.body.role?? "Admin"
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created!',
            result: result
          })
        })
        .catch(err => {
          res.status(500).json({
            message: `Invalid authentication credentials! ${err}`
          });
        });
    });
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed! No such email!'
        });
      };
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: 'Auth failed! Wrong password'
        })
      }
      else if (result === true) {
        const token = jwt.sign(
          { email: fetchedUser.email, id: fetchedUser._id, role: fetchedUser.role },
          process.env.JWT_KEY,
          { expiresIn: '1h'}
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id,
          role: fetchedUser.role
        })
      }

    })
    .catch(err => {
        return res.status(401).json({
          message: 'Invalid authentication credentials!'
        });
    })
}

exports.getUsers = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const userQuery = User.find();
  let fetchedUsers;
  if (pageSize && currentPage) {
    userQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  userQuery
    .then(documents => {
      fetchedUsers = documents;
      return User.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Users fetched succesfully!",
        users: fetchedUsers,
        maxUsers: count
      })
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching users failed'
      })
    })
}

exports.getUser = (req, res, next) => {
  User.findById(req.params.id).then(user => {
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({message: 'User not found!'})
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching user failed!'
    })
  })
}

exports.updateUser = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const user = new User({
    _id: req.body.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    imagePath: imagePath,
    role: req.body.role
  })
  User.updateOne({ _id: req.params.id }, user)
  .then(result => {
    if (result.matchedCount > 0) {
      res.status(200).json({ message: "Update succesful!" })
    } else {
      res.status(401).json({ message: "Not authorized" })
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Couldn't update user!"
    })
  })
}

exports.deleteUser = (req, res, next) => {
  User.deleteOne({ _id: req.params.id })
  .then(result => {
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Deletion succesful!" })
    } else {
      res.status(401).json({ message: "Not authorized" })
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deleting user failed!'
    })
  })
}


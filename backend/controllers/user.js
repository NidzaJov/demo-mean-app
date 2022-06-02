const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require("crypto");
const sendEmail = require('../_helpers/send-email')

exports.createUser = (req, res, next) => {
  const user = User.findOne({ email: req.email }).then( user => {
    if (user) {
      sendAlreadyRegisteredEmail(req.body.email, req.origin).then(result => {
        res.status(400).json({ message: 'User with this emeil is already registered'})
      })
    }
    const url = req.protocol + '://' + req.get("host");
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          firstName: req.body.firstName?? '',
          lastName: req.body.lastName?? ``,
          email: req.body.email,
          password: hash,
          imagePath: req.file? url + '/images/' + req.file.filename : url + '/images/' + 'blank-profile-picture.png',
          role: req.body.role?? "Regular",
          verificationToken: randomTokenString(),
        });
        return user;
      }).then(user => {
        sendVerificationEmail(user, req.get("origin")).then(() => {
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
        })
      })
  })
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

      else if (!fetchedUser.verified) {
        return res.status(401).json({
          message: 'Auth failed! User not verified!'
        })
      }
        const token = jwt.sign(
          { email: fetchedUser.email, id: fetchedUser._id, role: fetchedUser.role },
          process.env.JWT_KEY,
          { expiresIn: '1h'}
        );
        return res.status(200).json({
          token: token,
          expiresIn: 3600,

          ...userDetails(fetchedUser)
        })
    })
    .catch(err => {
        console.log('Error catched')
        return res.status(401).json({
          message: `Invalid authentication credentials! ${err}`
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
      fetchedUsers = documents.map(d => userDetails(d));
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
      const uDetails = userDetails(user)
      res.status(200).json(uDetails);
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
  User.findOne({ email: req.body.email , _id: { $ne: req.body.id }}).then(userWithSameMail => {
    if (userWithSameMail) {
      res.status(400).json({ message: `Email ${request.body.email} is alredy taken`})
    }

    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + '://' + req.get("host");
      imagePath = url + "/images/" + req.file.filename
    }
    let user = new User({
      _id: req.body.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      imagePath: imagePath,
      role: req.body.role,
      updated: Date.now()
    })

    if (user.password) {
      user.password = bcrypt.hash(user.pasword);
    }
    else {
      user = user.toObject();
      delete user.password;
      user = new User({ ...user})
    }

    User.findOne({ _id: req.params.id }).then(userToUpdate => {
      let mergedUser = {  ...userToUpdate, ...user }
      User.updateOne({ _id: req.params.id }, mergedUser._doc)
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

    });

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

exports.verifyEmail = (req, res, next) => {
  let token = req.body.token;
  User.findOne({ verificationToken: token}).then(user => {
    if (!user) {
      res.status(401).json({ message: 'Not Authorized' })
    }
    User.updateOne({ _id: user._id}, { $set: { verified: Date.now(), verificationToken: undefined }, user}).then(result => {
      res.status(200).json({ message: 'User verified', result: result})
    })
  })
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

exports.forgotPassword = (req, res, next) => {
  const user = User.findOne({ email: req.body.email }).then( user => {
    if (!user) {
      res.status(400).json({ message: 'User not found'})
    }
    user.resetToken = {
      token: randomTokenString(),
      expires: new Date(Date.now + 24*60*60*1000)
    }
    sendPasswordResetEmail(user, req.origin).then(() => {
      user.save().then(result => {
        res.status(201).json({ message: "Reset token saved", result: result })
      })
    })
  })

}

exports.validateResetToken = (req, res, next) => {
  const user = User.findOne({
    'resetToken.token': req.token,
    'resetToken.expires': { $gt: Date.now() }
    .then(user => {
      if (!user) {
        res.status(400).json({ message: "User not found, reset token not valid"})
      }
      res.status(200).json({ message: "Reset token validated", result: user})
    })
  })
}

exports.resetPassword = (req, res, next) => {
  const user = User.findOne({
    'resetToken': req.token,
    'resetToken.expires': { $gt: Date.now() }
  }).then(user => {
    if (!user) {
      res.status(400).json({ message: "User not found, invalid reset token"})
    }
    user.password = hash(req.password);
    user.passwordReset = Date.now();
    user.resetToken = undefined;
    user.save().then(result => {
      res.status(200).json({ message: "Change password succesful!" })
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't change password!"
      })
    })
  })


}


function userDetails(user) {
  const { _id, firstName, lastName, email, role, created, updated, isVerified, imagePath } = user
  return  { userId: _id, firstName, lastName, email, role, created, updated, isVerified, imagePath };
}

async function sendVerificationEmail(user, origin) {
  let message;
  if (origin) {
      const verifyUrl = `${origin}/users/verify-email?token=${user.verificationToken}`;
      message = `<p>Please click the below link to verify your email address:</p>
                 <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
      message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                 <p><code>${user.verificationToken}</code></p>`;
  }

  await sendEmail({
      to: user.email,
      subject: 'Sign-up Verification API - Verify Email',
      html: `<h4>Verify Email</h4>
             <p>Thanks for registering!</p>
             ${message}`
  });
}

async function sendAlreadyRegisteredEmail(email, origin) {
  let message;
  if (origin) {
      message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
  } else {
      message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
  }

  await sendEmail({
      to: email,
      subject: 'Sign-up Verification API - Email Already Registered',
      html: `<h4>Email Already Registered</h4>
             <p>Your email <strong>${email}</strong> is already registered.</p>
             ${message}`
  });
}

async function sendPasswordResetEmail(account, origin) {
  let message;
  if (origin) {
      const resetUrl = `${origin}/account/reset-password?token=${account.resetToken.token}`;
      message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                 <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
      message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                 <p><code>${account.resetToken.token}</code></p>`;
  }

  await sendEmail({
      to: account.email,
      subject: 'Sign-up Verification API - Reset Password',
      html: `<h4>Reset Password Email</h4>
             ${message}`
  });
}

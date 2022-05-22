//const { expressjwt: jwt } = require('express-jwt');
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_KEY;

module.exports = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    //jwt({ secret, algorithms: ['HS256']}),
    (req, res, next) => {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_KEY);
      if ( roles.length && !roles.includes(decodedToken.role)) {
        return res.status(401).json({ message: 'Unauthorized'})
      }
      next()
    }
  ];
}

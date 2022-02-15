const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  //Get the token from the header
  //const token = req.header('x-auth-token');
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    //check if no token
    if (!token) {
      return res.status(401).json({
        msg: 'No token, authorization denied',
      });
    }

    //Verify token

    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;

    //If user was deleted the token should not be valid
    // const user = await User.findById(req.user.id);
    // if (!user) {
    //   return res.status(400).json({ msg: 'Token was deleted' });
    // }

    next();
  } catch (err) {
    return res.status(401).json({
      msg: 'Please authenticate first',
    });
  }
};

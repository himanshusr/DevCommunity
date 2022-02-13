const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');

//@route   Post api/users
//@desc    Register User
//@access  Public
router.post(
  '/',
  [
    //Using express validator to check ('param name', 'message', '.validation()')
    check('name', 'Name is Required').not().isEmpty(),
    check('email', 'Please enter valid email').isEmail(),
    check(
      'password',
      'Please enter password with 6 or more charactes'
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      //See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'User already exists',
            },
          ],
        });
      }
      //Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      //Initialize user
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //encrypt password using bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //save user
      await user.save();

      //return json web token

      const payload = {
        user: {
          //_id is in the db but with mongoose we can use .id and not ._id
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw err;
          } else {
            res.json({
              token,
            });
          }
        }
      );
    } catch (e) {
      console.log(e);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;

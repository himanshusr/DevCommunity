const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route   GET api/profile/me
//@desc    Get current users profile
//@access  Private
router.get('/me', auth, async (req, res) => {
  try {
    //populate method --> Used to populate profile from user model and bring in name and avatar
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    return res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Post api/profile/
//@desc    Create or Update a user profile
//@access  Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const fields = [
      'company',
      'website',
      'location',
      'bio',
      'status',
      'githubusername',
    ];
    const socialsArr = [
      'youtube',
      'twitter',
      'facebook',
      'linkedin',
      'instagram',
    ];
    //Build Profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    fields.forEach((field) => {
      if (req.body[field]) profileFields[field] = req.body[field];
    });

    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    //Build social object
    profileFields.social = {};
    socialsArr.forEach((item) => {
      if (req.body[item]) profileFields.social[item] = req.body[item];
    });

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User does not exist' });
      }
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //Create
      profile = await Profile(profileFields);
      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

//@route   Get api/profile/
//@desc    Get all users profile
//@access  Public

router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find({}).populate('user', ['name', 'avatar']);

    return res.send(profiles);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

//@route   Get api/profile/user/:user_id
//@desc    Get profile by userid
//@access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const valid = mongoose.Types.ObjectId.isValid(req.params.user_id);
    if (!valid) return res.status(400).json({ msg: 'Profile not found' });

    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.send(profile);
  } catch (err) {
    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Profile not found' });
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});
// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user posts
    // Remove profile
    // Remove user
    await Promise.all([
      Post.deleteMany({ user: req.user.id }),
      Profile.findOneAndRemove({ user: req.user.id }),
      User.findOneAndRemove({ _id: req.user.id }),
    ]);

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   DELETE api/profile/user/:user_id
//@desc    Delete profile, user,
//@access  Private

// router.delete('/user/:user_id', auth, async (req, res) => {
//   try {
//     //@todo - Remove tasks
//     //Remove profile
//     await Profile.findOneAndRemove({ user: req.user.id });
//     //Remove user
//     await User.findOneAndRemove({ _id: req.user.id });

//     return res.json({ msg: 'User Deleted' });
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId')
//       return res.status(400).json({ msg: 'Profile not found' });

//     return res.status(500).send('Server Error');
//   }
// });
//@route   PUT api/profile/experience
//@desc    Add profile experience,
//@access  Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExperience = {
      title,
      company,
      location,
      from: new Date(from.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
      to:
        to === undefined || to === ''
          ? null
          : new Date(to.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
      current,
      description,
    };
    //Add the experience
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: 'Profile does not exist' });
      }
      profile.experience.unshift(newExperience);

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

//@route   DELETE api/profile/experience/:exp_id
//@desc    Delete experience from profile,
//@access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    if (removeIndex >= 0) {
      // Splice out of array
      profile.experience.splice(removeIndex, 1);
    }

    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

//@route   PUT api/profile/education
//@desc    Add profile education,
//@access  Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty(),
      check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from: new Date(from.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
      to:
        to === undefined || to === ''
          ? null
          : new Date(to.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')),
      current,
      description,
    };
    //Add the experience
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ msg: 'Profile does not exist' });
      }
      profile.education.unshift(newEducation);

      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

//@route   DELETE api/profile/education/:exp_id
//@desc    Delete experience from profile,
//@access  Private

router.delete('/education/:ed_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.ed_id);

    if (removeIndex >= 0) {
      // Splice out of array
      profile.education.splice(removeIndex, 1);
    }

    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

//@route   GET api/profile/github/:username
//@desc    Get user repos from their username,
//@access  Public

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubApiClientId'
      )}&client_secret=${config.get('githubApiClientSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) {
        return console.error(error);
      }
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found' });
      }
      return res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

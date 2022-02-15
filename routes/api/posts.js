const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const mongoose = require('mongoose');

//@route   POST api/posts
//@desc    Create a post
//@access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      return res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

//@route   GET api/posts
//@desc    Get all posts
//@access  Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ date: -1 });
    return res.json(posts);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});
//@route   GET api/posts/:post_id
//@desc    Get post by id
//@access  Private

router.get('/:post_id', auth, async (req, res) => {
  try {
    const valid = mongoose.Types.ObjectId.isValid(req.params.post_id);
    if (!valid) return res.status(400).json({ msg: 'Post not found' });

    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    return res.json(post);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

//@route   DELETE api/posts/:post_id
//@desc    Delete a post
//@access  Private

router.delete('/:post_id', auth, async (req, res) => {
  try {
    const valid = mongoose.Types.ObjectId.isValid(req.params.post_id);
    if (!valid) return res.status(400).json({ msg: 'Post not found' });

    const post = await Post.findById(req.params.post_id);
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: ' User not authorized' });
    }

    if (!post) {
      return res.status(404).json({ msg: 'No Post found' });
    }

    await post.remove();
    return res.json({ msg: 'Post Deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Profile not found' });
    return res.status(500).send('Server Error');
  }
});

//@route   PUT api/posts/like/:post_id
//@desc    Like a post
//@access  Private

router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const valid = mongoose.Types.ObjectId.isValid(req.params.post_id);
    if (!valid) return res.status(400).json({ msg: 'Post not found' });

    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    //if post have already been liked by  a user

    let likesArr = post.likes.filter((like) => {
      return like.user.toString() === req.user.id;
    });

    if (likesArr.length > 0) {
      return res.status(400).json({ msg: 'Post has already been liked' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

//@route   PUT api/posts/unlike/:post_id
//@desc    unlike a post
//@access  Private

router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const valid = mongoose.Types.ObjectId.isValid(req.params.post_id);
    if (!valid) return res.status(400).json({ msg: 'Post not found' });

    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    //if post have already been liked by  a user
    const likeIndex = post.likes.findIndex((like) => {
      return like.user.toString() === req.user.id;
    });
    if (likeIndex === -1) {
      return res.status(400).json({ msg: 'Post like not found' });
    }
    post.likes.splice(likeIndex, 1);
    await post.save();
    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

//@route   Post api/posts/comment/
//@desc    Comment on a post
//@access  Private

router.post(
  '/comment/:post_id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const valid = mongoose.Types.ObjectId.isValid(req.params.post_id);
      if (!valid) return res.status(400).json({ msg: 'Post not found' });

      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.post_id);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
      if (!user) {
        return res.status(404).json({ msg: 'User does not exist' });
      }
      const comment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };
      post.comments.unshift(comment);

      await post.save();
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

//@route   DELETE api/posts/comment/:post_id/:comment_id
//@desc    Delete comment on a post
//@access  Private

router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  const validPost = mongoose.Types.ObjectId.isValid(req.params.post_id);
  if (!validPost) return res.status(400).json({ msg: 'Post not found' });

  const validComment = mongoose.Types.ObjectId.isValid(req.params.comment_id);
  if (!validComment) return res.status(400).json({ msg: 'Comment not found' });

  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post does not exist' });
    }
    const removeIndex = post.comments.findIndex((comment) => {
      return (
        comment._id.toString() === req.params.comment_id
        // comment.user.toString() === req.user.id
      );
    });
    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    if (post.comments[removeIndex].user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    post.comments.splice(removeIndex, 1);
    await post.save();
    return res.json(post.comments);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;

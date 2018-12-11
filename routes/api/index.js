const express = require('express');
const Register = require('../../models/register'); 
const Comment = require('../../models/comment'); 
const LikeLog = require('../../models/like-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/registers', require('./registers'));

// Like for Register
router.post('/registers/:id/like', catchErrors(async (req, res, next) => {
  const register = await Register.findById(req.params.id);
  if (!register) {
    return next({status: 404, msg: 'Not exist register'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, register: register._id});
  if (!likeLog) {
    register.numLikes++;
    await Promise.all([
      register.save(),
      LikeLog.create({author: req.user._id, register: register._id})
    ]);
  }
  return res.json(register);
}));

// Like for comment
router.post('/comments/:id/like', catchErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  comment.numLikes++;
  await comment.save();
  return res.json(comment);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;

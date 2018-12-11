const express = require('express');
const Register = require('../../models/register');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const registers = await Register.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({registers: registers.docs, page: registers.page, pages: registers.pages});   
}));

// Read
router.get('/:id', catchErrors(async (req, res, next) => {
  const register = await Register.findById(req.params.id).populate('author');
  res.json(register);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var register = new Register({
    title: req.body.title,
    author: req.user._id,
    content: req.body.content,
    tags: req.body.tags.map(e => e.trim()),
  });
  await register.save();
  res.json(register)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const register = await Register.findById(req.params.id);
  if (!register) {
    return next({status: 404, msg: 'Not exist register'});
  }
  if (register.author && register.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  register.title = req.body.title;
  register.content = req.body.content;
  register.tags = req.body.tags;
  await register.save();
  res.json(register);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const register = await Register.findById(req.params.id);
  if (!register) {
    return next({status: 404, msg: 'Not exist register'});
  }
  if (register.author && register.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  await Register.findOneAndRemove({_id: req.params.id});
  res.json({msg: 'deleted'});
}));


module.exports = router;
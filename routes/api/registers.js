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
    name: req.body.name,
    author: req.user._id,
    sponsor: req.body.sponsor,
    field: req.body.field,
    participate: req.body.participate,
    period: req.body.period,
    content: req.body.content,
    award: req.body.award,
    manager: req.body.manager,
    contact: req.body.contact,
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
  register.name = req.body.name;
  register.sponsor = req.body.sponsor;
  register.field = req.body.field;
  register.participate = req.body.participate;
  register.period = req.body.period;
  register.content = req.body.content;
  register.award = req.body.award;
  register.manager = req.body.manager;
  register.contact = req.body.contact;
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
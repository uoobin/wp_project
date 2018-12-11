const express = require('express');
const Register = require('../models/register');
const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET registers listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var regist = {};
  const term = req.query.term;
  if (term) {
    regist = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const registers = await Register.paginate(regist, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('registers/index', {registers: registers, term: term, regist: req.regist});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('registers/new', {register: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const register = await Register.findById(req.params.id);
  res.render('registers/edit', {register: register});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const register = await Register.findById(req.params.id).populate('author');
  const comments = await Comment.find({register: register.id}).populate('author');
  register.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await register.save();
  res.render('registers/show', {register: register, comments: comments});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const register = await Register.findById(req.params.id);

  if (!register) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
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
  req.flash('success', 'Successfully updated');
  res.redirect('/registers');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Register.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/registers');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var register = new Register({
    name: req.body.name,
    author: user._id,
    sponsor: req.body.sponsor,
    field: req.body.field,
    participate: req.body.participate,
    period: req.body.period,
    content: req.body.content,
    award: req.body.award,
    manager: req.body.manager,
    contact: req.body.contact
  });
  await register.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/registers');
}));

router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const register = await Register.findById(req.params.id);

  if (!register) {
    req.flash('danger', 'Not exist contest');
    return res.redirect('back');
  }

  var comment = new Comment({
    author: user._id,
    register: register._id,
    comment: req.body.comment
  });
  await comment.save();
  register.numComments++;
  await register.save();

  req.flash('success', 'Successfully commented');
  res.redirect(`/registers/${req.params.id}`);
}));

module.exports = router;

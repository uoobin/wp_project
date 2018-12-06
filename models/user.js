var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({ //이름, 이메일, 비번, 가입일시
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var User = mongoose.model('User', schema);

module.exports = User;

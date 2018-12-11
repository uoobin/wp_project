const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' }, //Usr 모델의 id를 reference함
  name: {type: String, trim: true, required: true},
  sponsor: {type: String, trim: true, required: true},
  field: {type: String, trim: true, required: true},
  participate: {type: String, trim: true, required: true},
  period: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  award: {type: String, trim: true, required: true},
  manager: {type: String, trim: true, required: true},
  contact: {type: String, trim: true, required: true},
  numLikes: {type: Number, default: 0},
  numDisLikes: {type: Number, default: 0},
  numComments: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Register = mongoose.model('Register', schema);

module.exports = Register;

var moment = require('moment');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TimeSchema = new Schema(
  {
    table: { type: Schema.ObjectId, ref: 'Table', required: true }, //ссылка на столик
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Reserved'], default: 'Maintenance'},
    tim: {type: Date, required: true}
  }
);
TimeSchema
.virtual('url')
.get(function () {
  return '/catalog/time/' + this._id;
});

TimeSchema
.virtual('tim_formatted')
.get(function () {
  return moment(this.tim).format('MMMM Do, YYYY');
});

//Export model
module.exports = mongoose.model('Time', TimeSchema);
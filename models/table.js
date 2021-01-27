var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TableSchema = new Schema(
  {
    typetable: { type: Schema.ObjectId, ref: 'TypeTable', required: true },
    number: {type: String, required: true},
    description: {type: String},
  }
);


// Виртуальное свойство - URL столика
TableSchema
.virtual('url')
.get(function () {
  return '/catalog/table/' + this._id;
});

//Export model
module.exports = mongoose.model('Table', TableSchema);

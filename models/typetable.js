var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TypeTableSchema = new Schema(
  {
    type: {type: String, required: true}
  }
);


// Виртуальное свойство - URL типа столика
TypeTableSchema
.virtual('url')
.get(function () {
  return '/catalog/typetable/' + this._id;
});

//Export model
module.exports = mongoose.model('TypeTable', TypeTableSchema);

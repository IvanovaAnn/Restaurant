const validator = require('express-validator');
var async = require('async');
var TypeTable = require('../models/typetable');
var Table = require('../models/table');
var Time = require('../models/time');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        table_count: function(callback) {
            Table.countDocuments({}, callback); 
        },
        time_count: function(callback) {
            Time.countDocuments({}, callback);
        },
        time_available_count: function(callback) {
            Time.countDocuments({status:'Available'}, callback);
        },
        typetable_count: function(callback) {
            TypeTable.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Rest Home', error: err, data: results });
    });
};

// Показать список всех типов столов.
exports.typetable_list = function(req, res, next) {

  TypeTable.find()
    .populate()
    .exec(function (err, list_typetables) {
      if (err) { return next(err); }
      res.render('typetable_list', { title: 'TypeTable List', typetable_list: list_typetables });
    });

};

// Показать подробную страницу для данного типа.
exports.typetable_detail = function(req, res, next) {

    async.parallel({
        typetable: function(callback) {
            TypeTable.findById(req.params.id)
              .exec(callback);
        },

        typetable_tables: function(callback) {
          Table.find({ 'typetable': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.typetable==null) { // No results.
            var err = new Error('TypeTable not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('typetable_detail', { title: 'TypeTable Detail', typetable: results.typetable, typetable_tables: results.typetable_tables } );
    });

};

// Показать форму создания типа по запросу GET.
exports.typetable_create_get = function(req, res, next) {
  res.render('typetable_form', { title: 'Create TypeTable' });
};

// Создать тип стола по запросу POST.
exports.typetable_create_post = [
  validator.body('type', 'TypeTable type required').trim().isLength({ min: 1 }),
  validator.sanitizeBody('type').escape(),
  (req, res, next) => {
    const errors = validator.validationResult(req);
    var typetable = new TypeTable(
      { type: req.body.type }
    );

    if (!errors.isEmpty()) {
      res.render('typetable_form', { title: 'Create TypeTable', typetable: typetable, errors: errors.array()});
      return;
    }
    else {
      TypeTable.findOne({ 'type': req.body.type })
        .exec( function(err, found_typetable) {
           if (err) { return next(err); }

           if (found_typetable) {
             res.redirect(found_typetable.url);
           }
           else {
             typetable.save(function (err) {
               if (err) { return next(err); }
               res.redirect(typetable.url);
             });

           }

         });
    }
  }
];

// Показать форму удаления типа по запросу GET.
exports.typetable_delete_get = function(req, res, next) {
    async.parallel({
        typetable: function(callback) {
            TypeTable.findById(req.params.id).exec(callback)
        },
        typetables_tables: function(callback) {
          Table.find({ 'typetable': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.typetable==null) { 
            res.redirect('/catalog/typetables');
        }
        res.render('typetable_delete', { title: 'Delete TypeTable', typetable: results.typetable, typetable_tables: results.typetables_tables } );
    });

};

// Удалить тип по запросу POST.
exports.typetable_delete_post = function(req, res, next) {

    async.parallel({
        typetable: function(callback) {
          TypeTable.findById(req.body.typetableid).exec(callback)
        },
        typetables_tables: function(callback) {
          Table.find({ 'typetable': req.body.typetableid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.typetables_tables.length > 0) {
            res.render('typetable_delete', { title: 'Delete TypeTable', typetable: results.typetable, typetable_tables: results.typetables_tables } );
            return;
        }
        else {
            TypeTable.findByIdAndRemove(req.body.typetableid, function deleteTypeTable(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/typetables')
            })
        }
    });
};

// Показать форму обновления типа по запросу GET.
exports.typetable_update_get = function(req, res, next) {
    async.parallel({
        typetable: function(callback) {
            TypeTable.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.typetable==null) {
                var err = new Error('TypeTable not found');
                err.status = 404;
                return next(err);
            }
            res.render('typetable_form', { title: 'Update TypeTable', typetable: results.typetable });
        });

};

exports.typetable_update_post = [
    validator.body('type').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validator.validationResult(req);
        var typetable = new TypeTable(
          { type: req.body.type,
            _id:req.params.id
           });

        if (!errors.isEmpty()) {
            async.parallel(
              function(err, results) {
                if (err) { return next(err); }
                res.render('typetable_form', { title: 'Update TypeTable', typetable: typetable, errors: errors.array() });
            });
            return;
        }
        else {
            TypeTable.findByIdAndUpdate(req.params.id, typetable, {}, function (err,thetypetable) {
                if (err) { return next(err); }
                   res.redirect(thetypetable.url);
                });
        }
    }
];

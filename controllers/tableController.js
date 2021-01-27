const { body,validationResult } = require('express-validator');
var async = require('async');
var TypeTable = require('../models/typetable');
var Table = require('../models/table');
var Time = require('../models/time');

exports.table_list = function(req, res, next) {

  Table.find({}, 'number typetable')
    .populate('typetable')
    .exec(function (err, list_tables) {
      if (err) { return next(err); }
      res.render('table_list', { title: 'Table List', table_list: list_tables });
    });

};

exports.table_detail = function(req, res, next) {

    async.parallel({
        table: function(callback) {

            Table.findById(req.params.id)
              .populate('typetable')
              .exec(callback);
        },
        time: function(callback) {

          Time.find({ 'table': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.table==null) { // No results.
            var err = new Error('Table not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('table_detail', { title: results.table.number, table: results.table, times: results.time } );
    });

};


exports.table_create_get = function(req, res, next) {
    async.parallel({
        typetables: function(callback) {
            TypeTable.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('table_form', { title: 'Create Table', typetables: results.typetables });
    });

};

exports.table_create_post = [
    (req, res, next) => {
        if(!(req.body.typetable instanceof Array)){
            if(typeof req.body.typetable ==='undefined')
            req.body.typetable = [];
            else
            req.body.typetable = new Array(req.body.typetable);
        }
        next();
    },

    body('typetable', 'Typetable must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('number', 'Number must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var table = new Table(
          { typetable: req.body.typetable,
            number: req.body.number,
            description: req.body.description
           });

        if (!errors.isEmpty()) {
            async.parallel({
                typetables: function(callback) {
                    TypeTable.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('table_form', { title: 'Create Book',typetables:results.typetables, table: table, errors: errors.array() });
            });
            return;
        }
        else {
            table.save(function (err) {
                if (err) { return next(err); }
                   res.redirect(table.url);
                });
        }
    }
];

exports.table_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Table delete GET');
};

exports.table_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Table delete POST');
};

exports.table_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Table update GET');
};

exports.table_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Table update POST');
};

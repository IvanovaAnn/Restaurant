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

exports.table_delete_get = function(req, res, next) {

    async.parallel({
        table: function(callback) {
            Table.findById(req.params.id).exec(callback)
        },
        tables_times: function(callback) {
          Time.find({ 'table': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.table==null) { 
            res.redirect('/catalog/tables');
        }
        res.render('table_delete', { title: 'Delete Table', table: results.table, table_times: results.tables_times } );
    });

};

exports.table_delete_post = function(req, res, next) {

    async.parallel({
        table: function(callback) {
          Table.findById(req.body.tableid).exec(callback)
        },
        tables_times: function(callback) {
          Time.find({ 'table': req.body.tableid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.tables_times.length > 0) {
            res.render('table_delete', { title: 'Delete Table', table: results.table, table_times: results.tables_times } );
            return;
        }
        else {
            Table.findByIdAndRemove(req.body.tableid, function deleteTable(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/tables')
            })
        }
    });
};

exports.table_update_get = function(req, res, next) {
    async.parallel({
        table: function(callback) {
            Table.findById(req.params.id).populate('typetable').exec(callback);
        },
        typetables: function(callback) {
            TypeTable.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.table==null) { 
                var err = new Error('Table not found');
                err.status = 404;
                return next(err);
            }
            res.render('table_form', { title: 'Update Table', typetables:results.typetables, table: results.table });
        });

};

exports.table_update_post = [
    //(req, res, next) => {},
    body('typetable').trim().isLength({ min: 1 }).escape(),
    body('number').trim().isLength({ min: 1 }).escape(),
    body('description').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var table = new Table(
          { typetable: req.body.typetable,
            number: req.body.number,
            description: req.body.description,
            _id:req.params.id
           });

        if (!errors.isEmpty()) {
            async.parallel({
                typetables: function(callback) {
                    TypeTable.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('table_form', { title: 'Update Table',typetables:results.typetables, table: table, errors: errors.array() });
            });
            return;
        }
        else {
            Table.findByIdAndUpdate(req.params.id, table, {}, function (err,thetable) {
                if (err) { return next(err); }
                   res.redirect(thetable.url);
                });
        }
    }
];
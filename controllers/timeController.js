const { body,validationResult } = require('express-validator');
var async = require('async');
var TypeTable = require('../models/typetable');
var Table = require('../models/table');
var Time = require('../models/time');

exports.time_list = function(req, res, next) {

  Time.find()
    .populate('table')
    .sort([['tim']])
    .exec(function (err, list_times) {
      if (err) { return next(err); }
      res.render('time_list', { title: 'Time List', time_list: list_times });
    });

};

exports.time_detail = function(req, res, next) {

    Time.findById(req.params.id)
    .populate('table')
    .exec(function (err, time) {
      if (err) { return next(err); }
      if (time==null) { 
          var err = new Error('Time for a booking not found');
          err.status = 404;
          return next(err);
        }
      res.render('time_detail', { title: 'Time: '+time.table.number, time:  time});
    })

};

exports.time_create_get = function(req, res, next) {
    Table.find({},'number')
    .exec(function (err, tables) {
      if (err) { return next(err); }
      res.render('time_form', {title: 'Create Time', table_list: tables});
    });

};

exports.time_create_post = [
    body('table', 'Table must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('tim', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        var time = new Time(
          { table: req.body.table,
            status: req.body.status,
            tim: req.body.tim
           });

        if (!errors.isEmpty()) {
            Table.find({},'number')
                .exec(function (err, tables) {
                    if (err) { return next(err); }
                    res.render('time_form', { title: 'Create Time', table_list: tables, selected_table: time.table._id , time: time, errors: errors.array() });
            });
            return;
        }
        else {
            time.save(function (err) {
                if (err) { return next(err); }
                   res.redirect(time.url);
                });
        }
    }
];

exports.time_delete_get = function(req, res, next) {

    async.parallel({
        time: function(callback) {
            Time.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.time==null) { 
            res.redirect('/catalog/times');
        }
        res.render('time_delete', { title: 'Delete Time', time: results.time} );
    });

};

exports.time_delete_post = function(req, res, next) {

    async.parallel({
        time: function(callback) {
          Time.findById(req.body.timeid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        Time.findByIdAndRemove(req.body.timeid, function deleteTime(err) {
          if (err) { return next(err); }
          res.redirect('/catalog/times')
        })
    });
};
exports.time_update_get = function(req, res, next) {
    async.parallel({
        time: function(callback) {
            Time.findById(req.params.id).populate('table').exec(callback);
        },
        tables: function(callback) {
            Table.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.time==null) {
                var err = new Error('Time not found');
                err.status = 404;
                return next(err);
            }
            res.render('time_form', { title: 'Update Time', table_list:results.tables, table: results.table });
        });

};

exports.time_update_post = [
    body('table', 'Table must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('status', 'Status must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('tim', 'Time(Data) must not be empty.').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var time = new Time(
          { table: req.body.table,
            status: req.body.status,
            tim: req.body.tim,
            _id:req.params.id
           });

        if (!errors.isEmpty()) {
            async.parallel({
                tables: function(callback) {
                    Table.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('time_form', { title: 'Update Time',table_list:results.tables, time: time, errors: errors.array() });
            });
            return;
        }
        else {
            Time.findByIdAndUpdate(req.params.id, time, {}, function (err,thetime) {
                if (err) { return next(err); }
                   res.redirect(thetime.url);
                });
        }
    }
];

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

exports.time_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Time delete GET');
};

exports.time_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Time delete POST');
};

exports.time_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Time update GET');
};

exports.time_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Time update POST');
};

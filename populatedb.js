#! /usr/bin/env node

console.log('This script populates some test table, typetable and time to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var TypeTable = require('./models/typetable')
var Table = require('./models/table')
var Time = require('./models/time')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var typetables = []
var tables = []
var times = []

function typetableCreate(type, cb) {
  typetabledetail = { 
    type: type
  }
  var typetable = new TypeTable(typetabledetail);
       
  typetable.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New TypeTable: ' + typetable);
    typetables.push(typetable)
    cb(null, typetable);
  }   );
}

function tableCreate(typetable, number, description, cb) {
  tabledetail = { 
    typetable: typetable,
    number: number
  }
  if (description != false) tabledetail.description = description
    
  var table = new Table(tabledetail);    
  table.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Table: ' + table);
    tables.push(table)
    cb(null, table)
  }  );
}


function timeCreate(table, status, tim, cb) {
  timedetail = { 
    table: table,
    status: status,
    tim: tim
  }
    
  var time = new Time(timedetail);    
  time.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Time: ' + time);
    times.push(time)
    cb(null, time)
  }  );
}

function createTypeTables(cb) {
    async.parallel([
        function(callback) {
          typetableCreate('single table', callback);
        },
        function(callback) {
          typetableCreate('double table', callback);
        },
        function(callback) {
          typetableCreate('triple table', callback);
        },
        function(callback) {
          typetableCreate('four-person table', callback);
        },
        function(callback) {
          typetableCreate('five-person table', callback);
        },
	      function(callback) {
          typetableCreate('six-person table', callback);
        }
        ],
        // optional callback
        cb);
}

function createTables(cb) {
    async.parallel([
        function(callback) {
          tableCreate(typetables[1], 'one', 'Чудесный столик у окна.', callback);
      	},
        function(callback) {
          tableCreate(typetables[2], 'two', 'Столик для раздумий или работы.', callback);
        },
        function(callback) {
          tableCreate(typetables[4], 'three', 'Столик рядом со сценой. Лучшая слышимость живой музыки.', callback);
        },
        function(callback) {
          tableCreate(typetables[0], 'four',  'Столик рядом с пианино. Лучшая слышимость джазовой музыки.', callback);
        },
        function(callback) {
          tableCreate(typetables[5], 'five', 'Столик рядом с окном. Лучшие пейзажи.', callback);
        },
        function(callback) {
          tableCreate(typetables[3], 'six', 'Столик рядом с баром. Больше клюквенного сока.', callback);
        },
        function(callback) {
          tableCreate(typetables[3], 'seven', 'Дальний столик', callback);
        }
        ],
        // optional callback
        cb);
}

function createTimes(cb) {
    async.parallel([
        function(callback) {
          timeCreate(tables[1], 'Available', '2021-01-27', callback)
        },
        function(callback) {
          timeCreate(tables[1], 'Reserved', '2021-01-28', callback)
        },
        function(callback) {
          timeCreate(tables[2], 'Available', '2021-01-26', callback)
        },
        function(callback) {
          timeCreate(tables[2], 'Reserved', '2021-01-25', callback)
        },
        function(callback) {
          timeCreate(tables[3], 'Available', '2021-01-27', callback)
        },
        function(callback) {
          timeCreate(tables[4], 'Reserved', '2021-01-27', callback)
        },
        function(callback) {
          timeCreate(tables[5], 'Reserved', '2021-01-27', callback)
        },
        function(callback) {
          timeCreate(tables[3], 'Available', '2021-01-29', callback)
        },
        function(callback) {
          timeCreate(tables[5], 'Reserved', '2021-01-29', callback)
        },
        function(callback) {
          timeCreate(tables[4], 'Available', '2021-01-31', callback)
        },
        function(callback) {
          timeCreate(tables[1], 'Available', '2021-01-21', callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createTypeTables,
    createTables,
    createTimes
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Times: '+times);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});

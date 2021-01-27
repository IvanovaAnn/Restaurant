var express = require('express');
var router = express.Router();

// Требующиеся модули контроллеров.
var typetable_controller = require('../controllers/typetableController');
var table_controller = require('../controllers/tableController');
var time_controller = require('../controllers/timeController');

// GET catalog home page.
router.get('/', typetable_controller.index);

router.get('/typetable/create', typetable_controller.typetable_create_get);
router.post('/typetable/create', typetable_controller.typetable_create_post);
router.get('/typetable/:id/delete', typetable_controller.typetable_delete_get);
router.post('/typetable/:id/delete', typetable_controller.typetable_delete_post);
router.get('/typetable/:id/update', typetable_controller.typetable_update_get);
router.post('/typetable/:id/update', typetable_controller.typetable_update_post);
router.get('/typetable/:id', typetable_controller.typetable_detail);
router.get('/typetables', typetable_controller.typetable_list);

router.get('/table/create', table_controller.table_create_get);
router.post('/table/create', table_controller.table_create_post);
router.get('/table/:id/delete', table_controller.table_delete_get);
router.post('/table/:id/delete', table_controller.table_delete_post);
router.get('/table/:id/update', table_controller.table_update_get);
router.post('/table/:id/update', table_controller.table_update_post);
router.get('/table/:id', table_controller.table_detail);
router.get('/tables', table_controller.table_list);

router.get('/time/create', time_controller.time_create_get);
router.post('/time/create', time_controller.time_create_post);
router.get('/time/:id/delete', time_controller.time_delete_get);
router.post('/time/:id/delete', time_controller.time_delete_post);
router.get('/time/:id/update', time_controller.time_update_get);
router.post('/time/:id/update', time_controller.time_update_post);
router.get('/time/:id', time_controller.time_detail);
router.get('/times', time_controller.time_list);

module.exports = router;

'use strict';

var express = require('express');
var validUrl = require('valid-url');
var router = express.Router();
var assert = require('assert');
var dbHelper = require('../db/dbHelper');

/**
 * The home page.
 */
router.get('/', function(req, res, next) {
  res.render('index', {
    host: req.headers.host
  });
});

/**
 * Registers a new short url.
 */
router.get('/new/(*)', function(req, res) {
  if (validUrl.isUri(req.params[0])) {
    var db = req.app.locals.db;

    dbHelper.getNextSequence(db, function(err, data) {
      assert.equal(err, null);

      var collection = db.collection('shortUrls');
      collection.insertOne({
        key: data.value.seq,
        url: req.params[0]
      },
      function(err, result) {
        assert.equal(err, null);
        res.json({
          originalUrl: req.params[0],
          shortUrl: req.headers.host + '/' + data.value.seq
        });
      });
    });
  }
  else {
    res.json({
      error: 'Not a valid url'
    });
  }
});

/**
 * Router for the short url.
 *
 * If the passed id is registered, then it will redirect to the original url.
 * Otherwise, an error message will be shown.
 */
router.get('/:id(\\d+)/', function(req, res) {
  var db = req.app.locals.db;

  var collection = db.collection('shortUrls');
  collection.find({
    'key': parseInt(req.params.id)
  })
  .toArray(function(err, doc) {
    assert.equal(err, null);

    if (doc.length) {
      res.redirect(doc[0].url);
    }
    else {
      res.json({
        error: 'No record found'
      });
    }
  });
});

module.exports = router;

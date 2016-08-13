'use strict';

require('dotenv').config();
var express = require('express');
var validUrl = require('valid-url');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/new/(*)', function(req, res) {
  if (validUrl.isUri(req.params[0])) {
    MongoClient.connect(process.env.MONGO_URI, function(err, db) {
      assert.equal(err, null);

      getNextSequence(db, function(err, data) {
        assert.equal(err, null);

        var collection = db.collection('shortUrls');
        collection.insertOne({
          key: data.value.seq,
          url: req.params[0]
        },
        function(err, result) {
          assert.equal(err, null);
          db.close();
          res.json({
            originalUrl: req.params[0],
            shortUrl: req.headers.host + '/' + data.value.seq
          });
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

router.get('/:id(\\d+)/', function(req, res) {
  MongoClient.connect(process.env.MONGO_URI, function(err, db) {
    assert.equal(err, null);

    var collection = db.collection('shortUrls');
    collection.find({
      'key': parseInt(req.params.id)
    })
    .toArray(function(err, doc) {
      assert.equal(err, null);

      db.close();
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
});

function getNextSequence(db, callback) {
  var collection = db.collection('counter');

  collection.find().toArray(function(err, docs) {
    assert.equal(err, null);

    if (docs.length) {
      collection.findOneAndUpdate({
        _id: 'userid'
      },
      {
        $inc: {
          seq: 1
        }
      },
      {
        upsert: true,
        returnOriginal: false
      },
      function(err, docs) {
        assert.equal(err, null);
        callback(err, docs);
      });
    }
    else {
      var initData = {
        _id: 'userid',
        seq: 1
      };
      collection.insertOne(initData, function(err, docs) {
        assert.equal(err, null);
        callback(err, {
          value: initData
        });
      });
    }
  });
}

module.exports = router;

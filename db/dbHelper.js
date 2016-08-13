var assert = require('assert');

module.exports.getNextSequence = function(db, callback) {
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

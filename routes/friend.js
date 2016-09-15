var express = require('express');
var db = require('../util/db.js');
var router = express.Router();

router.get('/list', function(req, res){

  var queryData = 'SELECT user.userid, user.nickname, user.userprofileimage ';
  queryData += 'FROM user ';
  queryData += 'WHERE userid IN ';
  queryData += '(SELECT friend_id FROM friend WHERE me_id = ?)';

  db.query(queryData, req.user.userid, function (err, results) {
      if (err) {
        res.send(500);
      }
      res.json(results);
  });
});

router.get('/add', function(req, res){
  res.render('friend_add_form');
});

router.post('/add', function(req, res){
  console.log(res.body.friend_id);

  // var addFriend = {
  //   me_id: req.user.userid,
  //   friend_id: req.body.friend_id
  // }
  //
  // var queryData = 'INSERT INTO friend SET ? ';
  //
  // db.query(queryData, addFriend, function (err, results) {
  //     if (err) {
  //       res.send(500);
  //     }
  //     console.log('SECCESS FRIEND ADD');
  // });

});


module.exports = router;

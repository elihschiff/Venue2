const express = require('express');
const pollRoutes = express.Router();

let LecturePoll = require('../LecturePoll/LecturePoll.model');

pollRoutes.route('/add').post(function (req, res) {
  let poll = new LecturePoll(req.body.poll);
  console.log(req.body.poll)
  poll.save()
    .then(() => {
      res.status(200).json(poll);
    })
    .catch(() => {
      res.status(400).send("unable to save poll to database");
    });
});

pollRoutes.route('/').get(function (req, res) {
  LecturePoll.find(function (err, polls) {
    if (err)
      res.json(err);
    res.json(polls);
  });
});

pollRoutes.route('/by_lecture/:lectureid').get(function (req, res) {
  LecturePoll.find({lecture: req.params.lectureid},function (err, polls) {
    if (err) {
      res.json(err);
    } else {
      res.json(polls);
    }
  });
});

module.exports = pollRoutes;
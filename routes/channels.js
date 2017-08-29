const express = require('express');
const { getChannels, getChannelById } = require('../repositories/channel-repository');
const cors = require('cors');

// eslint-disable-next-line new-cap
const router = express.Router();

router.use(cors());

router.get('/channels', (req, res, next) => {
  getChannels()
    .then((channels) => {
      res.status(200).send(channels);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/channels/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  getChannelById(id)
    .then((channel) => {
      res.status(200).send(channel);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;

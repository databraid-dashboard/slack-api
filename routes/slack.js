const express = require('express');
const request = require('request');
const { writeMessage } = require('../repositories/event-repository');
const { analyzeSentimentAndSaveScore } = require('../src/sentiment');

const router = express.Router();

router.get('/auth/redirect', (req, res) => {
  // This gets hit after click event to log in, and the slack 'app' sends back a code
  const options = {
    uri: `https://slack.com/api/oauth.access?code=${req.query.code}&client_id=${process.env
      .SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&redirect_uri=${process.env
      .REDIRECT_URI}`,
    method: 'GET',
  };

  request(options, (error, response, body) => {
    const JSONresponse = JSON.parse(body);
    console.log(JSONresponse);
    if (!JSONresponse.ok) {
      res.send(`Error encountered: \n${JSON.stringify(JSONresponse)}`).status(200).end();
    } else {
      res.send('BOUNCE!');
    }
  });
});

router.get('/auth', (req, res) => {
  const buttonHTML = `<a href="https://slack.com/oauth/authorize?scope=incoming-webhook&client_id=${process
    .env.SLACK_CLIENT_ID}&redirect_uri=${process.env
    .REDIRECT_URI}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`;
  return res.send(buttonHTML);
  // res.sendFile('/app/assets/html/add_to_slack.html'); // Produces the HTML button that allows user to sign in with OAuth
});

function setEvents(io) {
  // This gets hit after a message is sent inside the literal slack app, and picked up by the slack 'app' (https://api.slack.com/apps/Databraid_Slack_App)
  router.post('/events', (req, res) => {
    writeMessage(
      req.body.event.user,
      req.body.event.text,
      req.body.event.ts,
      req.body.event.channel,
    ).then((message) => {
      const channelId = message[0].channel_map_id;
      const messageId = message[0].id;

      const newMessage = {};
      newMessage[channelId] = {}; // Slack's channel ID as key
      newMessage[channelId][messageId] = {}; // Our message ID as key

      newMessage[channelId][messageId].avatarImage = '';
      newMessage[channelId][messageId].userId = message[0].user_map_id;
      newMessage[channelId][messageId].name = req.body.event.user; // To be changed after MVP
      newMessage[channelId][messageId].text = message[0].message;
      newMessage[channelId][messageId].timestamp = message[0].message_timestamp;
      newMessage[channelId][messageId].channelId = message[0].channel_map_id;

      console.log('>>>>>>>>>>>>> ', newMessage);

      io.sockets.emit('messages', newMessage); // Sending message to the frontend client

      // analyzeSentimentAndSaveScore(io, message[0].channel_map_id); // Passing message off for Sentiment Analysis
    });
    res.sendStatus(200);
  });
}

module.exports = { router, setEvents };

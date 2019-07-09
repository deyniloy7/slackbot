"use strict";

const { RTMClient } = require("@slack/rtm-api");

const CLIENT_EVENTS = require("@slack/client").CLIENT_EVENTS;
const RTM_EVENTS = require("@slack/client").RTM_EVENTS;
let rtm = null;
let nlp = null;

function handleOnAuthenticated(rtmStartData) {
  console.log(
    `Logged in as ${rtmStartData.self.name} of team ${
      rtmStartData.team.name
    } but not yet connected to a channel`
  );
}

function addAuthenticatedHandler(rtm, handler) {
  rtm.on("authenticated", handler);
}

function handleOnMessage(message) {
  const conversationId = message.channel;
  if (message.text.toLowerCase().includes("iris")) {
    nlp.ask(message.text, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        if ((!res.intent || !res.intent[0] || !res.intent[0].value)) {
          throw new Error("Could not extract intent");
        }

        const intent = require("./intents/" + res.intent[0].value + "Intent");

        intent.process(res, (error, response) => {
          if (error) {
            console.log(error.message);
            return;
          }

          return rtm.sendMessage(response, conversationId);
        });
      } catch (err) {
        console.log(err);
        console.log(res);
        rtm.sendMessage("Sorry, I don't understand.", conversationId);
      }

      if (!res.intent) {
        rtm.sendMessage("Sorry, I did not understand.", conversationId);
      } else if (res.intent[0].value === "time" && res.location) {
        rtm.sendMessage(
          `Sorry, I don't yet know the time in ${res.location[0].value}.`,
          conversationId
        );
      } else {
        console.log(res);
        rtm.sendMessage("Sorry, I did not understand.", conversationId);
      }
    });
  }
}

module.exports.init = function slackClient(token, logLevel, nlpClient) {
  rtm = new RTMClient(token, { logLevel: logLevel });
  nlp = nlpClient;
  addAuthenticatedHandler(rtm, handleOnAuthenticated);
  rtm.on("message", handleOnMessage);
  return rtm;
};

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;

// curl \
//  -H 'Authorization: Bearer IAORM2OCPD4FMJ37APODPMGAOIWHTVZY' \
//  'https://api.wit.ai/message?v=20190710&q='

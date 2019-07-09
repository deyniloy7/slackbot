'use strict'

const slackClient = require('../server/slackClient')
const service = require('../server/service');
const http = require('http');


const server = http.createServer(service);

const witToken = "IAORM2OCPD4FMJ37APODPMGAOIWHTVZY"
const witClient = require('../server/witClient')(witToken);


const slackToken = 'xoxp-687512835284-687982181120-690208398806-a9494178aa9fd4cb485f2d689f30656d';
const slackLogLevel = 'verbose';

const rtm = slackClient.init(slackToken, slackLogLevel, witClient);
rtm.start();

slackClient.addAuthenticatedHandler(rtm, () => server.listen(3000) )

server.on('listening', () => {
   console.log(`Iris is listening on ${server.address().port} in ${service.get('env')}`)
})
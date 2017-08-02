const url = require('url');
const http = require('http');
const Botkit = require("botkit");

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const STEVED_HOST = process.env.STEVED_HOST;

const DEPLOY_ENV = [
  'DEPLOY_KEY',
  'RANCHER_URL',
  'RANCHER_ACCESS_KEY',
  'RANCHER_SECRET_KEY',
];
const SLACK_MESSAGE_EVENTS = 'direct_message,direct_mention,mention';

const controller = Botkit.slackbot({
  debug: true,
});

controller.spawn({
  token: SLACK_BOT_TOKEN,
}).startRTM();

controller.hears(/(deploy|rollback) ([a-zA-Z][a-zA-Z0-9-]*)\s*$/, SLACK_MESSAGE_EVENTS, (bot, message) => {
  const command = message.match[1];
  const appName = message.match[2];
  const taskName = `${appName}-${command}`;
  bot.reply(message, `:soon: ${taskName}`);
  const env = DEPLOY_ENV.map(name => ({ [name]: process.env[name] })).reduce((map, pair) => Object.assign(map, pair));
  const req = http.request(Object.assign(url.parse(`http://${STEVED_HOST}/jobs/${taskName}`), {
    method: 'POST'
  }), (res) => {
    res.pipe(process.stdout);
    switch (res.statusCode) {
    case 404:
      bot.reply(message, `:boom: ${taskName} :u7121: :thinking_face:`);
      break;
    }
  });
  const envStr = JSON.stringify(Object.assign(env));
  req.end(envStr);
});

controller.hears(/ping/, SLACK_MESSAGE_EVENTS, (bot, message) => {
  bot.reply(message, 'pong');
});

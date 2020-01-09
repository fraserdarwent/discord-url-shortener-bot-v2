const Discord = require("discord.js");
const fetch = require('node-fetch');
const bot = new Discord.Client();

const TOKEN = process.env['DISCORD_BOT_TOKEN']

if (TOKEN == null) {
  console.error('must set DISCORD_BOT_TOKEN env variable')
  process.exit(0)
}

bot.on('ready', () => {
  console.log('bot is ready')
});

// Message is emitted whenever the bot notices a new message.
bot.on("message", (message) => {
  // Destructure the message parameter so we don't repeat ourselves.
  const { author, channel, content, createdTimestamp } = message;
  // No point dealing with the message if it was sent by a bot!
  if (author.bot) {
    return;
  }

  const matches = content.match(/http(s)?:\/\/\S*/g)

  if (!matches) {
    return;
  }

  const promises = []

  // for each match get the short url and replace it
  matches.forEach((match) => {
    promises.push(fetch(`https://prbn.it/${match}`, { method: 'POST' }).then((response) => {return response.text()}).then((body)=>{console.log(`returning ${body}`);return body}))
  })

  Promise.all(promises)
    .then((replacements) => {
      let response = content;

      let index = 0;
      matches.forEach((match) => {
        response = response.replace(match, replacements[index])
        index++;
      })

      console.log(`sending message: ${response}`)
      channel.send(response)
      message.delete()
    })
});
// This establishes a websocket connection to Discord.
bot.login(TOKEN);
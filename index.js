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

  let links = content.match(/http(s)?:\/\/\S*/g)

  if (!links) {
    return;
  }

  links = links.filter((link) => {
    return 15 < link.length
  })

  links = links.filter((link) => {
    return !link.match(/open.spotify.com/g)
  })

  if (links.length < 1) {
    return;
  }

  const promises = []

  // for each match get the short url and replace it
  links.forEach((link) => {
    promises.push(fetch(`https://prbn.it/${link}`, { method: 'POST' }).then((response) => { return response.text() }).then((body) => { console.log(`returning ${body}`); return body }))
  })

  let response = content;

  Promise.all(promises)
    .then((shortLinks) => {
      let index = 0;
      links.forEach((link) => {
        response = response.replace(link, shortLinks[index])
        index++;
      })
      message.delete()
        .then(() => {
          console.log(`sending message: ${response}`)
          channel.send(`${author}
${response}`)
        })
        .catch((error) => {
          if (error.code != 10008) {
            console.error(error)
          } else {
            console.log('already deleted')
            shortLinks.forEach((shortLink) => {
              fetch(shortLink, {
                method: 'DELETE'
              })
                .then((response) => {
                  console.log(`deleted ${shortLink}`)
                })
                .catch((error) => {
                  console.error(error)
                })
            })
          }
        })
    })
});
// This establishes a websocket connection to Discord.
bot.login(TOKEN);
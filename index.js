const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch');

var port = process.env.PORT || config.get('PORT');

const MOVIE_API = "http://www.omdbapi.com/?apikey=8df4f6a8"

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});


bot.hear(['hi', 'hello', 'hey'], (payload, chat) => {
	chat.say('Hello there!');
});

bot.hear(['hi', 'hello', 'hey'], (payload, chat) => {
  chat.conversation((conversation) => {
    interestInMovies (payload, conversation);
  });
});

function interestInMovies(payload, conversation){
  setTimeout(() => {
    conversation.ask(
      {
        text: "Do you interested in movies?",
        quickReplies:["Yes", "No"],
      },
      (payload, conversation) => {
        if (payload.message.text === "Yes") {
          conversation.say("Me too! What is your favourite movie? Write the name of your favourite movie with param movie into the chat.");
          bot.hear(/movie (.*)/i, (payload, conversation, data) => {
            const movieName = data.match[1];

            fetch( MOVIE_API + '&t=' + movieName).then(res => res.json()).then(json => {
              if (json.Response == "False") {
                conversation.say("Sorry, I could't find the movie. Try it again.")
                conversation.end();
              } else {
                conversation.say("Of course, I know this movie! It was directed by " + json.Director + ".").then(() => {
                    conversation.say("For more info about movie wrote Yes.")
                })
                
                bot.hear("Yes", (payload, conversation) => {
                  conversation.say ("The genre of the film is " +json.Genre+ " and it was released in " +json.Released+ " and is available in these languages: " +json.Language+ ".")
                })
                bot.hear(/plot/i, (payload, conversation) => {
                  conversation.say("The main plot of the " +movieName+ " movie is " +json.Plot+ ".")
                })
                bot.hear(/(actor|actors)/i, (payload,chat) => {
                  conversation.say("A list of the main actors in the movie: " +json.Actors+ ".")
                })
                bot.hear(/(award|awards)/i, (payload,chat) => {
                  conversation.say("This movie " +movieName+ " won these awards: " +json.Awards+ ".")
                })
              }
            })
          })
          bot.hear([/(good)?bye/i, /see (ya|you)/i, 'adios'], (payload, chat) => {
            // Matches: goodbye, bye, see ya, see you, adios
          chat.say('Bye, thanks for coming!');
          conversation.end();
          });
          
        } else {
          conversation.say("Thank for coming. See you soon.")
          conversation.end();
        }
      }
    )
  }, 2000)
}

bot.start(port);






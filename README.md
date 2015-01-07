
[![Build Status](https://travis-ci.org/claudioc/appdate-bot.svg)](https://travis-ci.org/claudioc/appdate-bot)

# Appdate Bot Module

This is the module you need to use when creating a new Appdate bot runner.

To create a new Bot runner module, let's say for the project `foobar`:

- Create a new directory (es: `mkdir appdate-my-project-bot`)
- run `npm init` and answer the questions as follows
  - the name of the bot should be 'appdate-my-project-bot'
  - the version should be 0.0.1
  - enter a brief description ("This is the bot runner for...")
  - the entry point is `index.js`
  - the test command can be left empty
  - git repository can be left empty (the bot will be included as part of the main Appdate project)
  - keywords are `appdate, appdate-bot, foobar`
  - author is... you
  - license should be MIT or BSD
- run `npm install appdate-bot --save`
- run `touch index.js`

Now open up `index.js` with your favourite text editor and start writing your bot runner.

Your module must export just a `run` method which accepts a callback. Once the bot finishes its job, you will call the callback using the conventional nodejs way that is first the error parameter and then the bot object itself.

For example:

```javascript
var bot = require('appdate-bot');

var bot = new Bot({
    group: 'Foobar',
    name: 'Foobar 1.x',
    description: 'The Foobar project, version 1.x',
    website: 'http://www.foobar-project.com/',
    repository: 'https://github.com/foobar/foobar-project'
});

module.exports = {

  run: function (cb) {

    bot.fetch('http://www.foobar-project.com/releases')

        .then(function (response) {

            var $tags = response.$('#container > li');

            bot.set('releaseDate', $tags.find('time').attr('datetime'));
            bot.set('currentVersion', $tags.find('h3 > a > .tag-name').text());
            bot.set('downloadUrl', 'http://code.jquery.com/jquery-%s.js', bot.get('currentVersion'));
            bot.set('downloadPage', 'http://www.foobar-project.com/download/');
            bot.set('releaseNotesUrl', 'http://www.foobar-project.com/changelog/');

            cb(null, bot);
        })

        .catch(function (err) {
            cb(err, bot);
        });
  }
}
```

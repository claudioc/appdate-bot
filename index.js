var Promise = require('bluebird'),
    request = require('request'),
    cheerio = require('cheerio')
    ;

var Response = function (html) {

    this.$ = cheerio.load(html);
}

var Bot = function () {

    this.results = {
        currentVersion: '',
        releaseNotesUrl: '',
        releaseDate: '',
        downloadUrl: '',
        downloadPage: ''
    };
}

Bot.prototype.set = function (key, value) {
    if (!this.results.hasOwnProperty(key)) {
        throw new Error('Appdate bot: unknown result ' + key);
    }
    this.results[key] = value;
}

Bot.prototype.get = function (key) {
    if (!this.results.hasOwnProperty(key)) {
        throw new Error('Appdate bot: unknown result ' + key);
    }
    return this.results[key];
}

Bot.prototype.open = function (url) {

    return new Promise(function (resolve, reject) {

        request(url, function (error, response, body) {

            if (error) {
                return reject(error);
            }

            if (!(/^2/.test('' + response.statusCode))) {
                return reject(response.statusCode);
            }

            resolve(new Response(body));
        });
    });
}

module.exports = {
    Bot: Bot
};


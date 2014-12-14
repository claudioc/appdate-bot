var Promise = require('bluebird'),
    request = require('request'),
    cheerio = require('cheerio'),
    _ = require('lodash')
    ;

var Response = function (html) {

    this.$ = cheerio.load(html);
}

var Bot = function (project) {

    this.runnable = true;

    this.results = {
        currentVersion: '',
        releaseNotesUrl: '',
        releaseDate: '',
        downloadUrl: '',
        downloadPage: ''
    };

    var defProject = {
        group: 'Unknown',
        name: 'Unknown',
        description: '',
        website: '',
        repository: ''
    };

    if (!_.isPlainObject(project)) {
        throw new Error('Appdate bot: bot with empty or wrong project identification');
    }

    Object.keys(project).forEach(function (k) {
        if (!_.has(defProject, k)) {
            throw new Error('Appdate bot: bot with wrong key in project identification');
        }
    });

    this.project = _.defaults(project, defProject);

    console.log(this.project)

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


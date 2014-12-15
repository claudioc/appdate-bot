var Promise = require('bluebird'),
    request = require('request'),
    cheerio = require('cheerio'),
    sprintf = require('util').format,
    _ = require('lodash')
    ;

var Response = function (html) {

    this.$ = cheerio.load(html);
};

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
};

Bot.prototype.set = function (key, value) {

    if (!_.isString(key) || _.isUndefined(value)) {
        throw new Error('Appdate bot: wrong parameter(s) for set');
    }

    if (!this.results.hasOwnProperty(key)) {
        throw new Error('Appdate bot: unknown result key ' + key);
    }

    this.results[key] = sprintf.apply(null, Array.prototype.slice.call(arguments, 1));
};

Bot.prototype.get = function (key) {

    if (!_.isString(key)) {
        throw new Error('Appdate bot: wrong parameter for get');
    }

    if (!this.results.hasOwnProperty(key)) {
        throw new Error('Appdate bot: unknown result key ' + key);
    }

    return this.results[key];
};

Bot.prototype.abort = function (error) {
    process.exit(1);
};

Bot.prototype.end = function () {
    console.log(JSON.stringify(this.results));
    process.exit(0);
};

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
};

module.exports = {
    Bot: Bot
};


var Promise = require('bluebird'),
    request = require('request'),
    cheerio = require('cheerio'),
    semver = require('semver'),
    sprintf = require('util').format,
    _ = require('lodash')
    ;

var Response = function (html) {

    this.$ = cheerio.load(html);
};

var Bot = function (project) {

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

Bot.prototype.fetch = function (url) {

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

var Bot_Github = function(project) {
    Bot.call(this, project);
};

Bot_Github.prototype = _.create(Bot.prototype);

Bot_Github.prototype.fetchTags = function (account, repo, test) {

    var data = [];

    return this.fetch('https://github.com/' + account + '/' + repo + '/releases')

        .then(function (response) {
    
            var $tags = response.$('.release-timeline-tags > li'),
                matches;

            if (test) {
                test = new RegExp(test);
            }

            $tags.each(function (i, el) {

                var $el = response.$(el),
                    version = $el.find('h3 > a > .tag-name').text();

                if (!test || (matches = version.match(test))) {

                    data.push({
                        date: $el.find('time').attr('datetime'),
                        tag: test ? (matches[1] ? matches[1] : matches[0]) : version
                    });
                }
            });

            return Promise.resolve(data);
        });
}

var utils = {

    maxVersion: function (versions, range) {
        return semver.maxSatisfying(versions, range);
    }
};

module.exports = {
    Bot: Bot,
    Bot_Github: Bot_Github,
    utils: utils,
    lodash: _
};

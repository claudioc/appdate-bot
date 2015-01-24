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
        releaseNotesPage: '',
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

    if (this.results[key]) {
        throw new Error('Appdate bot: result key already set ' + key);
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

    if (!/http(s?)\:\/\/(?:www\.)?github\.com/.test(project.repository)) {
        throw new Error('Appdate bot: the project repository url is not from Github (' + project.repository + ')');
    }

    Bot.call(this, project);

    if (project.repository.substr(-1) == '/') {
        project.repository = project.repository.substr(0, project.repository.length - 1);
    }

    var parts = project.repository.split('/');

    if (parts.length !== 5) {
        throw new Error('Appdate bot: the project repository url is not from Github (' + project.repository + ')');
    }

    this.ghRepo = parts[parts.length - 1];
    this.ghAccount = parts[parts.length - 2];
};

Bot_Github.prototype = _.create(Bot.prototype);

Bot_Github.prototype.urlForReleases = function () {
    return sprintf('https://github.com/%s/%s/releases', this.ghAccount, this.ghRepo);
};

Bot_Github.prototype.urlForCommits = function (branch) {
    return sprintf('https://github.com/%s/%s/commits/%s', this.ghAccount, this.ghRepo, branch);
};

Bot_Github.prototype.urlForTag = function (tag) {
    return sprintf('https://github.com/%s/%s/releases/tag/%s', this.ghAccount, this.ghRepo, tag);
};

Bot_Github.prototype.urlForDownload = function (tag) {
    return sprintf('https://github.com/%s/%s/archive/%s.tar.gz', this.ghAccount, this.ghRepo, tag);
};

Bot_Github.prototype.fetchTags = function (test) {

    var data = [];

    return this.fetch(this.urlForReleases())

        .then(function (response) {
    
            var $tags = response.$('.release-timeline-tags > li'),
                matches;

            if (test) {
                test = new RegExp(test);
            }

            $tags.each(function (i, el) {

                var $el = response.$(el),
                    version = $el.find('h3 > a > .tag-name').text();

                // Let's try to be as much semver-ish as possible (I am looking at you, WordPress)
                if ((version.split('.').length) - 1 < 2) {
                    version += '.0';
                }

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
    },

    versionToString: function (version, pattern) {

        var parts = semver.valid(version),
            output = '';

        if (parts) {
            parts = parts.split('.');
            output = pattern.replace('major', parts[0])
                            .replace('minor', parts[1])
                            .replace('patch', parts[2]);
        }

        return output;
    }
};

module.exports = {
    Bot: Bot,
    Bot_Github: Bot_Github,
    utils: utils,
    lodash: _
};

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
    console.error(error);
    process.exit(1);
};

Bot.prototype.end = function () {
    console.log(JSON.stringify(this.results));
    process.exit(0);
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

Bot_Github.prototype.fetchTags = function (account, repo, test) {

    var data = [];

    return this.fetch('https://github.com/' + account + '/' + repo + '/releases')

        .then(function (response) {
    
            var $tags = response.$('.release-timeline-tags > li');
            if (test) {
                test = new RegExp(test);
            }
            $tags.each(function (i, el) {
                var $el = response.$(el),
                    version = $el.find('h3 > a > .tag-name').text();

                if (!test || test.test(version)) {
                    data.push({
                        date: $el.find('time').attr('datetime'),
                        version: version
                    });
                }
            });

            return Promise.resolve(data);
        });
}

extend(Bot, Bot_Github);

module.exports = {
    Bot: Bot,
    Bot_Github: Bot_Github
};

function extend(base, sub) {
  // Avoid instantiating the base class just to setup inheritance
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  // for a polyfill
  // Also, do a recursive merge of two prototypes, so we don't overwrite 
  // the existing prototype, but still maintain the inheritance chain
  // Thanks to @ccnokes
  var origProto = sub.prototype;
  sub.prototype = Object.create(base.prototype);
  for (var key in origProto)  {
     sub.prototype[key] = origProto[key];
  }
  // Remember the constructor property was set wrong, let's fix it
  sub.prototype.constructor = sub;
  // In ECMAScript5+ (all modern browsers), you can make the constructor property
  // non-enumerable if you define it like this instead
  Object.defineProperty(sub.prototype, 'constructor', { 
    enumerable: false, 
    value: sub 
  });
}
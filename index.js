var Promise = require('bluebird'),
    request = require('request'),
    cheerio = require('cheerio')
    ;

var Response = function (html) {

    this.$ = cheerio.load(html);

}

module.exports = {

    open: function (url) {

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
};


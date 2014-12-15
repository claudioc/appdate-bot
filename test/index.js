var Bot = require('../').Bot;

describe('The bot object', function () {

    describe('Constructor', function () {

        it ('should throw without initialization object', function () {
            (function () {
                new Bot();
            }).should.throw(/empty or wrong project/);
        });

        it ('should throw with a wrong initialization object', function () {
            (function () {
                new Bot("zot");
            }).should.throw(/empty or wrong project/);
        });

        it ('should throw with an unknown property', function () {
            (function () {
                new Bot({zot: 23});
            }).should.throw(/wrong key in project/);
        });

        it ('should set the right defaults', function () {
            
            var bot = new Bot({group: 'salazar'});

            bot.project.should.have.property('group', 'salazar');
            bot.project.should.have.property('name', 'Unknown');
            bot.project.should.have.property('description', '');
            bot.project.should.have.property('website', '');
            bot.project.should.have.property('repository', '');
            bot.runnable.should.be.true;
        });

        it ('should set the right project properties', function () {
            
            var bot = new Bot({group: 'salazar', name: 'gargantua', description: 'sottile', website: 'google.com', repository: 'somewhere'});

            bot.project.should.have.property('group', 'salazar');
            bot.project.should.have.property('name', 'gargantua');
            bot.project.should.have.property('description', 'sottile');
            bot.project.should.have.property('website', 'google.com');
            bot.project.should.have.property('repository', 'somewhere');
        });
    });

    describe('set method', function () {

        it ('should throw on wrong parameters', function () {

            var bot = new Bot({group: 'foobar'});

            (function () {
                bot.set();
            }).should.throw(/wrong parameter/);

            (function () {
                bot.set('bazzinga');
            }).should.throw(/wrong parameter/);

            (function () {
                bot.set('bazzinga', 23);
            }).should.throw(/unknown result key/);
        });

        it ('should set a result key', function () {

            var bot = new Bot({group: 'foobar'});

            bot.set('currentVersion', 123);

            bot.results.should.have.property('currentVersion', '123');
        });

        it ('should set a result key with dynamic parameters', function () {

            var bot = new Bot({group: 'foobar'});

            bot.set('downloadUrl', "http://%s/zot", "google.com");

            bot.results.should.have.property('downloadUrl', "http://google.com/zot");
        });
    });

    describe('get method', function () {

        it ('should throw on wrong parameters', function () {

            var bot = new Bot({group: 'foobar'});

            (function () {
                bot.get();
            }).should.throw(/wrong parameter/);

            (function () {
                bot.get('bazzinga');
            }).should.throw(/unknown result key/);
        });

        it ('should get a result key', function () {

            var bot = new Bot({group: 'foobar'});

            bot.set('currentVersion', 123);

            bot.get('currentVersion').should.equal('123');
        });
    });


});
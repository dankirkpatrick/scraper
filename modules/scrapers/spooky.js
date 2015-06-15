/////////////////////////////////////////////////////
//                 Spooky Scraper                  //
/////////////////////////////////////////////////////
var Spooky = require('spooky');
var winston = require('winston');

var config;

module.exports = {
    initialize: function(configuration) {
        config = configuration;
    },
    scrape: function (msg) {
        winston.debug("Scraping with Spooky");
        winston.debug('id: %s', msg.id);
        winston.debug('title: %s', msg.title);
        winston.debug('url: %s', msg.url);

        var spooky = new Spooky({
            child: {
                transport: 'http'
            },
            casper: {
                logLevel: 'debug',
                verbose: true
            }
        }, function (err) {
            if (err) {
                winston.error('Error when scraping:%j', err);
                throw err;
            }
            spooky.start(msg.url);
            spooky.then(function () {
                this.emit('parse', this.evaluate(function () {
                    return document.documentElement.innerHTML;
                }));
            });
            spooky.run();


            spooky.then(function () {
                this.evaluate(function () {
                })
            });

        });

        spooky.on('error', function (e, stack) {
            console.error(e);

            if (stack) {
                winston.error('Error: %j', stack);
            }
        });

        spooky.on('parse', function (document) {
            // Page context
            var dir = config.getBaseDirectory() + msg.title + "/";
            var scrapeTime = new Date();
            var filename = scrapeTime.toString() + '.html';
            config.getDatastore().putDocument(dir, filename, document);
            config.getTransport().updateScrape(msg.id, scrapeTime, dir + filename);
        });

        spooky.on('log', function (log) {
            if (log.space === 'remote') {
                winston.debug(log.message.replace(/ \- .*/, ''));
            }
        });
    }
};
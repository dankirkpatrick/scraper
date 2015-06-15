/////////////////////////////////////////////////////
//                Phantom Scraper                  //
/////////////////////////////////////////////////////
var phantom = require('phantom');
var winston = require('winston');

var config;

module.exports = {
    initialize: function(configuration) {
        config = configuration;
    },
    scrape: function (msg) {
        winston.debug("Scraping with Phantom");
        winston.debug('id: %s', msg.id);
        winston.debug('title: %s', msg.title);
        winston.debug('url: %s', msg.url);

            phantom.create(function (ph) {
                ph.createPage(function (page) {
                page.open(msg.url, function (status) {
                    winston.debug('status: %s', status);
                    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {
                        page.evaluate(function () {
                            return document.documentElement.innerHTML;
                        }, function (document) {
                            var dir = config.getBaseDirectory() + msg.title + "/";
                            var scrapeTime = new Date();
                            var filename = scrapeTime.toString() + '.html';
                            config.getDatastore().putDocument(dir, filename, document);
                            config.getTransport().updateScrape(msg._id, scrapeTime, dir + filename);
                        });
                    });
                });
            });
        });
        winston.debug('finished phantomScrape');
    }
};

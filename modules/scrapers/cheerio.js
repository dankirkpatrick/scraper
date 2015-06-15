/////////////////////////////////////////////////////
//                Cheerio Scraper                  //
/////////////////////////////////////////////////////
var cheerio = require('cheerio');
var request = require('request');
var winston = require('winston');

var config;

module.exports = {
    /**
     * @param {{getBaseDirectory:function()}} configuration
     */
    initialize: function(configuration) {
        config = configuration;
    },
    scrape: function (msg) {
        winston.debug("Scraping with Cheerio");
        winston.debug('id: %s', msg.id);
        winston.debug('title: %s', msg.title);
        winston.debug('url: %s', msg.url);

        request(msg.url, function (error, response, html) {
            if (!error) {
                var $ = cheerio.load(html);
                var dir = config.getBaseDirectory() + msg.title + "/";
                var scrapeTime = new Date();
                var filename = scrapeTime + '.html';
                config.getDatastore().putDocument(dir, filename, $.html());
                config.getTransport().updateScrape(msg.id, scrapeTime, dir + filename);
            } else {
                winston.error('Error retrieving web page: %j', error);
            }
        });
    }
};

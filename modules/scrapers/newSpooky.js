/////////////////////////////////////////////////////
//                 Spooky Scraper                  //
/////////////////////////////////////////////////////
var Spooky = require('spooky');
var winston = require('winston');

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param {{[before]: Array,
     *          [after]: Array}} scraper
     * @param commandList
     * @param commandIndex
     * @param parent
     */
    handleCommand: function(scraper, commandList, commandIndex, parent) {
        if (commandIndex < commandList.length) {
            var commandDesc = commandList(commandIndex);
            var command = config.getCommand(commandDesc.name);
            if (typeof(command) != 'undefined') {
                command.parent = parent;
                if (typeof(command.before) != 'undefined') {
                    scraper.handleCommand(scraper, command.before, 0, command);
                }
                if (commandDesc.name == 'scrape') {
                    if (typeof(scraper.beforeScrape) != 'undefined') {
                        scraper.handleCommand(scraper, scraper.beforeScrape, 0, command);
                    }
                    scraper.scrape(command.args, commandList, commandIndex);
                } else {
                    if (typeof(scraper.beforeParse) != 'undefined') {
                        scraper.handleCommand(scraper, scraper.beforeParse, 0, command);
                    }
                    command.start(commandDesc.args, commandList, commandIndex);
                }
            } else {
                winston.error('Unable to find command: %s', commandDesc.name);
                winston.debug('Skipping command:%s', commandDesc.name);
                commandIndex++;
                if (commandIndex < commandList.length) {
                    scraper.handleCommand(scraper, commandList, commandIndex, parent)
                }
            }
        }
    },
    startScraper: function (scraper) {
        winston.debug('%s: Starting scraper', scraper.name);
        scraper.spooky = new Spooky({
            child: {
                transport: 'http'
            },
            casper: {
                logLevel: 'debug',
                verbose: true
            }
        }, function (err) {
            if (err) {
                winston.error('Error when scraping: %j', err);
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


        phantom.create(function (ph) {
            ph.createPage(function (page) {
                // Build a closure for scraper commands here
                var scraper = context;
                scraper.page = page;

                var commandList = scraper.commands;
                var commandIndex = 0;

                if (typeof(commandList) != 'undefined') {
                    scraper.handleCommand(scraper, commandList, commandIndex, null);
                }
            });
        });

    }
};
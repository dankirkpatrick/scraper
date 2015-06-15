var cheerio = require('cheerio');
var phantom = require('phantom');
var winston = require('winston');

var config;

var vsprintf = require("sprintf-js").vsprintf;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param scraper
     * @param {Object} command
     * @param {Object[]} command.domCommands
     */
    domAction: function(scraper, command) {
        winston.debug('command:%s starting DOM action at index:%d', command.name, command.stateIndex);
        scraper.instance.startCommand(scraper, command.domCommands[command.stateIndex], command);
    },
    doAction: function (scraper, command) {
        command.scrapeTime = new Date();

        if (typeof(command.formatUrl) != 'undefined') {
            var args = [];
            if (command.formatUrlArgs instanceof Array && command.formatUrlArgs.length > 0)
            for (var i = 0; i < command.formatUrlArgs.length; i++) {
                args[i] = scraper.instance.getValue(command, command.formatUrlArgs[i]);
            }
            command.url = vsprintf(command.formatUrl, args);
        }
        winston.debug('command:%s scraping url:%s', command.name, command.url);

        phantom.create(function (ph) {
            ph.createPage(function (page) {
                // Build a closure for scraper commands here
                page.onConsoleMessage = function (msg) {
                    console.log(msg);
                };
                page.open(command.url, function (status) {
                    page.get('url', function (url) {
                        if (command.url == url) {
                            console.log('command:%s scraped url:%s', command.name, url);
                        } else {
                            console.log('command:%s scraped url:%s', command.name, url);
                        }
                    });
                    console.log('command:%s command url:%s scrape status:%s', command.name, command.url, status);
                    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function (err) {
                        page.evaluate(function () {
                            return document.documentElement.innerHTML;
                        }, function (result) {
                            winston.debug('command:%s scraped url:%s completed evaluating JS', command.name, command.url);
                            ph.exit();
                            command.resultMetadata.url = command.url;
                            command.resultMetadata.endTime = new Date();
                            command.html = result;
                            if (command.domCommands instanceof Array && command.domCommands.length > 0) {
                                command.result = cheerio.load(result);
                                command.state = 100;
                                command.stateIndex = 0;
                                winston.debug('command:%s starting DOM action at index:0', command.name);
                                //console.log(command.context + ': command:' + command.name + ' state:' + command.state + ' index:' + command.stateIndex);
                                scraper.instance.startCommand(scraper, command.domCommands[0], command);
                            } else {
                                scraper.instance.continueCommand(scraper, command);
                            }
                        });
                    });
                });
            });
        });
/*
        var page = scraper.page;
        scraper.page.open(command.url, function (err, status) {
            scraper.page.get('url', function(url) {
                if (command.url == url) {
                    console.log(command.context + ': command:' + command.name + ': scraped url:' + url);
                } else {
                    console.log(command.context + ': command:' + command.name + ': scraped url:' + url);
                }
            });
            console.log(command.context + ': command:' + command.name + ': command url:' + command.url + ' scrape status:' + status);
            scraper.page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function (err) {
                scraper.page.evaluate(function () {
                    //return $.html();
                    return document.documentElement.innerHTML;
                }, function(result) {
                    console.log(command.context + ': command:' + command.name + ' scraped url:' + command.url + ' completed evaluating JS');
                    command.html = result;
                    if (command.domCommands instanceof Array && command.domCommands.length > 0) {
                        command.result = cheerio.load(result);
                        command.state = 100;
                        command.stateIndex = 0;
                        console.log(command.context + ': starting DOM action at index:0');
                        //console.log(command.context + ': command:' + command.name + ' state:' + command.state + ' index:' + command.stateIndex);
                        scraper.instance.startCommand(scraper, command.domCommands[0], command);
                    } else {
                        scraper.instance.continueCommand(scraper, command);
                    }
                });
            });
        });
*/
    }
};
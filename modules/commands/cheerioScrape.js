var request = require('request');
var cheerio = require('cheerio');
var winston = require('winston');
var vsprintf = require("sprintf-js").vsprintf;

var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param scraper
     * @param {{
     *           context         : string,
     *           name            : string,
     *           scrapeTime      : Date,
     *           result          : Object,
     *           html            : string,
     *           state           : number,
     *           stateIndex      : number,
     *           [formatUrl]     : string,
     *           [formatUrlArgs] : string
     *           [url]           : string
     *        }} command
     */
    doAction: function(scraper, command) {
        command.scrapeTime = new Date();

        if (command.formatUrl) {
            var args = [];
            for (var i = 0; i < command.formatUrlArgs.length; i++) {
                args[i] = scraper.instance.getValue(command, command.formatUrlArgs[i]);
            }
            command.url = vsprintf(command.formatUrl, args);
        }

        winston.debug('command:%s scraping url:%s', command.name, command.url);
        request(command.url, function (error, response, html) {
            winston.debug('command:%s: scraper error:%s', command.name, error);
            command.resultMetadata.endTime = new Date();
            command.resultMetadata.url = command.url;
            if (!error) {
                winston.debug('command:%s scraped url:%s but did not evaluate JS (cheerio)', command.name, command.url);
                if (command.domCommands instanceof Array && command.domCommands.length > 0) {
                    command.result = cheerio.load(html);
                    command.html = html;
                    command.state = 100;
                    command.stateIndex = 0;
                    //console.log(command.context + ': command:' + command.name + '  state:' + command.state + '  index:' + command.stateIndex);
                    winston.debug('command:%s starting DOM command at index:0', command.name);
                    scraper.instance.startCommand(scraper, command.domCommands[0], command);
                } else {
                    command.result = html;
                    scraper.instance.continueCommand(scraper, command);
                }
            } else {
                winston.error('Error: %j', error);
                scraper.instance.continueCommand(scraper, command);
            }
        });
    },
    domAction: function(scraper, command) {
        winston.debug('command:%s starting DOM command at index:%d', command.name, command.stateIndex);
        scraper.instance.startCommand(scraper, command.domCommands[command.stateIndex], command);
    }
};
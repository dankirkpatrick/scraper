var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        var scrapeCommand;
        if (typeof(command.type) != 'undefined') {
            scrapeCommand = config.getScrapeCommand(command.type);
        } else {
            scrapeCommand = config.getScrapeCommand(scraper.type);
        }
        scrapeCommand.doAction(scraper, command);
    },
    domAction: function(scraper, command) {
        var scrapeCommand;
        if (typeof(command.type) != 'undefined') {
            scrapeCommand = config.getScrapeCommand(command.type);
        } else {
            scrapeCommand = config.getScrapeCommand(scraper.type);
        }
        scrapeCommand.domAction(scraper, command);
    }
};
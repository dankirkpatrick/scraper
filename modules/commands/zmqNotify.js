var config;

// TODO: Implement me!
module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        command.resultMetadata.endTime = new Date();
        scraper.instance.continueCommand(scraper, command);
    }
};
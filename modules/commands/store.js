var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        var storeCommand = config.getStoreCommand(command.store);
        storeCommand.doAction(scraper, command);
    }
};
var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        var loadCommand = config.getLoadCommand(command.loader);
        loadCommand.doAction(scraper, command);
    }
};
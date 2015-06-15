var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    doAction: function (scraper, command) {
        var notifyCommand = config.getNotifyCommand(command.notify);
        if (typeof(notifyCommand) == 'undefined') {
            command.resultMetadata.endTime = new Date();
            scraper.continueCommand(scraper, command);
        } else {
            notifyCommand.doAction(scraper, command);
        }
    }
};
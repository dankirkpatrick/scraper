var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param scraper
     * @param {Object} command
     * @param {string} command.parser
     */
    doAction: function (scraper, command) {
        var parser = config.getParserCommand(command.parser);
        parser.doAction(scraper, command);
    }
};
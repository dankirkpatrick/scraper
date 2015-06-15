var winston = require('winston');
var config;

module.exports = {
    initialize: function (configuration) {
        config = configuration;
    },
    /**
     * @param {{nextScrapeDate: Date}} scraper
     * @param {{shortTime: number,
     *          longTime: number,
     *          result: Object,
     *          resultMetadata: Object}} command
     */
    doAction: function (scraper, command) {
        var nextScrapeDate;
        var now = new Date();
        if (typeof(scraper.nextScrapeDate) != 'undefined') {
            nextScrapeDate = scraper.nextScrapeDate;
        } else {
            nextScrapeDate = now;
        }

        var deltaMillis = nextScrapeDate.getTime() - now.getTime();
        var delayMillis = (Math.random() * (command.longTime - command.shortTime)) + command.shortTime;
        winston.debug('  wait time for this command: %dms', (deltaMillis < 0? 0 : deltaMillis));
        winston.debug('  next command delay: %dms', delayMillis);

        command.result = command.parent.result;
        if (deltaMillis > 0) {
            nextScrapeDate.setTime(nextScrapeDate.getTime() + delayMillis);
            scraper.nextScrapeDate = nextScrapeDate;
            winston.debug('  continuing throttle at: %s', nextScrapeDate.toString());
            setTimeout(function() {
                command.resultMetadata.endTime = nextScrapeDate;
                scraper.instance.continueCommand(scraper, command);
            }, deltaMillis);
        } else {
            nextScrapeDate.setTime(now.getTime() + delayMillis);
            scraper.nextScrapeDate = nextScrapeDate;
            winston.debug('  no throttle; running at: %s', now.toString());
            command.resultMetadata.endTime = now;
            scraper.instance.continueCommand(scraper, command);
        }
    }
};
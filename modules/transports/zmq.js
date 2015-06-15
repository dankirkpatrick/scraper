/////////////////////////////////////////////////////
//       ZMQ Communication with GUI Server         //
/////////////////////////////////////////////////////
var zmq = require('zmq');
var winston = require('winston');

var guiServerHost = '127.0.0.1';
var guiServerZmqPullPort = 3010;
var guiServerZmqPushPort = 3011;

// Initialize ZMQ communication with GUI server
var pullSocket = zmq.socket('pull');
pullSocket.connect('tcp://' + guiServerHost + ':' + guiServerZmqPullPort);
winston.debug('Worker connected to port %s', guiServerZmqPullPort);

var pushSocket = zmq.socket('push');
pushSocket.connect('tcp://' + guiServerHost + ':' + guiServerZmqPushPort);
winston.debug('Producer bound to port %s', guiServerZmqPushPort);

// Setup ZMQ scraper server
pullSocket.on('message', function(msg) {
    var parsed = JSON.parse(msg.toString());

    if (parsed instanceof Object && typeof(parsed.scraper) != 'undefined') {
        winston.debug('scraper: %s', parsed.scraper);
        if (parsed.scraper === 'phantom') {
            phantomScrape(parsed);
        } else if (parsed.scraper === 'spooky') {
            spookyScrape(parsed);
        } else if (parsed.scraper === 'cheerio') {
            cheerioScrape(parsed);
        } else {
            defaultScrape(parsed);
        }
    }
});

module.exports = {
    updateScrape: function(id, timestamp, location) {
        var retMsg = {"id":id, scrape: {"dateTime":new Date(), "location":location}};
        pushSocket.send(JSON.stringify(retMsg));
    }
};
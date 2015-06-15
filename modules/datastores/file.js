/////////////////////////////////////////////////////
//                   File I/O                      //
/////////////////////////////////////////////////////
// Library for reading/writing data to disk locally
var winston = require('winston');
var fs = require('fs');

var config;

module.exports = {
    initialize: function(configuration) {
        config = configuration;
    },
    /**
     * @param dir
     * @param filename
     * @returns {*}
     */
    getDocument: function(dir, filename) {
        var location = dir + filename;
        return fs.readFileSync(location, 'utf8');
    },
    putDocument: function (dir, filename, document) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var location = dir + filename;
        fs.writeFile(location, document, function (err) {
            if (err) {
                winston.error('Error writing file: %j', err);
                throw err;
            }
            winston.debug('File written: %s', location);
        });
    }
};

/////////////////////////////////////////////////////
//                Phantom Scraper                  //
/////////////////////////////////////////////////////
var winston = require('winston');
var config;

function lookupProperty(obj, propName) {
    function fieldLookup(obj,i) {
        return obj[i];
    }
    return propName.split('.').reduce(fieldLookup, obj);
}
/*
function setProperty(obj, propName, value) {
    if (typeof propName == 'string')
        return index(obj, propName.split('.'), value);
    else if (propName.length==1 && value!==undefined)
        return obj[propName[0]] = value;
    else if (propName.length==0)
        return obj;
    else
        return index(obj[propName[0]], propName.slice(1), value);
}
*/
function advanceCommandState(scraper, command) {
    command.stateIndex++;
    switch (command.state) {
        case 0:  // Before commands
            if (command.stateIndex >= command.before.length) {
                if (scraper.before[command.name] instanceof Array && scraper.before[command.name].length > 0) {
                    command.state = 1;
                    command.stateIndex = 0;
                } else {
                    command.state = 2;
                }
            }
            break;
        case 1: // Scraper before commands
            if (command.stateIndex >= scraper.before[command.name].length) {
                command.state = 2;
            }
            break;
        case 2: // The command itself
            command.stateIndex = 0;
            if (scraper.after[command.name] instanceof Array && scraper.after[command.name].length > 0) {
                command.state = 3;
            } else if (command.after instanceof Array && command.after.length > 0) {
                command.state = 4;
            } else {
                command.state = 5;
            }
            break;
        case 3: // Scraper after commands
            if (command.stateIndex >= scraper.after[command.name].length) {
                command.stateIndex = 0;
                if (command.after instanceof Array && command.after.length > 0) {
                    command.state = 4;
                } else {
                    command.state = 5;
                }
            }
            break;
        case 4: // After commands
            if (command.stateIndex >= command.after.length) {
                command.stateIndex = 0;
                command.state = 5;
            }
            break;
        case 100: // Scrape DOM commands
            if (command.stateIndex >= command.domCommands.length) {
                command.stateIndex = 0;
                command.result = command.html;
                if (scraper.after[command.name] instanceof Array && scraper.after[command.name].length > 0) {
                    command.state = 3;
                } else if (command.after instanceof Array && command.after.length > 0) {
                    command.state = 4;
                } else {
                    command.state = 5;
                }
            }
            break;
        case 200: // For Each commands
            if (command.stateIndex >= command.endIndex) {
                if (typeof(command.parent) != 'undefined') {
                    command.result = command.parent.result;
                } else {
                    command.result = command.forEach;
                }
                command.stateIndex = 0;

                command.state = 5;
            }
            break;
    }
    if (command.state == 5) {
        winston.debug('command:%s finished command', command.name);
    } else {
        //console.log(command.context + ': command:' + command.name + ' state:' + command.state + ' index:' + command.stateIndex);
    }
}

module.exports = {
    initialize: function(configuration) {
        config = configuration;
    },
    getValue: function(command, propValue) {
        if (propValue.charAt(0) == '^') {
            if (propValue.length > 1) {
                if (propValue.charAt(1) == '.') {
                    propValue = propValue.slice(2);
                    return this.getValue(command.parent, propValue);
                } else {
                    // error condition
                }
            } else {
                return command.parent.result;
            }
        }
        return lookupProperty(command, 'result.' + propValue);
    },
    startCommand: function(scraper, command, parent) {
        winston.debug('.starting command:%s', command.name);
        command.parent = parent;
        /*
        if (typeof(command.contextValue) == 'undefined') {
            if (typeof(command.parent) == 'undefined') {
                command.context = '';
            } else {
                command.context = command.parent.context;
            }
        } else {
            var thisContextValue = command.contextValue;
            if (command.contextValue[0] == '^') {
                thisContextValue = scraper.instance.getValue(command, command.contextValue);
            }
            if (typeof(command.parent) == 'undefined' || command.parent.context == '') {
                command.context = thisContextValue;
            } else {
                command.context = command.parent.context + '.' + thisContextValue;
            }
        }
        */
        command.instance = config.getCommand(command.name);
        command.stateIndex = 0;
        if (command.before instanceof Array && command.before.length > 0) {
            command.state = 0;
            winston.debug('command:%s starting Command before command at index:0', command.name);
            startCommand(scraper, command.before[0], command);
        } else if (scraper.before instanceof Object && scraper.before[command.name] instanceof Array && scraper.before[command.name].length > 0) {
            command.state = 1;
            winston.debug('command:%s starting Scraper before command at index:0', command.name + '');
            scraper.instance.startCommand(scraper, scraper.before[command.name][0], command);
        } else {
            command.state = 2;
            winston.debug('command:%s starting command action', command.name);
            command.instance.doAction(scraper, command);
        }
    },
    continueCommand: function(scraper, command) {
        winston.debug('command:%s continuing command', command.name);
        advanceCommandState(scraper, command);
        switch (command.state) {
            case 0:
                winston.debug('command:%s starting Command before command at index:%d', command.name, command.stateIndex);
                this.startCommand(scraper, command.before[command.stateIndex], command);
                break;
            case 1:
                winston.debug('command:%s starting Scraper before command at index:%d', command.name, command.stateIndex);
                this.startCommand(scraper, scraper.before[command.name][command.stateIndex], command);
                break;
            case 2:
                winston.debug('command:%s starting command action', command.name);
                command.instance.doAction(scraper, command);
                break;
            case 3:
                winston.debug('command:%s starting Scraper after command at index:%d', command.name, command.stateIndex);
                this.startCommand(scraper, scraper.after[command.name][command.stateIndex], command);
                break;
            case 4:
                winston.debug('command:%s starting Command after command at index:%d', command.name, command.stateIndex);
                this.startCommand(scraper, command.after[command.stateIndex], command);
                break;
            case 5:
                winston.debug('command:%s finished completely', command.name);
                if (typeof(command.parent) != 'undefined') {
                    scraper.instance.continueCommand(scraper, command.parent);
                }
                break;
            case 100:
                command.instance.domAction(scraper, command);
                break;
            case 200:
                command.instance.forEachAction(scraper, command);
                break;
        }
    },
    startScraper: function (scraper) {
        winston.debug('%s: Starting scraper', scraper.name);
        scraper.instance = this;
        for (var i = 0; i < scraper.commands.length; i++) {
            var command = scraper.commands[i];
            scraper.instance.startCommand(scraper, command);
        }
        /*
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                // Build a closure for scraper commands here
                scraper.page = page;
                page.onConsoleMessage = function(msg) {
                    console.log(msg);
                };

                for (i = 0; i < scraper.commands.length; i++) {
                    var command = scraper.commands[i];
                    command.context = scraper.name;
                    scraper.instance.startCommand(scraper, command);
                }
            });
        });
*/
    }
};

/////////////////////////////////////////////////////
//                Cheerio Scraper                  //
/////////////////////////////////////////////////////
var config;
var winston = require('winston');
var vsprintf = require("sprintf-js").vsprintf;

var STATE_BEFORE_COMMAND = 0;
var STATE_DURING_COMMAND = 1;
var STATE_AFTER_COMMAND = 2;
var STATE_FINISH_COMMAND = 3;

function lookupProperty(obj, propName) {
    function fieldLookup(obj,i) {
        return obj[i];
    }
    return propName.split('.').reduce(fieldLookup, obj);
}

function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor();

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}

function setupScraperCommands(scraper, command) {
    if (command == null) {
        if (typeof(scraper.before) != 'undefined' || typeof(scraper.after) != 'undefined') {
            for (var i = 0; i < scraper.commands.length; i++) {
                setupScraperCommands(scraper, scraper.commands[i]);
            }
        }
    } else {
        if (command.before instanceof Array) {
            for (i = 0; i < command.before.length; i++) {
                setupScraperCommands(scraper, command.before[i]);
            }
        }
        if (command.domCommands instanceof Array) {
            for (i = 0; i < command.domCommands.length; i++) {
                setupScraperCommands(scraper, command.domCommands[i]);
            }
        }
        if (command.after instanceof Array) {
            for (i = 0; i < command.after.length; i++) {
                setupScraperCommands(scraper, command.after[i]);
            }
        }
        if (scraper.before instanceof Object && typeof(scraper.before) != 'undefined' && typeof(scraper.before[command.name]) != 'undefined') {
            if (typeof(command.before) == 'undefined') {
                command.before = clone(scraper.before[command.name]);
            } else {
                command.before = command.before.concat(clone(scraper.before[command.name]));
            }
        }
        if (scraper.after instanceof Object && typeof(scraper.after) != 'undefined' && typeof(scraper.after[command.name]) != 'undefined') {
            if (typeof(command.after) == 'undefined') {
                command.after = clone(scraper.after[command.name]);
            } else {
                command.after = clone(scraper.after[command.name]).concat(command.after);
            }
        }
    }
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
        case STATE_BEFORE_COMMAND:  // Before commands
            if (command.stateIndex >= command.before.length) {
                command.state = STATE_DURING_COMMAND;
            }
            break;
        case STATE_DURING_COMMAND: // The command itself
            command.stateIndex = 0;
            if (command.after instanceof Array && command.after.length > 0) {
                command.state = STATE_AFTER_COMMAND;
            } else {
                command.state = STATE_FINISH_COMMAND;
            }
            break;
        case 2: // After commands
            if (command.stateIndex >= command.after.length) {
                command.stateIndex = 0;
                command.state = STATE_FINISH_COMMAND;
            }
            break;
        case 100: // Scrape DOM commands
            if (command.stateIndex >= command.domCommands.length) {
                command.stateIndex = 0;
                command.result = command.html;
                if (command.after instanceof Array && command.after.length > 0) {
                    command.state = STATE_AFTER_COMMAND;
                } else {
                    command.state = STATE_FINISH_COMMAND;
                }
            }
            break;
        case 200:
            if (command.stateIndex >= command.endIndex) {
                if (typeof(command.parent) != 'undefined') {
                    command.result = command.parent.result;
                } else {
                    command.result = command.forEach;
                }
                command.stateIndex = 0;

                command.state = STATE_FINISH_COMMAND;
            }
            break;
    }
    if (command.state == STATE_FINISH_COMMAND) {
        winston.debug('command:%s finished command', command.name);
    } else {
        winston.debug('command:%s state:%s index:%d', command.name, command.state, command.stateIndex);
    }
}

module.exports = {
    initialize: function (configuration) {
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
        winston.debug('%s: starting command:%s', (parent? parent.context : ''), command.name);
        command.parent = parent;
        if (typeof(command.resultKeyInput) != 'undefined') {
            command.resultKey = this.getValue(command, command.resultKeyInput);
            if (typeof(command.resultKeyRegex) != 'undefined' && typeof(command.resultKeyFormat) != 'undefined') {
                var re = new RegExp(command.resultKeyRegex);
                var results = re.exec(command.resultKey);
                command.resultKey = vsprintf(command.resultKeyFormat, results);

            }
        }
        command.resultMetadata = {};
        /*
        if (typeof(command.contextValue) == 'undefined' || command.contextValue.length == 0) {
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
            command.state = STATE_BEFORE_COMMAND;
            winston.debug('command:%s starting Command before command at index:0', command.name);
            scraper.instance.startCommand(scraper, command.before[0], command);
        } else {
            command.state = STATE_DURING_COMMAND;
            command.resultMetadata.startTime = new Date();
            winston.debug('command:%s starting command action', command.name);
            command.instance.doAction(scraper, command);
        }
    },
    continueCommand: function(scraper, command) {
        winston.debug('command:%s continuing command', command.name);
        advanceCommandState(scraper, command);
        switch (command.state) {
            case STATE_BEFORE_COMMAND:
                winston.debug('command:%s starting Command before command at index:%d', command.name, command.stateIndex);
                this.startCommand(scraper, command.before[command.stateIndex], command);
                break;
            case STATE_DURING_COMMAND:
                winston.debug('command:%s starting command action', command.name);
                command.resultMetadata.startTime = new Date();
                command.instance.doAction(scraper, command);
                break;
            case STATE_AFTER_COMMAND:
                winston.debug('command:%s starting Command after command at index:%d', command.name, command.stateIndex);
                this.startCommand(scraper, command.after[command.stateIndex], command);
                break;
            case STATE_FINISH_COMMAND:
                winston.debug('command:%s finished command', command.name);
                if (typeof command.parent != 'undefined') {
                    scraper.instance.continueCommand(scraper, command.parent);
                } else {
                    // TODO: skip this if the command is a Scraper-before-command or Scraper-after-command
                    --scraper.commandCount;
                    if (scraper.commandCount <= 0) {
                        winston.info('%s: FINISHED scraper', scraper.name);
                    }
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
        setupScraperCommands(scraper, null);
        scraper.commandCount = scraper.commands.length;
        for (var i = 0; i < scraper.commands.length; i++) {
            var command = scraper.commands[i];
            scraper.instance.startCommand(scraper, command);
        }
    }
};
var datastore = require('./datastores/file.js');
var transport = require('./transports/http.js'); // Default transport

var newCheerioScraper = require('./scrapers/newCheerio.js');
var newPhantomScraper = require('./scrapers/newPhantom.js');

var cheerioScrape = require('./commands/cheerioScrape.js');
var fileScrape = require('./commands/fileScrape.js');
var phantomScrape = require('./commands/phantomScrape.js');

var s_p500ComponentsParser = require('./commands/s_p500ComponentsParser.js');
var s_p500ChangesParser = require('./commands/s_p500ChangesParser.js');
var financialsParser = require('./commands/financialsParser.js');

var ddpNotifyCommand = require('./commands/ddpNotify.js');
var httpNotifyCommand = require('./commands/httpNotify.js');
var zmqNotifyCommand = require('./commands/zmqNotify.js');

var ddpStoreCommand = require('./commands/ddpStore.js');
var fileStoreCommand = require('./commands/fileStore.js');
var httpStoreCommand = require('./commands/httpStore.js');
var zmqStoreCommand = require('./commands/zmqStore.js');

var fileLoadCommand = require('./commands/fileLoad.js');
var scanDirCommand = require('./commands/scanDir.js');

var forEachCommand = require('./commands/forEach.js');
var throttleCommand = require('./commands/throttle.js');

var notifyCommand = require('./commands/notify.js');
var parseCommand = require('./commands/parse.js');
var scrapeCommand = require('./commands/scrape.js');
var storeCommand = require('./commands/store.js');
var loadCommand = require('./commands/load.js');

/*
var cheerioScraper = require('./scrapers/cheerio.js');
var phantomScraper = require('./scrapers/phantom.js');
var spookyScraper = require('./scrapers/spooky.js');

var s_p500Parser = require('./parsers/s_p500.js');

var baseDirectory = "/Users/dan/Documents/scraped/";
*/

var scrapers = {
    'cheerio': newCheerioScraper,
    'phantom': newPhantomScraper
};

var scrapeCommands = {
    'cheerio': cheerioScrape,
    'phantom': phantomScrape,
    'file': fileScrape
};

/*
var scrapers =
    {
        'cheerio': cheerioScraper,
        'phantom': phantomScraper,
        'spooky' : spookyScraper
    };
*/
var parserCommands = {
    's_p500.components': s_p500ComponentsParser,
    's_p500.changes': s_p500ChangesParser,
    'company.financials': financialsParser
};

var storeCommands = {
    'ddpStore': ddpStoreCommand,
    'fileStore': fileStoreCommand,
    'httpStore': httpStoreCommand,
    'zmqStore': zmqStoreCommand
};

var loadCommands = {
    'fileLoad': fileLoadCommand
};

var notifyCommands = {
    'ddpNotify': ddpNotifyCommand,
    'httpNotify': httpNotifyCommand,
    'zmqNotify': zmqNotifyCommand
};

var commands = {
    'forEach': forEachCommand,
    'throttle': throttleCommand,
    'scrape': scrapeCommand,
    'parse': parseCommand,
    'store': storeCommand,
    'load': loadCommand,
    'notify': notifyCommand,
    'scanDir': scanDirCommand
    //'fileStore': fileStoreCommand,
    //'httpNotify': httpNotifyCommand
};

/*
var parsers =
    {
        'S_P 500': { parser: s_p500Parser, tables: ['components', 'changes'] }
    };

var s_p500command = scraper.getScraper('uniqID', 'phantom', 'S&P 500', 's_p500');
*/
/*
s_p500remote =
    {
        config: {
            id: 'uniqId',
            name: 'S&P 500',
            type: 'phantom',
            storeCommands: [
                { commandName: 'fileStore', args:['s_p500', '/Users/dan/Documents/scraper/data'] }
            ],
            notifyCommands: [
                { commandName: 'httpNotify', args:['http://localhost:3000/notify/'] }
            ],
            scrapeCommands: [
                { commandName: 'store', args:[] },
                { commandName: 'notify', args:[] }
            ],
            parseCommands: [
                { commandName: 'json', args:[], commands: [
                    { commandName: 'store', args:[] }
                ] },
                { commandName: 'notify', args:[] }
            ]
        },
        commands: [
            { commandName: 'scrape', args:['s_p500', 'http://en.wikipedia.org/wiki/List_of_S%26P_500_companies', null], commands: [
                { commandName: 'parse', args:['components'] },
                { commandName: 'parse', args:['changes'] }
            ] },
            { commandName: 'forEach', args:['components', 'company', 'ticker'], commands: [
                { commandName: 'scrape', args:['companyName', 'https://www.google.com/finance?q=%s\%3A%s&fstype=ii', ['market', 'ticker']], commands: [
                    { commandName: 'parse', args:['annualIncomeStatement'] },
                    { commandName: 'parse', args:['quarterlyIncomeStatement'] },
                    { commandName: 'parse', args:['annualBalanceSheet'] },
                    { commandName: 'parse', args:['quarterlyBalanceSheet'] },
                    { commandName: 'parse', args:['annualCashFlow'] },
                    { commandName: 'parse', args:['quarterlyCashFlow'] }
                ] }
            ]}
        ],
        parsers: {
            components: {
                tableName: 'components',
                headers: {
                    match: [
                        { selector: '.wikitable' },
                        { eq: 0 },
                        { find: 'thead th' }
                    ],
                    defaultValueCommands: [
                        { commandName: 'elementText' }
                    ]
                },
                data: {
                    rowMatch: [
                        { selector: '.wikitable' },
                        { eq: 0 },
                        { find: 'tbody tr' }
                    ],
                    dataMatch: [
                        { selector: 'td' }
                    ],
                    columnValueCommands: {
                        0: [ // 'Ticker symbol'
                            { commandName: 'elementText', commands: [
                                { commandName: 'insertColumn', config: { columnName: 'Quote link', valueCommands: [
                                    { commandName: 'elementHtml' },
                                    { commandName: 'regex', config: {match:'href="(.*)"', index:1} }
                                ]} },
                                { commandName: 'insertColumn', config: { columnName: 'Market', valueCommands: [
                                    { commandName: 'elementHtml' },
                                    { commandName: 'regex', config: {match:'href="https?:\/\/www\.([a-z]*)\.', index:1} }
                                ]} }
                            ] }
                        ],
                        2: [ // 'SEC filings'
                            { commandName: 'elementHtml' }
                        ]
                    },
                    defaultValueCommands: [
                        { commandName: 'elementText' },
                        { commandName: 'regex', config: {match:'href="(.*)"', index:1} }
                    ]
                }
            },
            changes: {
                tableName: 'changes',
                headers: {
                    match: [
                        { selector: '.wikitable' },
                        { eq: 1 },
                        { find: 'thead tr' },
                        { eq: 1 },
                        { selector: 'td'}
                    ],
                    columnValueCommands: {
                        1: [
                            { commandName: 'elementText' },
                            { commandName: 'appendTo', config: { value: 'Added '}}
                        ],
                        2: [
                            { commandName: 'elementText' },
                            { commandName: 'appendTo', config: { value: 'Added '}}
                        ],
                        3: [
                            { commandName: 'elementText' },
                            { commandName: 'appendTo', config: { value: 'Removed '}}
                        ],
                        4: [
                            { commandName: 'elementText' },
                            { commandName: 'appendTo', config: { value: 'Removed '}}
                        ]
                    },
                    defaultValueCommands: [
                        { commandName: 'elementText' }
                    ]
                },
                data: {
                    startRow: 2,
                    rowMatch: [
                        { selector: '.wikitable' },
                        { eq: 1 },
                    ],
                    dataMatch: [
                        { selector: 'td' }
                    ],
                    defaultValueCommands: [
                        { commandName: 'elementText' }
                    ]
                }
            },
            annualIncomeStatement: {
                tableName: 'annualIncomeStatement',
                headers: '',
                data: ''
            },
            quarterlyIncomeStatement: {

            },
            annualBalanceSheet: {

            },
            quarterlyBalanceSheet: {

            },
            annualCashFlow: {

            },
            quarterlyCashFlow: {

            }
        }
    };
*/

/*
s_p500command
    // scrape(URL, pageName)
    .scrape('http://en.wikipedia.org/wiki/List_of_S%26P_500_companies', 's_p500')
    // store(type, filter, -location-)
    .store('file', 'none', sprintf('s_p500.raw.%s.html', s_p500command.id())) // <pageName>.raw.<id>.html
    // notify(type, -location-)
    .notify('http', sprintf('http://localhost:3000/scrape/s_p500/%s', s_p500command.id())) // <URL>/scrape/<pageName>/<id>
    // parse(type, tableName, function(results)
    .parse('s_p500.components', 'components', function(results) { // <pageName>.<tableName>
        results
            // store(type, filter, -location-)
            .store('file', 'json', sprintf('s_p500.components.%s.json', s_p500command.id())) // <pageName>.<tableName>.<id>.json
            // notify(type, -location-)
            .notify('http', sprintf('http://localhost:3000/parse/s_p500/components/%s', s_p500command.id())) // <URL>/parse/<pageName>/<tableName>/<id>
    })
    // parse(type, tableName, function(results)
    .parse('s_p500.changes', 'changes', function(results) { // <pageName>.<tableName>
        results
            // store(type, filter, -location-)
            .store('file', 'json', sprintf('s_p500.changes.%s.json', s_p500command.id())) // <pageName>.<tableName>.<id>.json
            // notify(type, -location-)
            .notify('http', sprintf('http://localhost:3000/parse/s_p500/changes/%s', s_p500command.id())) // <URL>/parse/<pageName/<tableName>/<id>

    })
    // forEach(tableName, itemName, function(item)
    .forEach('s_p500.components', 'company', function(company) {
        company
            // scrape(URL, dataName)
            .scrape(sprintf('https://www.google.com/finance?q=%s\%3A%s&fstype=ii', company.market(), company.ticker()), company.ticker())
            // store(type, filter, -location-)
            .store('file', 'none', sprintf('company.%s.raw.%s.html', company.ticker(), s_p500command.id()))
            // notify(type, -location-)
            .notify('http', sprintf('http://localhost:3000/scrape/s_p500/%s/%s', company.ticker(), s_p500command.id()))
            // parse(type, tableName, function(results)
            .parse('company.annualIncomeStatement', sprintf('company.annualIncomeStatement.%s', company.ticker()), function(financials) {
                financials
                    // store(type, filter, location)
                    .store('file', 'json', sprintf('company.annualIncomeStatement.%s.%s.json', company.ticker(), s_p500command.id()))
                    // notify(type, location)
                    .notify('http', sprintf('http://localhost:3000/parse/company/annualIncomeStatement/%s/%s', company.ticker(), s_p500command.id()))
            })
            // parse(type, tableName, function(results)
            .parse('company.quarterlyIncomeStatement', sprintf('company.quarterlyIncomeStatement.%s', company.ticker()), function(financials) {
                financials
                    // store(type, filter, location)
                    .store('file', 'json', sprintf('company.quarterlyIncomeStatement.%s.%s.json', company.ticker(), s_p500command.id()))
                    // notify(type, location)
                    .notify('http', sprintf('http://localhost:3000/parse/company/quarterlyIncomeStatement/%s/%s', company.ticker(), s_p500command.id()))
            })
            // parse(type, tableName, function(results)
            .parse('company.annualCashFlow', sprintf('company.annualCashFlow.%s', company.ticker()), function(financials) {
                financials
                    // store(type, filter, location)
                    .store('file', 'json', sprintf('company.annualCashFlow.%s.%s.json', company.ticker(), s_p500command.id()))
                    // notify(type, location)
                    .notify('http', sprintf('http://localhost:3000/parse/company/annualCashFlow/%s/%s', company.ticker(), s_p500command.id()))
            })
            // parse(type, tableName, function(results)
            .parse('company.quarterlyCashFlow', sprintf('company.quarterlyCashFlow.%s', company.ticker()), function(financials) {
                financials
                    // store(type, filter, location)
                    .store('file', 'json', sprintf('company.quarterlyCashFlow.%s.%s.json', company.ticker(), s_p500command.id()))
                    // notify(type, location)
                    .notify('http', sprintf('http://localhost:3000/parse/company/quarterlyCashFlow/%s/%s', company.ticker(), s_p500command.id()))
            })
            // parse(type, tableName, function(results)
            .parse('company.annualBalanceSheet', sprintf('company.annualBalanceSheet.%s', company.ticker()), function(financials) {
                financials
                    // store(type, filter, location)
                    .store('file', 'json', sprintf('annualBalanceSheet.%s.%s.json', company.ticker(), s_p500command.id()))
                    // notify(type, location)
                    .notify('http', sprintf('http://localhost:3000/parse/company/annualBalanceSheet/%s/%s', company.ticker(), s_p500command.id()))
            })
            // parse(type, tableName, function(results)
            .parse('financials.quarterlyBalanceSheet', sprintf('company.quarterlyBalanceSheet.%s', company.ticker()), function(financials) {
                financials
                    // store(type, filter, location)
                    .store('file', 'json', sprintf('quarterlyBalanceSheet.%s.%s.json', company.ticker(), s_p500command.id()))
                    // notify(type, location)
                    .notify('http', sprintf('http://localhost:3000/parse/company/quarterlyBalanceSheet/%s/%s', company.ticker(), s_p500command.id()))
            })
    })
*/
/*
s_p500Commands = {
    name: 'S&P 500',
    title: 's_p500',
    scraper: {
        type : 'phantom',
        location : 's_p500/'
    },
    actions: [
        {
            type: 'scrape',
            result: 'scrape_s_p500',
            config: {
                type: 'simple',
                url : 'http://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
            },
            actions: [
                {
                    type: 'store',
                    result: 'scrape_s_p500filename',
                    config: {
                        type: 'file',
                        filename: 'scrape_s_p500-%date.html',
                        data: inner.result
                    }
                },
                {
                    type: 'notify',
                    result: last.result,
                    config: {
                        type: 'http',
                        url: 'http://localhost:3000/scrape/%id',
                        data: last.result
                    }
                },
                {
                    type: 'parse',
                    result: 's_p500Components',
                    config: {
                        type: 's_p500Components',
                        data: last.result
                    },
                    actions: [
                        {
                            type: 'store',
                            result: 's_p500ComponentsFilename',
                            config: {
                                type: 'file',
                                filename: 'components-%date.json',
                                data: inner.result
                            }
                        },
                        {
                            type: 'notify',
                            config: {
                                type: 'http',
                                url: 'http://localhost:3000/parse/%id',
                                data: last.result
                            }
                        },
                    ]
                },
                {
                    type: 'parse',
                    result: 's_p500Changes',
                    config: {
                        type: 's_p500Changes',
                        data: 'scrape_s_p500'
                    },
                    actions: [
                        {
                            type: 'store',
                            result: 's_p500ChangesFilename',
                            config: {
                                type: 'file',
                                filename: 'changes-%date.json',
                                data: inner.result
                            }
                        },
                        {
                            type: 'notify',
                            config: {
                                type: 'http',
                                url: 'http://localhost:3000/parse/%id',
                                data: last.result
                            }
                        }
                    ]
                },
                {
                    type: 'forEach',
                    config: {
                        table: 's_p500Components',
                        columns: [ 'Market', 'Ticker symbol']
                    },
                    actions: [
                        {
                            type: 'scrape',
                            result: substitute('scrape_%s', 'Ticker symbol'),
                            config: {
                                type: 'simple',
                                url : substitute('https://www.google.com/finance?q=%s%3A%s&fstype=ii', 'Market', 'Ticker symbol')
                            },
                            actions: [
                                {
                                    type: 'store',
                                    result: substitute('scrape_%s_filename', 'Ticker symbol'),
                                    config: {
                                        type: 'file',
                                        filename: substitute('scrape_%s-%s.html', 'Ticker symbol', new Date()),
                                        data: inner.result
                                    }
                                },
                                {
                                    type: 'notify',
                                    config: {
                                        type: 'http',
                                        url: 'http://localhost:3000/scrape/%id',
                                        data: last.result
                                    }
                                },
                                {
                                    type: 'parse',
                                    result: substitute('annual_cash_flow-%s', 'Ticker symbol'),
                                    config: {
                                        type: 'annualCashFlow',
                                        data: inner.result
                                    },
                                    actions: [
                                        {
                                            type: 'store',
                                            result: substitute('annual_cash_flow-%s-filename', 'Ticker symbol'),
                                            config: {
                                                type: 'file',
                                                filename: 'annual_cash_flow-%s-%date.json',
                                                data: inner.result
                                            }
                                        },
                                        {
                                            type: 'notify',
                                            config: {
                                                type: 'http',
                                                url: 'http://localhost:3000/parse/%id',
                                                data: last.result
                                            }
                                        },
                                    ]
                                },
                                {
                                    type: 'parse',
                                    result: substitute('quarterly_cash_flow-%s', 'Ticker symbol'),
                                    config: {
                                        type: 'quarterlyCashFlow',
                                        data: inner.result
                                    },
                                    actions: [
                                        {
                                            type: 'store',
                                            result: substitute('quarterly_cash_flow-%s-filename', 'Ticker symbol'),
                                            config: {
                                                type: 'file',
                                                filename: substitute('quarterly_cash_flow-%s', 'Ticker symbol'),
                                                data: inner.result
                                            }
                                        },
                                        {
                                            type: 'notify',
                                            config: {
                                                type: 'http',
                                                url: 'http://localhost:3000/parse/%id',
                                                data: last.result
                                            }
                                        },
                                    ]
                                },
                                {
                                    type: 'parse',
                                    result: substitute('annual_balance-%s', 'Ticker symbol'),
                                    config: {
                                        type: 'annualBalanceSheet',
                                        data: inner.result
                                    },
                                    actions: [
                                        {
                                            type: 'store',
                                            result: substitute('annual_balance-%s-filename', 'Ticker symbol'),
                                            config: {
                                                type: 'file',
                                                filename: substitute('annual_balance-%s-%date.json', 'Ticker symbol'),
                                                data: inner.result
                                            }
                                        },
                                        {
                                            type: 'notify',
                                            config: {
                                                type: 'http',
                                                url: 'http://localhost:3000/parse/%id',
                                                data: last.result
                                            }
                                        },
                                    ]
                                },
                                {
                                    type: 'parse',
                                    result: substitute('quarterly_balance-%s', 'Ticker symbol'),
                                    config: {
                                        type: 'quarterlyBalanceSheet',
                                        data: inner.result
                                    },
                                    actions: [
                                        {
                                            type: 'store',
                                            result: substitute('quarterly_balance-%s-filename', 'Ticker symbol'),
                                            config: {
                                                type: 'file',
                                                filename: substitute('quarterly_balance-%s-%date.json', 'Ticker symbol'),
                                                data: last.result
                                            }
                                        },
                                        {
                                            type: 'notify',
                                            config: {
                                                type: 'http',
                                                url: 'http://localhost:3000/parse/%id',
                                                data: last.result
                                            }
                                        },
                                    ]
                                },
                                {
                                    type: 'parse',
                                    result: substitute('annual_income-%s', 'Ticker symbol'),
                                    config: {
                                        type: 'annualIncomeStatement',
                                        data: inner.result
                                    },
                                    actions: [
                                        {
                                            type: 'store',
                                            result: substitute('annual_income-%s-filename', 'Ticker symbol'),
                                            config: {
                                                type: 'file',
                                                filename: substitute('annual_income-%s.json', 'Ticker symbol'),
                                                data: inner.result
                                            }
                                        },
                                        {
                                            type: 'notify',
                                            config: {
                                                type: 'http',
                                                url: 'http://localhost:3000/parse/%id',
                                                data: last.result
                                            }
                                        },
                                    ]
                                },
                                {
                                    type: 'parse',
                                    result: substitute('quarterly_income-%s', 'Ticker symbol'),
                                    config: {
                                        type: 'quarterlyIncomeStatement',
                                        data: inner.result
                                    },
                                    actions: [
                                        {
                                            type: 'store',
                                            result: substitute('quarterly_income-%s-filename', 'Ticker symbol'),
                                            config: {
                                                type: 'file',
                                                filename: substitute('quarterly_income-%s.json', 'Ticker symbol'),
                                                data: inner.result
                                            }
                                        },
                                        {
                                            type: 'notify',
                                            config: {
                                                type: 'http',
                                                url: 'http://localhost:3000/scrape/%id',
                                                data: last.result
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
*/


module.exports = {
    getDatastore : function() {
        return datastore;
    },
    getTransport : function() {
        return transport;
    },
    getDefaultScraper : function() {
        return newCheerioScraper;
    },
    getScrapers : function() {
        return scrapers;
    },
    getScraper : function(scraperName) {
        var scraper = scrapers[scraperName];
        if (scraper === null) {
            scraper = getDefaultScraper();
        }
        return scraper;
    },
    registerScraper : function(scraperName, scraper) {
        scrapers[scraperName] = scraper;
    },
    getScrapeCommands : function() {
        return scrapeCommands;
    },
    getScrapeCommand : function(scrapeName) {
        return scrapeCommands[scrapeName];
    },
    registerScrapeCommand : function(scrapeName, scrapeCommand) {
        scrapeCommands[scrapeName] = scrapeCommand;
    },
    getParserCommands : function() {
        return parserCommands;
    },
    getParserCommand : function(parserName) {
        return parserCommands[parserName];
    },
    registerParserCommand : function(parserName, parserCommand) {
        parserCommands[parserName] = parserCommand;
    },
    getStoreCommands : function() {
        return storeCommands;
    },
    getStoreCommand : function(storeName) {
        return storeCommands[storeName];
    },
    registerStoreCommand : function(storeName, storeCommand) {
        storeCommands[storeName] = storeCommand;
    },
    getLoadCommands : function() {
        return loadCommands;
    },
    getLoadCommand : function(loaderName) {
        return loadCommands[loaderName];
    },
    registerLoadCommand : function(loaderName, loadCommand) {
        loadCommands[loaderName] = loadCommand;
    },
    getNotifyCommands : function() {
        return notifyCommands;
    },
    getNotifyCommand : function(notifyName) {
        return notifyCommands[notifyName];
    },
    registerNotifyCommand : function(notifyName, notifyCommand) {
        notifyCommands[notifyName] = notifyCommand;
    },
    getCommands : function() {
        return commands;
    },
    getCommand : function(commandName) {
        return commands[commandName];
    },
    registerCommand : function(commandName, command) {
        commands[commandName] = command;
    }
};
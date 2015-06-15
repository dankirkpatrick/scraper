var configuration = require('./modules/configuration.js');
var blocked = require('blocked');
var winston = require('winston');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: 'debug', colorize: true, timestamp: true});
winston.add(winston.transports.File, {filename:'/tmp/scraper.log', level: 'info'});
//winston.addColors({trace:'grey',debug:'blue',info:'green',warning:'yellow',error:'red'});

winston.log('trace', 'test trace');
winston.debug('test debug');
winston.info('test info');
winston.warn('test warn');
winston.error('test error');
winston.info('Application started...configuring');

blocked(function(ms){
	winston.info('BLOCKED FOR %sms at %s', ms | 0, (new Date()).toString());
});

{
	var scrapers = configuration.getScrapers();
	var scraperKeys = Object.keys(scrapers);
	for (var i = 0; i < scraperKeys.length; i++) {
		var scraperObj = scrapers[scraperKeys[i]];
		scraperObj.initialize(configuration);
	}

	var commands = configuration.getCommands();
	var commandKeys = Object.keys(commands);
	for (i = 0; i < commandKeys.length; i++) {
		var command = commands[commandKeys[i]];
		command.initialize(configuration);
	}

	var scrapeCommands = configuration.getScrapeCommands();
	var scrapeKeys = Object.keys(scrapeCommands);
	for (i = 0; i < scrapeKeys.length; i++) {
		var scrapeCommand = scrapeCommands[scrapeKeys[i]];
		scrapeCommand.initialize(configuration);
	}

	var parserCommands = configuration.getParserCommands();
	var parserKeys = Object.keys(parserCommands);
	for (i = 0; i < parserKeys.length; i++) {
		var parserCommand = parserCommands[parserKeys[i]];
		parserCommand.initialize(configuration);
	}

	var notifyCommands = configuration.getNotifyCommands();
	var notifyKeys = Object.keys(notifyCommands);
	for (i = 0; i < notifyKeys.length; i++) {
		var notifyCommand = notifyCommands[notifyKeys[i]];
		notifyCommand.initialize(configuration);
	}

	var storeCommands = configuration.getStoreCommands();
	var storeKeys = Object.keys(storeCommands);
	for (i = 0; i < storeKeys.length; i++) {
		var storeCommand = storeCommands[storeKeys[i]];
		storeCommand.initialize(configuration);
	}

	var loadCommands = configuration.getLoadCommands();
	var loadKeys = Object.keys(loadCommands);
	for (i = 0; i < loadKeys.length; i++) {
		var loadCommand = loadCommands[loadKeys[i]];
		loadCommand.initialize(configuration);
	}

	var datastore = configuration.getDatastore();
	datastore.initialize(configuration);

	var transport = configuration.getTransport();
	transport.initialize(configuration);
}

module.export = {
	getConfiguration : function() {
		return configuration;
	}
};

process.on('uncaughtException', function(err) {
	winston.log('error', 'unrecoverable error: %s', err.message);
	winston.log('error', 'stack: %s', err.stack);
});


var msg3 = {
    type: 'cheerio',
    name: 'S&P 500 from disk',
    commands: [
        {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/scrape/', filename: 's_p500.html',
            collection: 'pages', resultKey: 's_p500'},
        {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/parse/', filename: 's_p500.components.json',
            collection: 'tables', resultKey: 's_p500.components'},
        {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/parse/', filename: 's_p500.changes.json',
            collection: 's_p500', resultKey: 's_p500.changes'},
        {name: 'scanDir', regex: '.*\.financials\..*\.html$', location: '/Users/dan/Documents/scraped/data/scrape/', after: [
            {name: 'forEach', list: '^', after: [
                {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/scrape/', filename: '^',
                    collection: 'pages', resultKeyInput: '^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: 'financials.%2$s'}
            ] }
        ] },
        {name: 'scanDir', contextValue: 'financials', regex: '.*\.financials\..*\.json',  location: '/Users/dan/Documents/scraped/data/parse/', after: [
            {name: 'forEach', list: '^', after: [
                {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/parse/', filename: '^',
                    collection: 'financials', resultKeyInput: '^', resultKeyRegex: '.*\\.financials\\.(.*)\\.(.*)\\.json', resultKeyFormat: 'financials.%2$s.%3$s'}
            ] }
        ] }
    ],
    /*
     before: {
     'store': [
     {name: 'throttle', algorithm: 'random', shortTime: 100, longTime: 500}
     ]
     },
     */
    after: {
        'load': [
            {name: 'store', store: 'httpStore', host: 'localhost', port: 3000, path: '/store/'}
        ]
    }
};

var msg2 = {
    type: 'cheerio',
    name: 'S&P 500 from disk',
    commands: [
        /*
        {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/scrape/', filename: 's_p500.html',
                collection: 'pages', resultKey: 's_p500'},
         */
        /*
        {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/parse/', filename: 's_p500.components.json',
                collection: 's_p500', resultKey: 'components'}
                */
        /*
        {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/parse/', filename: 's_p500.changes.json',
                collection: 's_p500', resultKey: 'changes'},
                */

        {name: 'scanDir', regex: '.*\.financials\..*\.html$', location: '/Users/dan/Documents/scraped/data/scrape/', after: [
            {name: 'forEach', list: '^', after: [
                {name: 'scrape', type: 'file', location: '/Users/dan/Documents/scraped/data/scrape/', filename: '^', collection: 'pages',
                        resultKeyInput: '^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: 'financials.%2$s',
                        domCommands: [
                    {name: 'parse', parser: 'company.financials', startId: '#incannualdiv', collection: 'financials',
                        resultKeyInput: '^.^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: '%2$s.annualIncomeStatement'},
                    {name: 'parse', parser: 'company.financials', startId: '#incinterimdiv', collection: 'financials',
                        resultKeyInput: '^.^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: '%2$s.quarterlyIncomeStatement'},
                    {name: 'parse', parser: 'company.financials', startId: '#balannualdiv', collection: 'financials',
                        resultKeyInput: '^.^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: '%2$s.annualBalanceSheet'},
                    {name: 'parse', parser: 'company.financials', startId: '#balinterimdiv', collection: 'financials',
                        resultKeyInput: '^.^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: '%2$s.quarterlyBalanceSheet'},
                    {name: 'parse', parser: 'company.financials', startId: '#casannualdiv', collection: 'financials',
                        resultKeyInput: '^.^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: '%2$s.annualCashFlow'},
                    {name: 'parse', parser: 'company.financials', startId: '#casinterimdiv ', collection: 'financials',
                        resultKeyInput: '^.^', resultKeyRegex: '.*\\.financials\\.(.*)\\.html', resultKeyFormat: '%2$s.quarterlyCashFlow'}
                ] }
            ] }
        ] }

        /*,
        {name: 'scanDir', contextValue: 'financials', regex: '.*\.financials\..*\.json',  location: '/Users/dan/Documents/scraped/data/parse/', after: [
            {name: 'forEach', list: '^', after: [
                {name: 'load', loader: 'fileLoad', location: '/Users/dan/Documents/scraped/data/parse/', filename: '^',
                    collection: 'financials', resultKeyInput: '^', resultKeyRegex: '.*\\.financials\\.(.*)\\.(.*)\\.json', resultKeyFormat: '%2$s.%3$s'}
            ] }
        ] }
        */
    ],
    /*
     before: {
     'store': [
     {name: 'throttle', algorithm: 'random', shortTime: 100, longTime: 500}
     ]
     },
     */
    after: {  /*
        'scrape': [
            {name: 'store', store: 'httpStore', host: 'localhost', port: 3000, path: '/store/', collection: 'pages'}
        ],  */
        'load': [
            {name: 'store', store: 'httpStore', host: 'localhost', port: 3000, path: '/store/', collection: 'pages'}
        ],
        'parse': [
            {name: 'store', store: 'httpStore', host: 'localhost', port: 3000, path: '/store/', collection: 'tables'}
        ]
    }
};





var scraperType = msg2.type;
var scraper = configuration.getScraper(scraperType);
scraper.startScraper(msg2);

/*
	var msg = {
		type: 'phantom',
		name: 'S&P 500',
		commands: [
			{
				name: 'scrape',
				contextValue: 's_p500',
				pageName: 's_p500',
				url: 'http://en.wikipedia.org/wiki/List_of_S%26P_500_companies',
				domCommands: [
					{name: 'parse', contextValue: 'components', table: 'components', parser: 's_p500.components'},
					{name: 'parse', contextValue: 'changes', table: 'changes', parser: 's_p500.changes'}
				],
				after: [
					{
						name: 'forEach', contextValue: 'company', list: '%s_p500.components', after: [
						{
							name: 'scrape',
							contextValue: '%s_p500.company.ticker',
							pageName: '%s_p500.company.ticker',
							formatUrl: 'https://www.google.com/finance?q=%s\%3A%s&fstype=ii',
							formatUrlArgs: ['%s_p500.company.market', '%s_p500.company.ticker'],
							domCommands: [
								{
									name: 'parse',
									contextValue: 'annualIncomeStatement',
									table: 'annualIncomeStatement',
									parser: 'company.financials',
									startId: '#incannualdiv'
								},
								{
									name: 'parse',
									contextValue: 'quarterlyIncomeStatement',
									table: 'quarterlyIncomeStatement',
									parser: 'company.financials',
									startId: '#incinterimdiv'
								},
								{
									name: 'parse',
									contextValue: 'annualBalanceSheet',
									table: 'annualBalanceSheet',
									parser: 'company.financials',
									startId: '#balannualdiv'
								},
								{
									name: 'parse',
									contextValue: 'quarterlyBalanceSheet',
									table: 'quarterlyBalanceSheet',
									parser: 'company.financials',
									startId: '#balinterimdiv'
								},
								{
									name: 'parse',
									contextValue: 'annualCashFlow',
									table: 'annualCashFlow',
									parser: 'company.financials',
									startId: '#casannualdiv'
								},
								{
									name: 'parse',
									contextValue: 'quarterlyCashFlow',
									table: 'quarterlyCashFlow',
									parser: 'company.financials',
									startId: '#casinterimdiv '
								}
							]
						}
					]
					}
				]
			}
		],
		before: {
			'scrape': [
				{name: 'throttle', algorithm: 'random', shortTime: 15, longTime: 60}
			]
		},
		after: {
			'scrape': [
				{name: 'fileStore', suffix: 'html', location: '/Users/dan/Documents/scraper/data/scrape/'},
				{name: 'httpNotify', location: 'http://localhost:3000/notify/scrape/'}
			],
			'parse': [
				{
					name: 'fileStore',
					suffix: 'json',
					filter: 'JSON.stringify',
					location: '/Users/dan/Documents/scraper/data/parse/'
				},
				{name: 'httpNotify', location: 'http://localhost:3000/notify/parse/'}
			]
		},
		parsers: {
			components: {
				type: 'tableParser',
				tableName: 'components',
				headers: {
					match: [
						{selector: '.wikitable'},
						{eq: 0},
						{find: 'thead th'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					rowMatch: [
						{selector: '.wikitable'},
						{eq: 0},
						{find: 'tbody tr'}
					],
					dataMatch: [
						{selector: 'td'}
					],
					columnValueCommands: {
						0: [ // 'Ticker symbol'
							{
								elementText: {
									commands: [
										{
											insertColumn: {
												columnName: 'Quote link', valueCommands: [
													{elementHtml: {}},
													{regex: {match: 'href="(.*)"', index: 1}}
												]
											}
										},
										{
											insertColumn: {
												columnName: 'Market', valueCommands: [
													{elementHtml: {}},
													{regex: {match: 'href="https?:\/\/www\.([a-z]*)\.', index: 1}}
												]
											}
										}
									]
								}
							}
						],
						2: [ // 'SEC filings'
							{elementHtml: {}}
						]
					},
					defaultValueCommands: [
						{elementText: {}},
						{regex: {match: 'href="(.*)"', index: 1}}
					]
				}
			},
			changes: {
				type: 'tableParser',
				tableName: 'changes',
				headers: {
					match: [
						{selector: '.wikitable'},
						{eq: 1},
						{find: 'thead tr'},
						{eq: 1},
						{selector: 'td'}
					],
					columnValueCommands: {
						1: [
							{elementText: {}},
							{appendTo: {value: 'Added '}}
						],
						2: [
							{elementText: {}},
							{appendTo: {value: 'Added '}}
						],
						3: [
							{elementText: {}},
							{appendTo: {value: 'Removed '}}
						],
						4: [
							{elementText: {}},
							{appendTo: {value: 'Removed '}}
						]
					},
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					startRow: 2,
					rowMatch: [
						{selector: '.wikitable'},
						{eq: 1}
					],
					dataMatch: [
						{selector: 'td'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				}
			},
			annualIncomeStatement: {
				type: 'tableParser',
				tableName: 'annualIncomeStatement',
				headers: {
					match: [
						{selector: '#incannualdiv'},
						{find: 'thead tr'},
						{eq: 0},
						{selector: 'th'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					startRow: 1,
					rowMatch: [
						{selector: '#incannualdiv'},
						{find: 'thead tr'}
					],
					dataMatch: [
						{selector: 'td'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				}
			},
			quarterlyIncomeStatement: {
				type: 'tableParser',
				tableName: 'quarterlyIncomeStatement',
				headers: {
					match: [
						{selector: '#incinterimdiv'},
						{find: 'thead tr'},
						{eq: 0},
						{selector: 'th'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					startRow: 1,
					rowMatch: [
						{selector: '#incinterimdiv'},
						{find: 'thead tr'}
					],
					dataMatch: [
						{selector: 'td'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				}
			},
			annualBalanceSheet: {
				type: 'tableParser',
				tableName: 'annualBalanceSheet',
				headers: {
					match: [
						{selector: '#balannualdiv'},
						{find: 'thead tr'},
						{eq: 0},
						{selector: 'th'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					startRow: 1,
					rowMatch: [
						{selector: '#balannualdiv'},
						{find: 'thead tr'}
					],
					dataMatch: [
						{selector: 'td'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				}
			},
			quarterlyBalanceSheet: {
				type: 'tableParser',
				tableName: 'quarterlyBalanceSheet',
				headers: {
					match: [
						{selector: '#balinterimdiv'},
						{find: 'thead tr'},
						{eq: 0},
						{selector: 'th'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					startRow: 1,
					rowMatch: [
						{selector: '#balinterimdiv'},
						{find: 'thead tr'}
					],
					dataMatch: [
						{selector: 'td'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				}
			},
			annualCashFlow: {
				type: 'tableParser',
				tableName: 'annualCashFlow',
				headers: {
					match: [
						{selector: '#casannualdiv'},
						{find: 'thead tr'},
						{eq: 0},
						{selector: 'th'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					startRow: 1,
					rowMatch: [
						{selector: '#casannualdiv'},
						{find: 'thead tr'}
					],
					dataMatch: [
						{selector: 'td'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				}
			},
			quarterlyCashFlow: {
				type: 'tableParser',
				tableName: 'quarterlyCashFlow',
				headers: {
					match: [
						{selector: '#casinterimdiv'},
						{find: 'thead tr'},
						{eq: 0},
						{selector: 'th'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				},
				data: {
					startRow: 1,
					rowMatch: [
						{selector: '#casinterimdiv'},
						{find: 'thead tr'}
					],
					dataMatch: [
						{selector: 'td'}
					],
					defaultValueCommands: [
						{elementText: {}}
					]
				}
			}
		}
	};
  */
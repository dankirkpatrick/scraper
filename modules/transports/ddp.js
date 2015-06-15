/////////////////////////////////////////////////////
//       DDP Communication with GUI Server         //
/////////////////////////////////////////////////////
var ddp = require('ddp');

var guiServerHost = '127.0.0.1';
var guiServerHttpPort = 3000;

// TODO: Implement this!!!


// Initialize DDP communication with GUI server
var ddpclient = new ddp({
    host : guiServerHost,
    port : guiServerHttpPort,
    path : "websocket",
    ssl  : false,
    autoReconnect : true,
    autoReconnectTimer : 500,
    maintainCollections : true,
    ddpVersion : '1'
});


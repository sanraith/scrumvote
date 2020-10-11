import Debug from 'debug';
import express from 'express';
import * as http from 'http';
import logger from 'morgan';
import randomRouter from './routes/randomRouter';

const debug = Debug('fullstack-angular-app:server');
const _app_client_folder = 'dist/client';

// Components setup
const server = express();
if (process.env.NODE_ENV === 'development') {
    server.use(logger('dev'));
}
server.use(express.json());
server.use(express.urlencoded({extended: false}));

// Routers setup
server.use('/api/random', randomRouter);
server.use(express["static"](_app_client_folder));

// Serve application paths
server.get('*', function (req, res) {
    res.status(200).sendFile(`/`, { root: _app_client_folder });
});




// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '3000');
server.set('port', port);

// Create HTTP server.
const httpServer = http.createServer(server);

// Listen on provided port, on all network interfaces.
httpServer.listen(port);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val; // named pipe
    }
    if (port >= 0) {
        return port; // port number
    }
    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = httpServer.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr?.port;
    console.log('Listening on ' + bind);
}

debug(`Web server started with process id: ${process.pid}`);

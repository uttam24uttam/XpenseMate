const winston = require('winston');
const net = require('net');
const Transport = require('winston-transport');

class LogstashTCPTransport extends Transport {
    constructor(opts) {
        super(opts);
        this.host = opts.host || 'logstash';
        this.port = opts.port || 5000;
        this.client = null;
        this.connect();
    }

    connect() {
        this.client = new net.Socket();
        this.client.connect(this.port, this.host, () => {
            console.log(`[Logger] Connected to Logstash at ${this.host}:${this.port}`);
        });

        this.client.on('error', (err) => {
            console.error(`[Logger] Logstash connection error: ${err.message}. Retrying...`);
            this.client.destroy();
            this.client = null;
            setTimeout(() => this.connect(), 5000);
        });

        this.client.on('close', () => {
            this.client = null;
        });
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if (this.client && !this.client.destroyed) {
            const logEntry = JSON.stringify(info) + '\n';
            this.client.write(logEntry, (err) => {
                if (err) console.error('[Logger] Write error:', err.message);
            });
        }

        callback();
    }
}

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: { service: 'splitwise-backend' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new LogstashTCPTransport({
            host: 'logstash',
            port: 5000
        })
    ],
});

module.exports = logger;

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Solace AMQP Node.js Examples: QueueConsumer
 */

const rhea = require('rhea');

class QueueConsumer {
  constructor() {
    // Default connection parameters
    this.config = {
      username: 'default',
      password: 'default',
      host: 'localhost',
      port: 5672,
      queueName: 'Q/tutorial',
      vpn: 'default',
      ssl: false,
      connectionAttempts: 3,
      connectionTimeout: 10000, // 10 seconds
      debug: false
    };
    
    this.container = rhea.create_container();
    this.connection = null;
    this.receiver = null;
    this.isConnected = false;
    this.connectionAttempt = 0;
    this.reconnectTimer = null;
    this.exitTimer = null;
    
    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Parse command line arguments to override default configuration
   * @param {string[]} args - Command line arguments
   * @returns {QueueConsumer} - Returns this instance for method chaining
   */
  parseArgs(args) {
    // Check for help flag
    if (args.includes('-h') || args.includes('--help')) {
      this.printHelp();
      process.exit(0);
    }
    
    args.forEach(arg => {
      const [key, value] = arg.split('=');
      if (!key.startsWith('--')) return;
      
      const option = key.slice(2);
      switch (option) {
        case 'username':
        case 'password':
        case 'host':
        case 'queueName':
        case 'vpn':
          this.config[option] = value;
          break;
        case 'port':
          this.config.port = parseInt(value, 10);
          break;
        case 'ssl':
          this.config.ssl = value.toLowerCase() === 'true';
          break;
        case 'debug':
          this.config.debug = value.toLowerCase() === 'true';
          break;
        case 'connectionAttempts':
          this.config.connectionAttempts = parseInt(value, 10);
          break;
        case 'connectionTimeout':
          this.config.connectionTimeout = parseInt(value, 10);
          break;
      }
    });
    
    return this;
  }

  /**
   * Set the queue name
   * @param {string} queueName - Name of the queue to consume from
   * @returns {QueueConsumer} - Returns this instance for method chaining
   */
  queue(queueName) {
    this.config.queueName = queueName;
    return this;
  }

  /**
   * Log a message with timestamp
   * @param {string} message - Message to log
   * @param {boolean} [isDebug=false] - Whether this is a debug message
   */
  log(message, isDebug = false) {
    if (isDebug && !this.config.debug) return;
    
    const time = new Date().toTimeString().split(' ')[0];
    console.log(`[${time}] ${message}`);
  }
  
  /**
   * Log detailed debug information
   * @param {string} message - Debug message
   * @param {any} [data] - Optional data to log
   */
  debug(message, data) {
    if (!this.config.debug) return;
    
    const time = new Date().toTimeString().split(' ')[0];
    if (data) {
      console.log(`[${time}] DEBUG: ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    } else {
      console.log(`[${time}] DEBUG: ${message}`);
    }
  }

  /**
   * Handle errors
   * @param {Error} error - Error object
   * @param {boolean} [fatal=true] - Whether this is a fatal error that should exit the process
   */
  handleError(error, fatal = true) {
    this.log(`Error: ${error.message}`);
    
    // Log more detailed error information in debug mode
    if (this.config.debug) {
      this.debug('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      });
    }
    
    if (fatal) {
      this.cleanup().finally(() => {
        process.exit(1);
      });
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      if (this.exitTimer) {
        clearTimeout(this.exitTimer);
        this.exitTimer = null;
      }
      
      if (this.connection) {
        this.connection.close();
        this.connection = null;
      }
      
      this.log('Connection closed.');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Set up event handlers for the rhea container
   */
  setupEventHandlers() {
    // Connection events
    this.container.on('connection_open', (context) => {
      this.isConnected = true;
      this.connectionAttempt = 0;
      this.log(`Successfully connected to ${this.config.host}:${this.config.port}`);
    });

    this.container.on('connection_close', (context) => {
      this.isConnected = false;
      this.log('Connection closed by remote host');
    });

    this.container.on('connection_error', (context) => {
      const error = context.connection.error;
      this.log(`Connection error: ${error ? error.description : 'Unknown error'}`);
      
      if (!this.isConnected && this.connectionAttempt < this.config.connectionAttempts) {
        this.attemptReconnect();
      } else if (!this.isConnected) {
        this.handleError(new Error(`Failed to connect after ${this.config.connectionAttempts} attempts`));
      }
    });

    // Receiver events
    this.container.on('receiver_open', (context) => {
      this.log(`Receiver opened for queue: ${this.config.queueName}`);
      this.log('Waiting for messages...');
    });

    this.container.on('message', (context) => {
      const message = context.message;
      const body = message.body;
      const content = typeof body === 'string' ? body : JSON.stringify(body);
      
      this.log(`Received message: '${content}'.`);
      this.debug('Message properties:', message);
      
      // Accept the message (equivalent to ack in amqplib)
      context.delivery.accept();
      
      // Exit after receiving a message
      this.exitTimer = setTimeout(() => {
        this.cleanup().then(() => {
          this.log('Finished.');
          process.exit(0);
        });
      }, 2000); // wait for 2 seconds to exit
    });

    // Error events
    this.container.on('disconnected', (context) => {
      const error = context.error || new Error('Disconnected');
      this.log(`Disconnected: ${error.message}`);
      
      if (this.connectionAttempt < this.config.connectionAttempts) {
        this.attemptReconnect();
      } else {
        this.handleError(error);
      }
    });
  }

  /**
   * Attempt to reconnect with backoff
   */
  attemptReconnect() {
    this.connectionAttempt++;
    const delay = Math.min(1000 * Math.pow(2, this.connectionAttempt - 1), 10000);
    
    this.log(`Connection attempt ${this.connectionAttempt}/${this.config.connectionAttempts} failed. Retrying in ${delay}ms...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Get connection options for rhea
   * @returns {Object} - Connection options
   */
  getConnectionOptions() {
    const { username, password, host, port, vpn, ssl } = this.config;
    
    const options = {
      host: host,
      port: port,
      username: username,
      password: password,
      reconnect: false, // We'll handle reconnection manually
      transport: ssl ? 'tls' : 'tcp',
      idle_time_out: this.config.connectionTimeout,
      container_id: `solace-samples-amqp-consumer-${Date.now()}`
    };
    
    // Add VPN as vhost parameter if not default
    if (vpn && vpn !== 'default') {
      options.hostname = vpn;
    }
    
    // Add SSL options if enabled
    if (ssl) {
      options.rejectUnauthorized = false; // For testing only, should be true in production
    }
    
    this.debug('Connection options:', options);
    return options;
  }

  /**
   * Connect to the AMQP broker
   */
  connect() {
    try {
      const options = this.getConnectionOptions();
      this.log(`Connecting to ${options.host}:${options.port}`);
      
      // Create connection
      this.connection = this.container.connect(options);
      
      // Create receiver
      this.receiver = this.connection.open_receiver({
        source: {
          address: this.config.queueName,
          durable: 2, // 2 = unsettled-state
          expiry_policy: 'never'
        },
        credit_window: 10 // Prefetch 10 messages at a time
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Connect to the AMQP broker and start consuming messages
   */
  receive() {
    this.connectionAttempt = 1;
    this.connect();
  }
  
  /**
   * Print help information
   */
  printHelp() {
    console.log('Solace AMQP Node.js Examples: QueueConsumer');
    console.log('\nUsage:');
    console.log('  node src/QueueConsumer.js [options]');
    console.log('\nOptions:');
    console.log('  -h, --help                   Show this help message');
    console.log('  --username=<value>           Set the username for authentication (default: \'default\')');
    console.log('  --password=<value>           Set the password for authentication (default: \'default\')');
    console.log('  --host=<value>               Set the hostname or IP address (default: \'localhost\')');
    console.log('  --port=<value>               Set the port number (default: 5672)');
    console.log('  --queueName=<value>          Set the queue name (default: \'Q/tutorial\')');
    console.log('  --vpn=<value>                Set the message VPN name (default: \'default\')');
    console.log('  --ssl=<true|false>           Enable or disable SSL/TLS (default: false)');
    console.log('  --debug=<true|false>         Enable or disable debug logging (default: false)');
    console.log('  --connectionAttempts=<value> Set the number of connection retry attempts (default: 3)');
    console.log('  --connectionTimeout=<value>  Set the connection timeout in milliseconds (default: 10000)');
    console.log('\nExamples:');
    console.log('  node src/QueueConsumer.js');
    console.log('  node src/QueueConsumer.js --host=solace-host.com --port=5672 --username=user --password=pass');
    console.log('  node src/QueueConsumer.js --queueName=Q/myQueue --debug=true');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('QueueConsumer Unhandled Rejection: promise ', promise, ', reason: ', reason);
});

// Create consumer instance
const consumer = new QueueConsumer();

// Parse command line arguments if provided
if (process.argv.length > 2) {
  consumer.parseArgs(process.argv.slice(2));
}

// If no arguments are provided, check if we should show help
if (process.argv.length === 2) {
  // Uncomment the following line to show help when no arguments are provided
  // consumer.printHelp();
}

// Display connection information
console.log('Using connection parameters:');
console.log(`  Host: ${consumer.config.host}`);
console.log(`  Port: ${consumer.config.port}`);
console.log(`  Username: ${consumer.config.username}`);
console.log(`  Queue: ${consumer.config.queueName}`);
console.log(`  VPN: ${consumer.config.vpn}`);
console.log(`  SSL: ${consumer.config.ssl}`);
console.log(`  Debug mode: ${consumer.config.debug}`);

// Start consuming messages
consumer.receive();

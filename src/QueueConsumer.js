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

/* jshint node: true, esversion: 6 */

var QueueConsumer = function() {
    'use strict';
    var self = {};
    var AMQP = require('amqp10');
    // don't support subjects in the link names
    var amqpClient = new AMQP.Client(AMQP.Policy.merge({
        defaultSubjects : false
    }));

    self.host = function(hostname) {
        self.hostname = hostname;
        return self;
    };

    self.queue = function(queueName) {
        self.queueName = queueName;
        return self;
    };

    self.log = function(line) {
        var time = new Date().toTimeString().split(' ')[0];
        console.log(`[${time}]`, line);
    };

    self.error = function(error) {
        self.log(`Error: ${JSON.stringify(error)}`);
        process.exit();
    };

    self.receive = function() {
        self.log(`Connecting to ${self.hostname}`);
        amqpClient.connect(self.hostname).then(() => {
            // create a received from the queue
            return amqpClient.createReceiver(self.queueName);
        }).then((amqpReceiver) => {
            self.log('Waiting for messages...');
            amqpReceiver.on('message', (message) => {
                self.log(`Received message: '${message.body}'.`);
                self.exit();
            });
            amqpReceiver.on('errorReceived', (error) => {
                self.error(error);
            });
        });
    };

    self.exit = function() {
        setTimeout(() => {
            amqpClient.disconnect().then(() => {
                self.log('Finished.');
                process.exit();
            });
        }, 2000); // wait for 2 seconds to exit
    };

    return self;
};

process.on('unhandledRejection', (reason, promise) => {
    console.log('QueueConsumer Unhandled Rejection: promise ', promise, ', reason: ', reason);
});


if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " amqp://<msg_backbone_ip:amqp_port>");
    process.exit(-1);
}
 
// start the application
var solaceHostname = process.argv.slice(2)[0]
var queueConsumer = new QueueConsumer().host(solaceHostname).queue('Q/tutorial')

// the next statement blocks until a message is received
queueConsumer.receive();

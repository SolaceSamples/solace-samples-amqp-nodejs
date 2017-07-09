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
 * Solace AMQP Node.js Examples: QueueReceiver
 */

/* jshint node: true, esversion: 6 */

var QueueReceiver = function() {
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

    self.amqpPort = function(port) {
        self.port = port;
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
        var url =  `amqp://${self.hostname}:${self.port}`;
        self.log(`Connecting to ${url}`);
        amqpClient.connect(url).then(() => {
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
    console.log('QueueReceiver Unhandled Rejection: promise ', promise, ', reason: ', reason);
});

new QueueReceiver().host('SOLACE_HOSTNAME').amqpPort('AMQP_SERVICE_PORT').queue('amqp/tutorial/queue').receive();

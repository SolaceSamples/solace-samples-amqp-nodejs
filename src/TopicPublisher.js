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
 * Solace AMQP Node.js Examples: TopicPublisher
 */

/* jshint node: true, esversion: 6 */

var TopicPublisher = function(topicName) {
    'use strict';
    var publisher = {};
    var AMQP = require('amqp10');
    var amqpClient = new AMQP.Client();
    publisher.topicName = topicName;

    publisher.log = function(line) {
        var now = new Date();
        var time = [ ('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
                ('0' + now.getSeconds()).slice(-2) ];
        var timestamp = '[' + time.join(':') + '] ';
        console.log(timestamp + line);
    };

    publisher.run = function(hostname, port) {
        var url = "amqp://" + hostname + ":" + port;
        publisher.log(url);
        amqpClient.connect(url).then(function() {
            return amqpClient.createSender(topicName);
        }).then(function(sender) {
            return sender.send("Message with String Data").then(function() {
                publisher.log("Message published successfully.");
            }, function(error) {
                publisher.log(JSON.stringify(error));
            });
        }).error(function(error) {
            publisher.log(error);
        });
    };

    publisher.exit = function() {
        setTimeout(function() {
            process.exit();
        }, 2000); // wait for 2 seconds to exit
    };

    return publisher;
};

process.on('unhandledRejection', function(reason, promise) {
    console.log("Possibly Unhandled Rejection at: Promise ", promise, " reason: ", reason);
    // application specific logging here
});

var publisher = new TopicPublisher("test1");
publisher.run("192.168.133.16", "8555");
publisher.log('here');

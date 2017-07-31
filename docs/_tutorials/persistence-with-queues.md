---
layout: tutorials
title: Persistence with Queues
summary: Demonstrates persistent messages for guaranteed delivery.
icon: persistence-with-queues-icon.png
---

This tutorial will show you how to send and receive persistent messages with Node.js using the [**amqp10** AMQP 1.0 compliant client](https://github.com/noodlefrenzy/node-amqp10)  and Solace Message Router.

![Sample Image Text]({{ site.baseurl }}/images/persistence-with-queues-icon.png)

This tutorial is available in [GitHub]({{ site.repository }}){:target="_blank"} along with the other [Solace Getting Started AMQP Tutorials]({{ site.links-get-started-amqp }}){:target="_top"}.

At the end, this tutorial walks through downloading and running the sample from source.

## Assumptions

This tutorial assumes the following:

* You are familiar with Solace [core concepts]({{ site.docs-core-concepts }}){:target="_top"}.
* You have access to a running Solace message router with the following configuration:
    * Enabled `default` message VPN
    * Enabled `default` client username
    * Enabled `default` client profile with guaranteed messaging permissions.

One simple way to get access to a Solace message router is to start a Solace VMR load [as outlined here]({{ site.docs-vmr-setup }}){:target="_top"}. By default the Solace VMR will run with the `default` message VPN configured and ready for messaging. Going forward, this tutorial assumes that you are using the Solace VMR. If you are using a different Solace message router configuration, adapt the instructions to match your configuration.

## Goals

The goal of this tutorial is to demonstrate how to use the [**amqp10** AMQP 1.0 compliant client](https://github.com/noodlefrenzy/node-amqp10) with the Solace Message Router. This tutorial will show you:

1.  How to send a persistent message to a durable queue that exists on the Solace message router
2.  How to bind to this queue and receive a persistent message

## Solace message router properties

In order to send or receive messages to a Solace message router, you need to know a few details of how to connect to the Solace message router. Specifically you need to know the following:

<table>
<tbody>
<tr>
<th>Resource</th>
<th>Value</th>
<th>Description</th>
</tr>
<tr>
<td>Host</td>
<td>String of the form <code>DNS name</code> or <code>IP:Port</code></td>
<td>This is the address clients use when connecting to the Solace Message Router to send and receive messages. For a Solace VMR there is only a single interface so the IP is the same as the management IP address. For Solace message router appliances this is the host address of the message-backbone. The port number must match the port number for the plain text AMQP service on the router.</td>
</tr>
<tr>
<td>Message VPN</td>
<td>String</td>
<td>The `default` Solace message router Message VPN that this client will connect to.</td>
</tr>
<tr>
<td>Client Username</td>
<td>String</td>
<td>The `default` client username.</td>
</tr>
</tbody>
</table>

## AMQP 1.0 compliant client

The [**amqp10** AMQP 1.0 compliant client](https://github.com/noodlefrenzy/node-amqp10) is an open-source JavaScript client for sending and receiving messages over AMQP 1.0. If you choose to use a different AMQP 1.0 compliant client, adjust the given in this tutorial examples accordingly.

### Obtaining amqp10

This tutorial depends on you having the [**amqp10** AMQP 1.0 compliant client](https://github.com/noodlefrenzy/node-amqp10) downloaded and installed for your project, and the instructions in this tutorial assume you successfully done it. If your environment differs then adjust the build instructions appropriately.

The easiest way to do it through `npm`:

```sh
$ npm install amqp10 -save
```

## Connecting to the Solace Message Router

The *amqp10* client uses *Promise* from the [*Bluebird* library](http://bluebirdjs.com) that is a superset of the ES6 *Promise* specification, but our tutorial examples will follow only the ES6 *Promise* specification.

In order to send or receive messages, an application that uses the *amqp10* client must start a connection to the Solace Message Router AMQP service URL. The URL consists of the Solace Message Router host name with the AMQP service port number.

Assigning `defaultSubjects` to `false` allows the use of a slash-separated hierarchy in the queue name.

*QueueProducer.js/QueueRecevier.js*
```javascript
var AMQP = require('amqp10');

self.host = function(hostname) {
    self.hostname = hostname;
    return self;
};

var amqpClient = new AMQP.Client(AMQP.Policy.merge({
    defaultSubjects : false
}));

...
    amqpClient.connect(self.hostname).then(() => {
...
```

At this point the application is connected to the Solace Message Router and ready to send and receive messages.

## Sending a persistent message to a queue

In order to send a message to a queue a *Sender* needs to be created.

![sending-message-to-queue]({{ site.baseurl }}/images/persistence-with-queues-details-2.png)

The name of the queue for sending messages is given to *Sender* when it is being created.

*QueueProducer.js*
```javascript
amqpClient.connect(self.hostname).then(()
    return amqpClient.createSender(self.queueName);
}).then((amqpSender) => {
    return amqpSender.send(message).then(() => {
```

## Receiving a persistent message from a queue

To receive a persistent message from a queue a *Receiver* needs to be created.

![]({{ site.baseurl }}/images/persistence-with-queues-details-1.png)

The name of the queue for sending messages is given to *Receiver* when it is being created and it is the same as the one we send messages to.

The created *Receiver* emits events, and listener functions for at least `message` and `errorReceived` events need to be declared. A `message` event is emitted for every message recevied by the *Recevier*.

*QueueConsumer.java*
```javascript
amqpClient.connect(self.hostname).then(() => {
    return amqpClient.createReceiver(self.queueName);
}).then((amqpReceiver) => {
    amqpReceiver.on('message', (message) => {
        ...
    });
    amqpReceiver.on('errorReceived', (error) => {
        ...
    });
```


## Summary

Combining the example source code shown above results in the following source code files:

*   [QueueProducer.js]({{ site.repository }}/blob/master/src/QueueProducer.js){:target="_blank"}
*   [QueueConsumer.js]({{ site.repository }}/blob/master/src/QueueConsumer.js){:target="_blank"}

### Getting the Source

Clone the GitHub repository containing the Solace samples.

```
git clone {{ site.repository }}
cd {{ site.baseurl | remove: '/'}}
```

### Running

Modify the example code to reflect your Solace Message Router host and port number for the AMQP service.

The examples can be executed as:

```sh
node src/QueueConsumer.js amqp://<SOLACE_HOST>:<AMQP_PORT>
node src.QueueProducer.js amqp://<SOLACE_HOST>:<AMQP_PORT>
```

### Sample Output

Start the `QueueConsumer` so that it is up and waiting for messages.

```sh
$ node src/QueueConsumer.js amqp://<SOLACE_HOST>:<AMQP_PORT>
[17:13:14] Connecting to amqp://<SOLACE_HOST>:<AMQP_PORT>
[17:13:14] Waiting for messages...
```

Then run the `QueueProducer` to send the message.

```sh
$ node src/QueueProducer.js
[17:13:53] Connecting to amqp://<SOLACE_HOST>:<AMQP_PORT>
[17:13:53] Sending message 'Hello world Queues!'...
[17:13:53] Message sent successfully.
[17:13:55] Finished.
```

Notice how the message is received by the `QueueConsumer`.

```sh
...
[17:13:14] Waiting for messages...
[17:13:53] Received message: 'Hello world Queues!'.
[17:13:55] Finished.
```

Now you know how to use the **amqp10** AMQP 1.0 compliant Node.js client with the Solace Message Router to send and receive persistent messages from a queue.

If you have any issues sending and receiving message or reply, check the [Solace community]({{ site.links-community }}){:target="_top"} for answers to common issues seen.

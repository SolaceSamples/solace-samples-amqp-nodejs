# Getting Started Examples

> [!CAUTION]
> This is an archived repository and is not actively maintained. AMQP 1.0 is an open standard protocol, developers can use any AMQP 1.0 library of their choice and follow the respected open source examples as a reference. [Solace supports the AMQP 1.0 protocol](https://docs.solace.com/API/AMQP/AMQP-API-Rec.htm) but does not produce or officially support this API. Issues should be pursued through the project's maintainer.


## Using Node.js over AMQP 1.0 with Solace Message Routers

The Advanced Message Queuing Protocol (AMQP) is an open standard application layer protocol for message-oriented middleware, and Solace Message Routers support AMQP 1.0.

In addition to information provided on the Solace [Developer Portal](https://www.solace.dev/), you may also look at external sources for more details about AMQP:

 - http://www.amqp.org
 - https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=amqp
 - http://docs.oasis-open.org/amqp/core/v1.0/amqp-core-complete-v1.0.pdf

The "Getting Started" tutorials will get you up to speed and sending messages with Solace technology as quickly as possible. There are three ways you can get started:

- Follow [these instructions](https://docs.solace.com/Cloud/ggs_signup.htm) to quickly spin up a cloud-based Solace messaging service for your applications.
- Follow [these instructions](https://solace.com/products/event-broker/software/getting-started/) to start the Solace VMR in leading Clouds, Container Platforms or Hypervisors. The tutorials outline where to download and how to install the Solace VMR.
- If your company has Solace message routers deployed, contact your middleware team to obtain the host name or IP address of a Solace message router to test against, a username and password to access it, and a VPN in which you can produce and consume messages.

## Contents

This repository contains code and matching tutorial walkthroughs for different basic scenarios. It is best to view the associated [tutorials home page](https://tutorials.solace.dev/).

## Checking out and Building

To check out the project and build it, do the following:

  1. clone this GitHub repository
  1. `cd solace-samples-nodejs`
  1. `npm install`

### AMQP JavaScript Library

This project uses the [rhea](https://github.com/amqp/rhea) library, which is a pure JavaScript implementation of the AMQP 1.0 protocol.

## Running the Samples

The samples are found in the `src` directory.

You run the sample using `node`. For example:

```sh
# Run QueueConsumer with default settings
$ node src/QueueConsumer.js

# Run QueueConsumer with custom connection parameters using flags
$ node src/QueueConsumer.js --host=solace-host.com --port=5672 --username=user --password=pass --queueName=Q/myQueue

# Run QueueConsumer with debug mode enabled
$ node src/QueueConsumer.js --debug=true

# Run QueueConsumer with VPN and SSL settings
$ node src/QueueConsumer.js --vpn=my_vpn --ssl=true

# Run QueueProducer with default settings
$ node src/QueueProducer.js

# Run QueueProducer with custom connection parameters and message
$ node src/QueueProducer.js --host=solace-host.com --port=5672 --username=user --password=pass --queueName=Q/myQueue --message="Hello Solace!"
```

Both the QueueConsumer and QueueProducer support the following command-line flags:
- `-h, --help`: Show help information with usage examples
- `--username=value`: Set the username for authentication (default: 'default')
- `--password=value`: Set the password for authentication (default: 'default')
- `--host=value`: Set the hostname or IP address (default: 'localhost')
- `--port=value`: Set the port number (default: 5672)
- `--queueName=value`: Set the queue name (default: 'Q/tutorial')
- `--vpn=value`: Set the message VPN name (default: 'default')
- `--ssl=true|false`: Enable or disable SSL/TLS (default: false)
- `--debug=true|false`: Enable or disable debug logging (default: false)
- `--connectionAttempts=value`: Set the number of connection retry attempts (default: 3)
- `--connectionTimeout=value`: Set the connection timeout in milliseconds (default: 10000)

Additionally, the QueueProducer supports:
- `--message=value`: Set the message content to send (default: 'Hello world Queues!')

### Troubleshooting Connection Issues

If you encounter connection issues like "Socket closed abruptly during opening handshake", try the following:

1. Check the help information for available options:
   ```
   $ node src/QueueConsumer.js -h
   ```

2. Enable debug mode to see detailed connection information:
   ```
   $ node src/QueueConsumer.js --debug=true
   ```

2. Verify your Solace broker settings:
   - Confirm AMQP is enabled on the broker
   - Check if you need to specify a VPN name
   - Verify if SSL/TLS is required

3. Try with explicit connection retry parameters:
   ```
   $ node src/QueueConsumer.js --connectionAttempts=5 --connectionTimeout=15000
   ```

4. If your broker requires SSL/TLS:
   ```
   $ node src/QueueConsumer.js --ssl=true
   ```

See the [tutorials](https://dev.solace.com/samples/solace-samples-amqp-nodejs/) for more details.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

See the list of [contributors](https://github.com/SolaceSamples/solace-samples-amqp-nodejs/contributors) who participated in this project.

## License

This project is licensed under the Apache License, Version 2.0. - See the [LICENSE](LICENSE) file for details.

## Resources

For more information try these resources:

- The Solace Developer Portal website at: http://dev.solace.com
- Get a better understanding of [Solace technology](https://solace.com/products/tech/).
- Check out the [Solace blog](http://dev.solace.com/blog/) for other interesting discussions around Solace technology
- Ask the [Solace community.](https://solace.community)

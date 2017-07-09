---
layout: tutorials
title: Confirmed Delivery
summary: Learn how to confirm that your messages are received by a Solace message router.
icon: confirmed-delivery-icon.png
---

This tutorial builds on the basic concepts introduced in [Persistence with Queues]({{ site.baseurl }}/persistence-with-queues) tutorial and will show you how to properly process publisher acknowledgements. Once an acknowledgement for a message has been received and processed, you have confirmed your persistent messages have been properly accepted by the Solace Message Router and therefore can be guaranteed of no message loss.  

![confirmed-delivery]({{ site.baseurl }}/images/confirmed-delivery-icon.png)

This tutorial is available in [GitHub]({{ site.repository }}){:target="_blank"} along with the other [Solace Getting Started AMQP Tutorials]({{ site.links-get-started-amqp }}){:target="_top"}.

This tutorial focuses on using a non-Solace JMS API implementation. For using the Solace JMS API see [Solace Getting Started JMS Tutorials]({{ site.links-get-started-jms }}){:target="_blank"}.

## Persistent Publishing

In the JMS, when sending persistent messages, the JMS *Producer* will return from the blocking `send()` method until the message is fully acknowledged by the message broker.

This behavior means that applications sending persistent messages using the Solace Message Router are guaranteed that the messages is accepted by the Router by the time the `send()` call returns. No extra publisher acknowledgement handling is required or possible.

This behavior also means that persistent message producers are forced to block on sending each message. This can lead to performance bottlenecks on publish. Applications can work around this by using JMS Session based transactions and committing the transaction only after several messages are sent to the messaging system.

## Summarizing

For a JMS applications there is nothing further they must do to confirm message delivery with the Solace Message Router. This is handled by the JMS API by making the `send()` call blocking.

If you have any further questions ask the [Solace community]({{ site.links-community }}){:target="_top"}.

---
layout: tutorials
title: Confirmed Delivery
summary: Learn how to confirm that your messages are received by a Solace message router.
icon: I_dev_confirm.svg
---

This tutorial builds on the basic concepts introduced in [Persistence with Queues]({{ site.baseurl }}/persistence-with-queues) tutorial and will show you how to properly process publisher acknowledgements. Once an acknowledgement for a message has been received and processed, you have confirmed your persistent messages have been properly accepted by the Solace Message Router and therefore can be guaranteed of no message loss.  

This tutorial is available in [GitHub]({{ site.repository }}){:target="_blank"} along with the other [Solace Getting Started AMQP Tutorials]({{ site.links-get-started-amqp }}){:target="_top"}.

## Persistent Publishing

When sending persistent messages, the *Producer* will not return from the blocking `send()` method until the message is fully acknowledged by the message broker.

This behavior means that applications sending persistent messages using the Solace Message Router are guaranteed that the messages are accepted by the router by the time the `send()` call returns. No extra publisher acknowledgement handling is required or possible.

This behavior also means that persistent message producers are forced to block on sending each message. This can lead to performance bottlenecks on publish.

## Summary

For Node.js applications there is nothing further they must do to confirm message delivery with a Solace Message Router. This is handled by the underlying client by making the `send()` call blocking.

If you have any further questions ask the [Solace community]({{ site.links-community }}){:target="_top"}.

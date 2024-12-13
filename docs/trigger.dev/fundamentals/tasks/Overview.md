Tasks: Overview
===============

There are different types of tasks including regular tasks and [scheduled tasks](https://trigger.dev/docs/tasks/scheduled).

Hello world task and how to trigger it
--------------------------------------

Here’s an incredibly simple task:

You can trigger this in two ways:

1.  From the dashboard [using the “Test” feature](https://trigger.dev/docs/run-tests).
2.  Trigger it from your backend code. See the [full triggering guide here](https://trigger.dev/docs/triggering).

Here’s how to trigger a single run from elsewhere in your code:

You can also [trigger a task from another task](https://trigger.dev/docs/triggering), and wait for the result.

Defining a `task`
-----------------

The task function takes an object with the following fields.

### The `id` field

This is used to identify your task so it can be triggered, managed, and you can view runs in the dashboard. This must be unique in your project – we recommend making it descriptive and unique.

### The `run` function

Your custom code inside `run()` will be executed when your task is triggered. It’s an async function that has two arguments:

1.  The run payload - the data that you pass to the task when you trigger it.
2.  An object with `ctx` about the run (Context), and any output from the optional `init` function that runs before every run attempt.

Anything you return from the `run` function will be the result of the task. Data you return must be JSON serializable: strings, numbers, booleans, arrays, objects, and null.

### `retry` options

A task is retried if an error is thrown, by default we retry 3 times.

You can set the number of retries and the delay between retries in the `retry` field:

For more information read [the retrying guide](https://trigger.dev/docs/errors-retrying).

It’s also worth mentioning that you can [retry a block of code](https://trigger.dev/docs/errors-retrying) inside your tasks as well.

### `queue` options

Queues allow you to control the concurrency of your tasks. This allows you to have one-at-a-time execution and parallel executions. There are also more advanced techniques like having different concurrencies for different sets of your users. For more information read [the concurrency & queues guide](https://trigger.dev/docs/queue-concurrency).

/trigger/one-at-a-time.ts

### `machine` options

Some tasks require more vCPUs or GBs of RAM. You can specify these requirements in the `machine` field. For more information read [the machines guide](https://trigger.dev/docs/machines).

### `maxDuration` option

By default tasks can execute indefinitely, which can be great! But you also might want to set a `maxDuration` to prevent a task from running too long. You can set the `maxDuration` on a task, and all runs of that task will be stopped if they exceed the duration.

See our [maxDuration guide](https://trigger.dev/docs/runs/max-duration) for more information.

Lifecycle functions
-------------------

![Lifecycle functions](https://i3.wp.com/mintlify.s3.us-west-1.amazonaws.com/trigger/images/lifecycle-functions.png)

### `init` function

This function is called before a run attempt:

You can also return data from the `init` function that will be available in the params of the `run`, `cleanup`, `onSuccess`, and `onFailure` functions.

### `cleanup` function

This function is called after the `run` function is executed, regardless of whether the run was successful or not. It’s useful for cleaning up resources, logging, or other side effects.

### `middleware` function

This function is called before the `run` function, it allows you to wrap the run function with custom code.

### `onStart` function

When a task run starts, the `onStart` function is called. It’s useful for sending notifications, logging, and other side effects. This function will only be called one per run (not per retry). If you want to run code before each retry, use the `init` function.

You can also define an `onStart` function in your `trigger.config.ts` file to get notified when any task starts.

### `onSuccess` function

When a task run succeeds, the `onSuccess` function is called. It’s useful for sending notifications, logging, syncing state to your database, or other side effects.

You can also define an `onSuccess` function in your `trigger.config.ts` file to get notified when any task succeeds.

### `onFailure` function

When a task run fails, the `onFailure` function is called. It’s useful for sending notifications, logging, or other side effects. It will only be executed once the task run has exhausted all its retries.

You can also define an `onFailure` function in your `trigger.config.ts` file to get notified when any task fails.

### `handleError` functions

You can define a function that will be called when an error is thrown in the `run` function, that allows you to control how the error is handled and whether the task should be retried.

Read more about `handleError` in our [Errors and Retrying guide](https://trigger.dev/docs/errors-retrying).

Next steps
----------
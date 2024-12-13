Triggering
==========

Trigger functions
-----------------

Trigger tasks **from your backend**:

| Function | What it does |  |
| --- | --- | --- |
| `tasks.trigger()` | Triggers a task and returns a handle you can use to fetch and manage the run. | [Docs](https://trigger.dev/docs/triggering#tasks-trigger) |
| `tasks.batchTrigger()` | Triggers a single task in a batch and returns a handle you can use to fetch and manage the runs. | [Docs](https://trigger.dev/docs/triggering#tasks-batchtrigger) |
| `tasks.triggerAndPoll()` | Triggers a task and then polls the run until it’s complete. | [Docs](https://trigger.dev/docs/triggering#tasks-triggerandpoll) |
| `batch.trigger()` | Similar to `tasks.batchTrigger` but allows running multiple different tasks | [Docs](https://trigger.dev/docs/triggering#batch-trigger) |

Trigger tasks **from inside a another task**:

| Function | What it does |  |
| --- | --- | --- |
| `yourTask.trigger()` | Triggers a task and gets a handle you can use to monitor and manage the run. It does not wait for the result. | [Docs](https://trigger.dev/docs/triggering#yourtask-trigger) |
| `yourTask.batchTrigger()` | Triggers a task multiple times and gets a handle you can use to monitor and manage the runs. It does not wait for the results. | [Docs](https://trigger.dev/docs/triggering#yourtask-batchtrigger) |
| `yourTask.triggerAndWait()` | Triggers a task and then waits until it’s complete. You get the result data to continue with. | [Docs](https://trigger.dev/docs/triggering#yourtask-triggerandwait) |
| `yourTask.batchTriggerAndWait()` | Triggers a task multiple times in parallel and then waits until they’re all complete. You get the resulting data to continue with. | [Docs](https://trigger.dev/docs/triggering#yourtask-batchtriggerandwait) |
| `batch.triggerAndWait()` | Similar to `batch.trigger` but will wait on the triggered tasks to finish and return the results. | [Docs](https://trigger.dev/docs/triggering#batch-triggerandwait) |
| `batch.triggerByTask()` | Similar to `batch.trigger` but allows passing in task instances instead of task IDs. | [Docs](https://trigger.dev/docs/triggering#batch-triggerbytask) |
| `batch.triggerByTaskAndWait()` | Similar to `batch.triggerbyTask` but will wait on the triggered tasks to finish and return the results. | [Docs](https://trigger.dev/docs/triggering#batch-triggerbytaskandwait) |

Triggering from your backend
----------------------------

When you trigger a task from your backend code, you need to set the `TRIGGER_SECRET_KEY` environment variable. You can find the value on the API keys page in the Trigger.dev dashboard. [More info on API keys](https://trigger.dev/docs/apikeys).

### tasks.trigger()

Triggers a single run of a task with the payload you pass in, and any options you specify, without needing to import the task.

You can pass in options to the task using the second argument:

### tasks.batchTrigger()

Triggers multiple runs of a single task with the payloads you pass in, and any options you specify, without needing to import the task.

You can pass in options to the `batchTrigger` function using the second argument:

You can also pass in options for each run in the batch:

### tasks.triggerAndPoll()

Triggers a single run of a task with the payload you pass in, and any options you specify, and then polls the run until it’s complete.

### batch.trigger()

Triggers multiple runs of different tasks with the payloads you pass in, and any options you specify. This is useful when you need to trigger multiple tasks at once.

Triggering from inside another task
-----------------------------------

The following functions should only be used when running inside a task, for one of the following reasons:

*   You need to **wait** for the result of the triggered task.
*   You need to import the task instance. Importing a task instance from your backend code is not recommended, as it can pull in a lot of unnecessary code and dependencies.

### yourTask.trigger()

Triggers a single run of a task with the payload you pass in, and any options you specify.

To pass options to the triggered task, you can use the second argument:

### yourTask.batchTrigger()

Triggers multiple runs of a single task with the payloads you pass in, and any options you specify.

If you need to pass options to `batchTrigger`, you can use the second argument:

You can also pass in options for each run in the batch:

### yourTask.triggerAndWait()

This is where it gets interesting. You can trigger a task and then wait for the result. This is useful when you need to call a different task and then use the result to continue with your task.

The `result` object is a “Result” type that needs to be checked to see if the child task run was successful:

If instead you just want to get the output of the child task, and throw an error if the child task failed, you can use the `unwrap` method:

You can also catch the error if the child task fails and get more information about the error:

### yourTask.batchTriggerAndWait()

You can batch trigger a task and wait for all the results. This is useful for the fan-out pattern, where you need to call a task multiple times and then wait for all the results to continue with your task.

### batch.triggerAndWait()

You can batch trigger multiple different tasks and wait for all the results:

### batch.triggerByTask()

You can batch trigger multiple different tasks by passing in the task instances. This function is especially useful when you have a static set of tasks you want to trigger:

### batch.triggerByTaskAndWait()

You can batch trigger multiple different tasks by passing in the task instances, and wait for all the results. This function is especially useful when you have a static set of tasks you want to trigger:

Triggering from your frontend
-----------------------------

If you want to trigger a task directly from a frontend application, you can use our [React hooks](https://trigger.dev/docs/frontend/react-hooks/triggering).

Options
-------

All of the above functions accept an options object:

The following options are available:

### `delay`

When you want to trigger a task now, but have it run at a later time, you can use the `delay` option:

Runs that are delayed and have not been enqueued yet will display in the dashboard with a “Delayed” status:

![Delayed run in the dashboard](https://i3.wp.com/mintlify.s3.us-west-1.amazonaws.com/trigger/images/delayed-runs.png)

You can cancel a delayed run using the `runs.cancel` SDK function:

You can also reschedule a delayed run using the `runs.reschedule` SDK function:

The `delay` option is also available when using `batchTrigger`:

### `ttl`

You can set a TTL (time to live) when triggering a task, which will automatically expire the run if it hasn’t started within the specified time. This is useful for ensuring that a run doesn’t get stuck in the queue for too long.

When a run is expired, it will be marked as “Expired” in the dashboard:

![Expired runs in the dashboard](https://i3.wp.com/mintlify.s3.us-west-1.amazonaws.com/trigger/images/expired-runs.png)

When you use both `delay` and `ttl`, the TTL will start counting down from the time the run is enqueued, not from the time the run is triggered.

So for example, when using the following code:

The timeline would look like this:

1.  The run is created at 12:00:00
2.  The run is enqueued at 12:10:00
3.  The TTL starts counting down from 12:10:00
4.  If the run hasn’t started by 13:10:00, it will be expired

For this reason, the `ttl` option only accepts durations and not absolute timestamps.

### `idempotencyKey`

You can provide an `idempotencyKey` to ensure that a task is only triggered once with the same key. This is useful if you are triggering a task within another task that might be retried:

For more information, see our [Idempotency](https://trigger.dev/docs/idempotency) documentation.

### `idempotencyKeyTTL`

Idempotency keys automatically expire after 30 days, but you can set a custom TTL for an idempotency key when triggering a task:

For more information, see our [Idempotency](https://trigger.dev/docs/idempotency) documentation.

### `queue`

When you trigger a task you can override the concurrency limit. This is really useful if you sometimes have high priority runs.

The task:

/trigger/override-concurrency.ts

Triggering from your backend and overriding the concurrency:

### `concurrencyKey`

If you’re building an application where you want to run tasks for your users, you might want a separate queue for each of your users. (It doesn’t have to be users, it can be any entity you want to separately limit the concurrency for.)

You can do this by using `concurrencyKey`. It creates a separate queue for each value of the key.

Your backend code:

### `maxAttempts`

You can set the maximum number of attempts for a task run. If the run fails, it will be retried up to the number of attempts you specify.

This will override the `retry.maxAttempts` value set in the task definition.

### `tags`

View our [tags doc](https://trigger.dev/docs/tags) for more information.

### `metadata`

View our [metadata doc](https://trigger.dev/docs/runs/metadata) for more information.

### `maxDuration`

View our [maxDuration doc](https://trigger.dev/docs/runs/max-duration) for more information.

Large Payloads
--------------

We recommend keeping your task payloads as small as possible. We currently have a hard limit on task payloads above 10MB.

If your payload size is larger than 512KB, instead of saving the payload to the database, we will upload it to an S3-compatible object store and store the URL in the database.

When your task runs, we automatically download the payload from the object store and pass it to your task function. We also will return to you a `payloadPresignedUrl` from the `runs.retrieve` SDK function so you can download the payload if needed:

If you need to pass larger payloads, you’ll need to upload the payload to your own storage and pass a URL to the file in the payload instead. For example, uploading to S3 and then sending a presigned URL that expires in URL:

### Batch Triggering

When using triggering a batch, the total size of all payloads cannot exceed 1MB. This means if you are doing a batch of 100 runs, each payload should be less than 100KB. The max batch size is 500 runs.
schemaTask
==========

The `schemaTask` function allows you to define a task with a runtime payload schema. This schema is used to validate the payload before running the task or when triggering a task directly. If the payload does not match the schema, the task will not execute.

Usage
-----

`schemaTask` takes all the same options as [task](https://trigger.dev/docs/tasks/overview), with the addition of a `schema` field. The `schema` field is a schema parser function from a schema library or or a custom parser function.

When you trigger the task directly, the payload will be validated against the schema before the [run](https://trigger.dev/docs/runs) is created:

The error thrown when the payload does not match the schema will be the same as the error thrown by the schema parser function. For example, if you are using Zod, the error will be a `ZodError`.

We will also validate the payload every time before the task is run, so you can be sure that the payload is always valid. In the example above, the task would fail with a `TaskPayloadParsedError` error and skip retrying if the payload does not match the schema.

Input/output schemas
--------------------

Certain schema libraries, like Zod, split their type inference into “schema in” and “schema out”. This means that you can define a single schema that will produce different types when triggering the task and when running the task. For example, you can define a schema that has a default value for a field, or a string coerced into a date:

In this case, the trigger payload type is `{ name?: string, age: number; dob: string }`, but the run payload type is `{ name: string, age: number; dob: Date }`. So you can trigger the task with a payload like this:

Supported schema types
----------------------

### Zod

You can use the [Zod](https://zod.dev/) schema library to define your schema. The schema will be validated using Zod’s `parse` function.

### Yup

### Superstruct

### ArkType

### @effect/schema

### runtypes

### valibot

### typebox

### Custom parser function

You can also define a custom parser function that will be called with the payload before the task is run. The parser function should return the parsed payload or throw an error if the payload is invalid.
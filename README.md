<h1 align="center">
  <p>@pipeletteio/debug</p>
</h1>

<p align="center">A simple debug module</p>

<p align="center">
  <a alt="Build Status" href="https://github.com/pipeletteio/debug/actions?query=workflow">
    <img src="https://github.com/pipeletteio/debug/workflows/Build/badge.svg"/>
  </a>
  <a alt="Npm version" href="https://www.npmjs.com/package/@pipeletteio/debug?activeTab=versions">
    <img src="https://img.shields.io/npm/v/@pipeletteio/debug.svg?longCache=true&logo=npm">
  </a>
  <a alt="CodeClimate coverage" href="https://codeclimate.com/github/pipeletteio/debug/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/1ac72c4eb77b963b343a/test_coverage"/>
  </a>
  <a alt="CodeClimate maintainability" href="https://codeclimate.com/github/pipeletteio/debug/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/1ac72c4eb77b963b343a/maintainability"/>
  </a>
  <a alt="Node requierement version" href="https://github.com/pipeletteio/debug/blob/master/package.json">
    <img src="https://img.shields.io/node/v/@pipeletteio/debug.svg?longCache=true"/>
  </a>
</p>

## Installation
```bash
npm install @pipeletteio/debug
```

## Example

```javascript
const { debug, Debug } = require('@pipeletteio/debug');

// Create a dedicated debugger.
const dedicatedDebug = new Debug('myDedicatedDebugName', { useNewMeter: true });

debug.title('title');
debug.question('question');
dedicatedDebug.done('done');

setTimeout(() => {
  debug.valid('valid');
  debug.invalid('invalid');
  dedicatedDebug.done('fail');
}, 500);

// -- Outputs:
// ❱ title +4ms
// ❓ question +2ms
// [myDedicatedDebugName] done +2ms
// ✔ valid +502ms
// ✗ invalid +1ms
// [myDedicatedDebugName] fail +503ms
```

## API

The methods of Console.prototype are exposed to Debug instance.

#### Debug.prototype.fail

Write a formatted message to stderr.

|          argument         |    type    |    details    |
|---------------------------|------------|---------------|
| arg                       | `string`   | The message.  |

Return `void`.

#### Debug.prototype.done

Write a formatted message to stdout.

|          argument         |    type    |    details    |
|---------------------------|------------|---------------|
| arg                       | `string`   | The message.  |

Return `void`.

#### Debug.prototype.invalid

Write a formatted message prefixed with an invalid check symbol to stderr.

|          argument         |    type    |    details    |
|---------------------------|------------|---------------|
| arg                       | `string`   | The message.  |

Return `void`.

#### Debug.prototype.valid

Write a formatted message prefixed with a valid check symbol to stdout.

|          argument         |    type    |    details    |
|---------------------------|------------|---------------|
| arg                       | `string`   | The message.  |

Return `void`.

#### Debug.prototype.question

Write a formatted message prefixed with an interogation symbol to stdout.

|          argument         |    type    |    details    |
|---------------------------|------------|---------------|
| arg                       | `string`   | The message.  |

Return `void`.

#### Debug.prototype.title

Write a formatted message prefixed with a chevron symbol to stdout.

|          argument         |    type    |    details    |
|---------------------------|------------|---------------|
| arg                       | `string`   | The message.  |

Return `void`.

#### Debug.constructor

A Debug constructor that can be used to create dedicated debug.

|          argument         |                 type                |                details                |
|---------------------------|-------------------------------------|---------------------------------------|
| name                      | `string` or `null` or `undefined`   | The dedicated debug name (optional).  |
| options                   | `object`                            | The debug options (default = {}).     |
| options.useNewMeter       | `boolean` or `null` or `undefined`  | The debug options (default = {}).     |

Return `Debug` instance.

Example:
```javascript
new Debug('name', { useNewMeter: true });
```

## Env variables:

All methods can be disabled using environment variables.

Importance order:
```
  1. PIPELETTEIO_DEBUG = (true | false)
  2. (DEBUG | NDEBUG | NODE_DEBUG) = (true | false)
  3. (CI | CONTINUOUS_INTEGRATION) != undefined
  4. NODE_ENV = (production | test)
```

# @speleotica/compass

[![CircleCI](https://circleci.com/gh/speleotica/compass.svg?style=svg)](https://circleci.com/gh/speleotica/compass)
[![Coverage Status](https://codecov.io/gh/speleotica/compass/branch/master/graph/badge.svg)](https://codecov.io/gh/speleotica/compass)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40speleotica%2Fcompass.svg)](https://badge.fury.io/js/%40speleotica%2Fcompass)

Types and I/O methods for Compass Cave Survey data file formats

I'm not going to go to much trouble to document it here unless people ask,
the types are pretty self-explanatory:

- [`CompassTrip`](/src/dat/CompassTrip.ts)
- [`CompassShot`](/src/dat/CompssShot.ts)
- [`CompassDatFile`](/src/dat/CompssDatFile.ts)
- [`CompassMakFile`](/src/mak/CompassMakFile.ts)

## [`formatCompassDatFile`](/src/dat/formatCompassDatFile.ts)

```js
import { formatCompassDatFile } from '@speleotica/compass/dat'
```

It takes a `CompassDatFile`, and optionally an options hash with a `write` function.
If you don't provide `write`, it will return the output as a `string`. Otherwise,
it will call `write` with chunks of data, so you can pass `write` connected to a
file write stream.

## [`formatCompassMakFile`](/src/mak/CompassMakFile.ts)

```js
import { formatCompassMakFile } from '@speleotica/compass/mak'
```

It takes a `CompassMakFile`, and optionally an options hash with a `write` function.
If you don't provide `write`, it will return the output as a `string`. Otherwise,
it will call `write` with chunks of data, so you can pass `write` connected to a
file write stream.

## [`parseCompassMakFile`](/src/mak/CompassMakFile.ts)

```js
import { parseCompassMakFile } from '@speleotica/compass/mak'
```

Takes a `SegmentParser` and returns the parsed `CompassMakFile`.
Throws if there are any parse errors.

## [`parseCompassDatFile`](/src/mak/CompassMakFile.ts)

```js
import { parseCompassDatFile } from '@speleotica/compass/dat'
```

### Signature

```
async function parseCompassDatFile(
  file: string,
  lines: AsyncIterable<string>
): Promise<CompassDatFile>
```

# Node API

## `writeCompassDatFile(file: string, data: CompassDatFile): Promise<void>`

```js
import { writeCompassDatFile } from '@speleotica/compass/node'
```

Writes Compass survey data to the given file.

## `writeCompassMakFile(file: string, data: CompassMakFile): Promise<void>`

```js
import { writeCompassMakFile } from '@speleotica/compass/node'
```

Writes Compass project data to the given file.

## `parseCompassMakFile(file: string): Promise<CompassMakFile>`

```js
import { parseCompassMakFile } from '@speleotica/compass/node'
```

Parses a Compass project file.

## `parseCompassDatFile(file: string): Promise<CompassDatFile>`

```js
import { parseCompassDatFile } from '@speleotica/compass/node'
```

Parses a Compass survey file.

## `parseCompassMakAndDatFiles(file: string, task?: Task): Promise<CompassMakFile>`

```js
import { parseCompassMakAndDatFiles } from '@speleotica/compass/node'
```

Parses a Compass project file, then parses all of the linked survey files in it.
All dat file directives in the result will have their `data` property set to the
parsed `CompassDatFile` data.

### The `Task` interface`

This allows you to receive progress notifications or cancel the parsing.

#### `onProgress(progress: {message?: string, completed?: number, total?: number}): any`

The function will call this method with progress updates. Not all fields may be set at the same time.

#### `canceled: boolean`

If you set this to `true`, the function will reject with a `canceled` `Error`.

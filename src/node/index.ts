import formatCompassDatFile from '../dat/formatCompassDatFile'
import _parseCompassDatFile from '../dat/parseCompassDatFile'
import {
  formatCompassMakFile,
  parseCompassMakFile as _parseCompassMakFile,
  CompassMakFile,
} from '../mak/CompassMakFile'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { SegmentParser, Segment } from 'parse-segment'
import { CompassMakDirectiveType } from '../mak'
import { PassThrough } from 'stream'
import * as iconv from 'iconv-lite'

const convertWrite = <D>(
  format: (dat: D, options: { write: (data: string) => any }) => void
) => async (file: string, dat: D): Promise<void> => {
  const fileOut = fs.createWriteStream(file)
  const out = iconv.encodeStream('win1252')
  out.pipe(fileOut)
  format(dat, { write: out.write.bind(out) })
  const finished = new Promise((resolve, reject) => {
    fileOut.once('finish', resolve)
    fileOut.once('error', reject)
  })
  out.end()
  await finished
}

export const writeCompassDatFile = convertWrite(formatCompassDatFile)
export const writeCompassMakFile = convertWrite(formatCompassMakFile)

const convertParse = <D>(parse: (parser: SegmentParser) => D) => async (
  file: string
): Promise<D> => {
  const data = iconv.decode(
    await promisify<Buffer>(cb => fs.readFile(file, cb))(),
    'win1252'
  )
  return parse(new SegmentParser(new Segment({ value: data, source: file })))
}

export const parseCompassMakFile = convertParse(_parseCompassMakFile)

function linesOf(file: string, encoding: string): AsyncIterable<string> {
  const fileIn = fs.createReadStream(file)
  const decodedIn = iconv.decodeStream(encoding)
  fileIn.pipe(decodedIn)
  const rl = readline.createInterface(decodedIn)
  if (rl[Symbol.asyncIterator]) {
    return rl
  }
  const output = new PassThrough({ objectMode: true })
  rl.on('line', line => {
    output.write(line)
  })
  rl.on('close', () => {
    output.end()
  })
  return output
}

const convertParseLines = <D>(
  parse: (file: string, lines: AsyncIterable<string>) => D
) => async (file: string): Promise<D> => {
  const lines = linesOf(file, 'win1252')
  return await parse(file, lines)
}

export const parseCompassDatFile = convertParseLines(_parseCompassDatFile)

export type Progress = {
  message?: string
  completed?: number
  total?: number
}

export interface Task {
  onProgress(progress: Progress): any
  canceled: boolean
}

const dummyTask: Task = {
  onProgress() {
    // noop
  },
  canceled: false,
}

export async function parseCompassMakAndDatFiles(
  makFile: string,
  task: Task = dummyTask
): Promise<CompassMakFile> {
  task.onProgress({ message: `Reading ${makFile}` })
  const mak = await parseCompassMakFile(makFile)
  if (task.canceled) throw new Error('canceled')
  let total = 0
  for (const directive of mak.directives) {
    if (directive.type === CompassMakDirectiveType.DatFile) {
      const datFile = path.resolve(path.dirname(makFile), directive.file)
      const stats = await promisify<fs.Stats>(cb => fs.stat(datFile, cb))()
      total += stats.size
    }
  }
  let completed = 0
  async function* lines(datFile: string): AsyncIterable<string> {
    for await (const line of linesOf(datFile, 'win1252')) {
      yield line
      if (task.canceled) throw new Error('canceled')
      completed += line.length + 2 // add 2 for \r\n
      task.onProgress({ completed, total })
    }
  }
  for (const directive of mak.directives) {
    if (task.canceled) throw new Error('canceled')
    if (directive.type === CompassMakDirectiveType.DatFile) {
      const datFile = path.resolve(path.dirname(makFile), directive.file)
      task.onProgress({ message: `Reading ${datFile}`, completed, total })
      directive.data = await _parseCompassDatFile(datFile, lines(datFile))
    }
  }
  return mak
}

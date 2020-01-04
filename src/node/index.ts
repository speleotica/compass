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

const convertWrite = <D>(
  format: (dat: D, options: { write: (data: string) => any }) => void
) => async (file: string, dat: D): Promise<void> => {
  const out = fs.createWriteStream(file, 'ASCII')
  format(dat, { write: out.write.bind(out) })
  await promisify(cb => out.end(cb))()
}

export const writeCompassDatFile = convertWrite(formatCompassDatFile)
export const writeCompassMakFile = convertWrite(formatCompassMakFile)

const convertParse = <D>(parse: (parser: SegmentParser) => D) => async (
  file: string
): Promise<D> => {
  const data = await promisify<string>(cb => fs.readFile(file, 'ASCII', cb))()
  return parse(new SegmentParser(new Segment({ value: data, source: file })))
}

export const parseCompassMakFile = convertParse(_parseCompassMakFile)

const convertParseLines = <D>(
  parse: (file: string, lines: AsyncIterable<string>) => D
) => async (file: string): Promise<D> => {
  const lines = readline.createInterface(fs.createReadStream(file, 'ASCII'))
  return await parse(file, lines)
}

export const parseCompassDatFile = convertParseLines(_parseCompassDatFile)

type Progress = {
  message?: string
  completed?: number
  total?: number
}

interface Task {
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
    for await (const line of readline.createInterface(
      fs.createReadStream(datFile, 'ASCII')
    )) {
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

import formatCompassDatFile from '../dat/formatCompassDatFile'
import _parseCompassDatFile from '../dat/parseCompassDatFile'
import {
  formatCompassMakFile,
  parseCompassMakFile as _parseCompassMakFile,
} from '../mak/CompassMakFile'
import { promisify } from 'util'
import fs from 'fs'
import readline from 'readline'
import { SegmentParser, Segment } from 'parse-segment'

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

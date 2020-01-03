import formatCompassDatFile from '../dat/formatCompassDatFile'
import {
  formatCompassMakFile,
  parseCompassMakFile as _parseCompassMakFile,
} from '../mak/CompassMakFile'
import { promisify } from 'util'
import fs from 'fs'
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
  const data = await promisify<string>(cb => fs.readFile(file, 'utf8', cb))()
  return parse(new SegmentParser(new Segment({ value: data, source: file })))
}

export const parseCompassMakFile = convertParse(_parseCompassMakFile)

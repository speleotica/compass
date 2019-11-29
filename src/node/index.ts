import formatCompassDatFile from '../dat/formatCompassDatFile'
import { formatCompassMakFile } from '../mak/CompassMakFile'
import { promisify } from 'util'
import fs from 'fs'

const convert = <D>(
  format: (dat: D, options: { write: (data: string) => any }) => void
) => async (file: string, dat: D): Promise<void> => {
  const out = fs.createWriteStream(file, 'ASCII')
  format(dat, { write: out.write.bind(out) })
  await promisify(cb => out.end(cb))()
}

export const writeCompassDatFile = convert(formatCompassDatFile)
export const writeCompassMakFile = convert(formatCompassMakFile)

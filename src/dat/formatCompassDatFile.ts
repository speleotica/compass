import { UnitType, Angle } from '@speleotica/unitized'
import formatCompassTripHeader from './formatCompassTripHeader'
import formatCompassShot from './formatCompassShot'
import { CompassDatFile } from './CompassDatFile'

export default function formatCompassDatFile<Inc extends UnitType<Inc> = Angle>(
  dat: CompassDatFile
): string
export default function formatCompassDatFile<Inc extends UnitType<Inc> = Angle>(
  dat: CompassDatFile,
  options: { write: (data: string) => any }
): void
export default function formatCompassDatFile<Inc extends UnitType<Inc> = Angle>(
  dat: CompassDatFile,
  options?: {
    write: (data: string) => any
  }
): string | void {
  if (options && options.write) {
    for (const { header, shots } of dat.trips) {
      options.write(formatCompassTripHeader(header))
      const formatShot = formatCompassShot(header)
      shots.forEach((shot) => options.write(formatShot(shot)))
      options.write('\f\r\n')
    }
  } else {
    const chunks: Array<string> = []
    formatCompassDatFile(dat, { write: (data: string) => chunks.push(data) })
    return chunks.join('')
  }
}

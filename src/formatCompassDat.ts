import { UnitType, Angle } from '@speleotica/unitized'
import { CompassTrip } from './CompassTrip'
import formatCompassTripHeader from './formatCompassTripHeader'
import formatCompassShot from './formatCompassShot'

export default function formatCompassDat<
  Inc extends UnitType<Inc> = Angle
>(options: { trips: Array<CompassTrip> }): string
export default function formatCompassDat<
  Inc extends UnitType<Inc> = Angle
>(options: { trips: Array<CompassTrip>; write: (data: string) => any }): void
export default function formatCompassDat<Inc extends UnitType<Inc> = Angle>({
  trips,
  write,
}: {
  trips: Array<CompassTrip>
  write?: (data: string) => any
}): string | void {
  if (write) {
    for (const { header, shots } of trips) {
      write(formatCompassTripHeader(header))
      const formatShot = formatCompassShot(header)
      shots.forEach(shot => write(formatShot(shot)))
      write('\f\r\n')
    }
  } else {
    const chunks: Array<string> = []
    formatCompassDat({ trips, write: (data: string) => chunks.push(data) })
    return chunks.join('')
  }
}

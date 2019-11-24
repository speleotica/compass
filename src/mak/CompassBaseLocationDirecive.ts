import { UnitizedNumber, Length, Angle } from '@speleotica/unitized'
import { CompassMakDirectiveType } from './CompassMakDirective'

export type CompassBaseLocationDirective = {
  type: CompassMakDirectiveType.BaseLocation
  utmEasting: UnitizedNumber<Length>
  utmNorthing: UnitizedNumber<Length>
  elevation: UnitizedNumber<Length>
  utmZone: number
  utmConvergenceAngle: UnitizedNumber<Angle>
}

export function formatCompassBaseLocationDirective({
  type,
  utmEasting,
  utmNorthing,
  elevation,
  utmZone,
  utmConvergenceAngle,
}: CompassBaseLocationDirective): string {
  const parts = [
    utmEasting.get(Length.meters).toFixed(3),
    utmNorthing.get(Length.meters).toFixed(3),
    elevation.get(Length.meters).toFixed(3),
    utmZone,
    utmConvergenceAngle.get(Angle.degrees).toFixed(3),
  ]
  return `${type}${parts.join(',')};\r\n`
}

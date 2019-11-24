import { CompassMakDirectiveType } from './CompassMakDirective'
import { UnitizedNumber, Angle } from '@speleotica/unitized'

export type CompassUtmConvergenceAngleDirective = {
  type: CompassMakDirectiveType.UtmConvergenceAngle
  utmConvergenceAngle: UnitizedNumber<Angle>
}

export function formatCompassUtmConvergenceAngleDirective({
  type,
  utmConvergenceAngle,
}: CompassUtmConvergenceAngleDirective): string {
  return `${type}${utmConvergenceAngle.get(Angle.degrees).toFixed(3)};\r\n`
}

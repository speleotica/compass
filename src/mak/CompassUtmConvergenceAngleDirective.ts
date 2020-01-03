import { CompassMakDirectiveType } from './CompassMakDirective'
import { UnitizedNumber, Angle, Unitize } from '@speleotica/unitized'
import { SegmentParser, SegmentParseError } from 'parse-segment'

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

export function parseCompassUtmConvergenceAngleDirective(
  parser: SegmentParser
): CompassUtmConvergenceAngleDirective {
  parser.expect(CompassMakDirectiveType.UtmConvergenceAngle)
  const convergenceSegment = parser
    .nextDelimited(/;/, 'missing ; at end of directive')
    .trim()
  const angleDegrees = Number(convergenceSegment.toString())
  const utmConvergenceAngle = Unitize.degrees(angleDegrees)
  if (
    !convergenceSegment.length ||
    !utmConvergenceAngle.isFinite ||
    angleDegrees < -45 ||
    angleDegrees > 45
  ) {
    throw new SegmentParseError('invalid convergence angle', convergenceSegment)
  }
  return {
    type: CompassMakDirectiveType.UtmConvergenceAngle,
    utmConvergenceAngle,
  }
}

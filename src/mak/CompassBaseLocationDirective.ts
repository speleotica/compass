import { UnitizedNumber, Length, Angle, Unitize } from '@speleotica/unitized'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, SegmentParseError } from 'parse-segment'

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

export function parseCompassBaseLocationDirective(
  parser: SegmentParser
): CompassBaseLocationDirective {
  parser.expect(CompassMakDirectiveType.BaseLocation)
  const rest = parser.nextDelimited(/;/, 'missing ; at end of directive')

  const segments = rest.trim().split(/\s*,\s*/g)
  if (segments[5])
    throw new SegmentParseError(
      'excess field after convergence angle',
      segments[5].charAt(0)
    )

  if (!segments[0] || !segments[0].length)
    throw new SegmentParseError('missing easting', rest.charAt(rest.length))
  const utmEasting = Unitize.meters(Number(segments[0]))
  if (!utmEasting.isFinite)
    throw new SegmentParseError('invalid easting', segments[0])

  if (!segments[1] || !segments[1].length)
    throw new SegmentParseError('missing northing', rest.charAt(rest.length))
  const utmNorthing = Unitize.meters(Number(segments[1]))
  if (!utmNorthing.isFinite)
    throw new SegmentParseError('invalid northing', segments[1])

  if (!segments[2] || !segments[2].length)
    throw new SegmentParseError('missing elevation', rest.charAt(rest.length))
  const elevation = Unitize.meters(Number(segments[2]))
  if (!elevation.isFinite)
    throw new SegmentParseError('invalid elevation', segments[2])

  if (!segments[3] || !segments[3].length)
    throw new SegmentParseError('missing UTM zone', rest.charAt(rest.length))
  const utmZone = Number(segments[3].toString())
  if (isNaN(utmZone) || utmZone < 1 || utmZone > 60 || utmZone % 1) {
    throw new SegmentParseError('invalid UTM zone', segments[3])
  }

  if (!segments[4] || !segments[4].length)
    throw new SegmentParseError(
      'missing convergence angle',
      rest.charAt(rest.length)
    )
  const convergenceDegrees = Number(segments[4].toString())
  const utmConvergenceAngle = Unitize.degrees(convergenceDegrees)
  if (
    !utmConvergenceAngle.isFinite ||
    convergenceDegrees < -45 ||
    convergenceDegrees > 45
  ) {
    throw new SegmentParseError('invalid convergence angle', segments[4])
  }

  return {
    type: CompassMakDirectiveType.BaseLocation,
    utmEasting,
    utmNorthing,
    elevation,
    utmZone,
    utmConvergenceAngle,
  }
}

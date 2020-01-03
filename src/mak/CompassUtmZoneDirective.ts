import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, SegmentParseError } from 'parse-segment'

export type CompassUtmZoneDirective = {
  type: CompassMakDirectiveType.UtmZone
  utmZone: number
}

export function formatCompassUtmZoneDirective({
  type,
  utmZone,
}: CompassUtmZoneDirective): string {
  return `${type}${utmZone};\r\n`
}

export function parseCompassUtmZoneDirective(
  parser: SegmentParser
): CompassUtmZoneDirective {
  parser.expect(CompassMakDirectiveType.UtmZone)
  const zoneSegment = parser
    .nextDelimited(/;/, 'missing ; at end of directive')
    .trim()
  const utmZone = Number(zoneSegment.toString())
  if (isNaN(utmZone) || utmZone < 1 || utmZone > 60 || utmZone % 1) {
    throw new SegmentParseError('invalid UTM zone', zoneSegment)
  }
  return {
    type: CompassMakDirectiveType.UtmZone,
    utmZone,
  }
}

import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParseError, SegmentParser } from 'parse-segment'

export type CompassDatumDirective = {
  type: CompassMakDirectiveType.Datum
  datum: string
}

export function formatCompassDatumDirective({
  type,
  datum,
}: CompassDatumDirective): string {
  return `${type}${datum};\r\n`
}

export function parseCompassDatumDirective(
  parser: SegmentParser
): CompassDatumDirective {
  parser.expect(CompassMakDirectiveType.Datum)
  const rest = parser.nextDelimited(/;/, 'missing ; at end of directive')
  const datum = rest.trim().toString()
  if (!datum.length) throw new SegmentParseError('missing datum', rest)
  return { type: CompassMakDirectiveType.Datum, datum }
}

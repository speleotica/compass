import { CompassMakDirectiveType } from './CompassMakDirective'
import { UnitizedNumber, Length, Unit } from '@speleotica/unitized'
import { assertValidStationName } from '../isValidStationName'
import { SegmentParser, SegmentParseError } from 'parse-segment'
import { CompassDatFile } from '../dat'

export type CompassLinkStation = {
  station: string
  location?: {
    easting: UnitizedNumber<Length>
    northing: UnitizedNumber<Length>
    elevation: UnitizedNumber<Length>
  } | null
}

export function formatCompassLinkStation({
  station,
  location,
}: CompassLinkStation): string {
  assertValidStationName(station)
  if (!location) return station
  const { easting, northing, elevation } = location
  const unit = easting.unit === Length.feet ? Length.feet : Length.meters
  const parts = [
    unit === Length.feet ? 'F' : 'M',
    easting.get(unit).toFixed(3),
    northing.get(unit).toFixed(3),
    elevation.get(unit).toFixed(3),
  ]
  return `${station}[${parts.join(',')}]`
}

export type CompassDatFileDirective = {
  type: CompassMakDirectiveType.DatFile
  file: string
  linkStations?: Array<CompassLinkStation> | null
  data?: CompassDatFile | null
}
export function formatCompassDatFileDirective({
  type,
  file,
  linkStations,
}: CompassDatFileDirective): string {
  if (!linkStations || !linkStations.length) return `${type}${file};\r\n`
  if (linkStations.length === 1)
    return `${type}${file},${formatCompassLinkStation(linkStations[0])};\r\n`
  return `${type}${file},\r\n  ${linkStations
    .map(formatCompassLinkStation)
    .join(',\r\n  ')};\r\n`
}

export function parseCompassLinkStation(
  parser: SegmentParser
): CompassLinkStation {
  const station = parser.match(/[^;,[]+/, 'missing station').segment.trim()
  if (!station.length) throw new SegmentParseError('missing station', station)
  if (!parser.skip(/\[/)) return { station: station.toString() }
  const rest = parser.nextDelimited(/]/, 'missing closing ]')
  const segments = rest.split(/\s*,\s*/g)

  if (!segments[0] || !segments[0].length)
    throw new SegmentParseError('missing unit', rest.charAt(rest.length))
  let unit: Unit<Length>
  switch (segments[0].charAt(0).toString()) {
    case 'f':
    case 'F':
      unit = Length.feet
      break
    case 'm':
    case 'M':
      unit = Length.meters
      break
    default:
      throw new SegmentParseError('invalid unit', segments[0])
  }

  if (!segments[1] || !segments[1].length)
    throw new SegmentParseError('missing easting', rest.charAt(rest.length))
  const easting = new UnitizedNumber(Number(segments[1].toString()), unit)
  if (!easting.isFinite)
    throw new SegmentParseError('invalid easting', segments[1])

  if (!segments[2] || !segments[2].length)
    throw new SegmentParseError('missing northing', rest.charAt(rest.length))
  const northing = new UnitizedNumber(Number(segments[2].toString()), unit)
  if (!northing.isFinite)
    throw new SegmentParseError('invalid northing', segments[2])

  if (!segments[3] || !segments[3].length)
    throw new SegmentParseError('missing elevation', rest.charAt(rest.length))
  const elevation = new UnitizedNumber(Number(segments[3].toString()), unit)
  if (!elevation.isFinite)
    throw new SegmentParseError('invalid elevation', segments[3])

  return {
    station: station.toString(),
    location: { easting, northing, elevation },
  }
}

export function parseCompassDatFileDirective(
  parser: SegmentParser
): CompassDatFileDirective {
  parser.expect(CompassMakDirectiveType.DatFile)
  const [file, rest] = parser
    .nextDelimited(/;/, 'missing ; at end of directive')
    .split(/,/, 2)
  if (!file.length) throw new SegmentParseError('missing filename', file)
  const linkStations = []
  if (rest) {
    if (!rest.trim().length) {
      throw new SegmentParseError('missing station', rest.charAt(0))
    }
    const linkParser = new SegmentParser(rest)
    do {
      linkStations.push(parseCompassLinkStation(linkParser))
    } while (linkParser.skip(/\s*,\s*/))
  }
  const directive: CompassDatFileDirective = {
    type: CompassMakDirectiveType.DatFile,
    file: file.toString(),
  }
  if (linkStations.length) directive.linkStations = linkStations
  return directive
}

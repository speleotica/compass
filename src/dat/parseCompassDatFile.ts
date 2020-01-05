import {
  CompassTrip,
  CompassTripHeader,
  AzimuthUnit,
  DistanceUnit,
  InclinationUnit,
  LrudItem,
  FrontsightItem,
  BacksightItem,
  LrudAssociation,
  CompassShot,
  CompassDatFile,
} from '.'
import { SegmentParseError, Segment, SegmentParser } from 'parse-segment'
import { UnitizedNumber, Angle, Unitize, Length } from '@speleotica/unitized'
import { flagChars } from './formatCompassShot'

let offs = 0
const CAVE_OFFSET = offs++
const SURVEY_NAME_OFFSET = offs++
const SURVEY_DATE_OFFSET = offs++
const SURVEY_TEAM_LABEL_OFFSET = offs++
const SURVEY_TEAM_OFFSET = offs++
const FORMAT_OFFSET = offs++
offs++
const COLUMN_HEADERS_OFFSET = offs++
offs++

const DATA_OFFSET = offs

export function numDaysInMonth(month: number, year: number): number {
  switch (month) {
    case 2:
      return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 29 : 28
    case 4:
    case 6:
    case 9:
    case 11:
      return 30
    default:
      return 31
  }
}

export function parseDate(dateSegment: Segment): Date {
  dateSegment = dateSegment.trim()
  const parts = dateSegment.split(/\s+/g)
  if (!dateSegment.length || !parts[0])
    throw new SegmentParseError(
      'missing month',
      dateSegment.charAt(dateSegment.length)
    )
  if (!parts[1])
    throw new SegmentParseError(
      'missing day',
      dateSegment.charAt(dateSegment.length)
    )
  if (!parts[2])
    throw new SegmentParseError(
      'missing year',
      dateSegment.charAt(dateSegment.length)
    )
  if (parts[3])
    throw new SegmentParseError('expected COMMENT: after date', parts[3])
  const month = parts[0].match(/^\d+$/) ? parseInt(parts[0].toString()) : 0
  const day = parts[1].match(/^\d+$/) ? parseInt(parts[1].toString()) : -1
  const year = parts[2].match(/^\d+$/) ? parseInt(parts[2].toString()) : -1
  if (month < 1 || month > 12) {
    throw new SegmentParseError('invalid month', parts[0])
  }
  if (year < 0) {
    throw new SegmentParseError('invalid year', parts[2])
  }
  if (day < 1 || day > numDaysInMonth(month, year)) {
    throw new SegmentParseError('invalid day', parts[1])
  }
  const date = new Date()
  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function parseLength(
  parser: SegmentParser,
  fieldName: string
): UnitizedNumber<Length> | undefined {
  const { segment } = parser.match(/\S+/, `missing ${fieldName}`)
  const value = Number(segment.toString())
  if (value < 0) return undefined
  if (isNaN(value)) {
    throw new SegmentParseError(`invalid ${fieldName}`, segment)
  }
  return Unitize.feet(value)
}

export function parseAzimuth(
  parser: SegmentParser,
  fieldName: string
): UnitizedNumber<Angle> | undefined {
  const { segment } = parser.match(/\S+/, `missing ${fieldName}`)
  const value = Number(segment.toString())
  if (value < -900) return undefined
  if (isNaN(value) || value < 0 || value > 360) {
    throw new SegmentParseError(`invalid ${fieldName}`, segment)
  }
  return Unitize.degrees(value)
}

export function parseInclination(
  parser: SegmentParser,
  fieldName: string
): UnitizedNumber<Angle> | undefined {
  const { segment } = parser.match(/\S+/, `missing ${fieldName}`)
  const value = Number(segment.toString())
  if (value < -900) return undefined
  if (isNaN(value) || value < -90 || value > 90) {
    throw new SegmentParseError(`invalid ${fieldName}`, segment)
  }
  return Unitize.degrees(value)
}

const parseFormatEnum = <V>(
  _enum: Record<any, V>,
  fieldName: string
): ((parser: SegmentParser) => V) => {
  const validValues: Set<V> = new Set(Object.values(_enum))
  return (parser: SegmentParser): V => {
    if (parser.isAtEndOfLine()) {
      throw new SegmentParseError(
        `missing ${fieldName}`,
        parser.segment.charAt(parser.index)
      )
    }
    const value = parser.currentChar()
    if (!validValues.has(value as any)) {
      throw new SegmentParseError(
        `invalid ${fieldName}`,
        parser.segment.charAt(parser.index)
      )
    }
    parser.index++
    return value as any
  }
}

const parseFormatEnums = <V>(
  _enum: Record<any, V>,
  fieldName: string
): ((parser: SegmentParser, count: number) => V[]) => {
  const baseParse = parseFormatEnum(_enum, fieldName)
  return (parser: SegmentParser, count: number): V[] => {
    const result: V[] = []
    while (count-- > 0) {
      const startIndex = parser.index
      const next = baseParse(parser)
      if (result.includes(next)) {
        throw new SegmentParseError(
          `duplicate ${fieldName}`,
          parser.segment.substring(startIndex, parser.index)
        )
      }
      result.push(next)
    }
    return result
  }
}

const parseAzimuthUnit = parseFormatEnum<AzimuthUnit>(
  AzimuthUnit,
  'azimuth unit'
)
const parseDistanceUnit = parseFormatEnum<DistanceUnit>(
  DistanceUnit,
  'distance unit'
)
const parseLrudUnit = parseFormatEnum<DistanceUnit>(DistanceUnit, 'lrud unit')
const parseInclinationUnit = parseFormatEnum<InclinationUnit>(
  InclinationUnit,
  'inclination unit'
)
const parseLrudItems = parseFormatEnums<LrudItem>(LrudItem, 'lrud item')
const parseFrontsightItems = parseFormatEnums<FrontsightItem>(
  FrontsightItem,
  'frontsight item'
)
const parseBacksightItems = parseFormatEnums<BacksightItem>(
  BacksightItem,
  'backsight item'
)
const parseLrudAssociation = parseFormatEnum<LrudAssociation>(
  LrudAssociation,
  'lrud association'
)

export function parseFormat(
  lineParser: SegmentParser,
  tripHeader: Partial<CompassTripHeader>
): void {
  const { segment } = lineParser.match(/\S+/, 'missing format')
  const parser = new SegmentParser(segment)
  tripHeader.azimuthUnit = parseAzimuthUnit(parser)
  tripHeader.distanceUnit = parseDistanceUnit(parser)
  tripHeader.lrudUnit = parseLrudUnit(parser)
  tripHeader.inclinationUnit = parseInclinationUnit(parser)
  tripHeader.lrudOrder = parseLrudItems(parser, 4) as [
    LrudItem,
    LrudItem,
    LrudItem,
    LrudItem
  ]
  tripHeader.frontsightOrder = parseFrontsightItems(parser, 3) as [
    FrontsightItem,
    FrontsightItem,
    FrontsightItem
  ]
  if (segment.length >= 15) {
    tripHeader.backsightOrder = parseBacksightItems(parser, 2) as [
      BacksightItem,
      BacksightItem
    ]
  }
  if (segment.length > 11) {
    tripHeader.hasRedundantBacksights =
      parser
        .match(/[bn]/i, 'missing redundant backsight item')[0]
        .toUpperCase() === 'B'
    if (segment.length > 12) {
      tripHeader.lrudAssociation = parseLrudAssociation(parser)
    }
  }
}

export async function* parseCompassDatFileBase(
  file: string,
  lines: AsyncIterable<string>
): AsyncIterable<CompassTrip> {
  let nextLineNumber = 0
  let tripStartLine = 0

  let tripHeader: Partial<CompassTripHeader> = {}
  let trip: CompassTrip = null as any

  for await (const line of lines) {
    const lineNumber = nextLineNumber++
    const offset = lineNumber - tripStartLine
    const lineSegment = new Segment({
      value: line,
      source: file,
      startLine: lineNumber,
      startCol: 0,
    })
    if (line[0] === '\f') {
      if (offset < DATA_OFFSET) {
        throw new SegmentParseError(
          'unexpected form feed before end of trip header',
          lineSegment
        )
      }
      tripStartLine = nextLineNumber
      tripHeader = {}
      yield trip
      trip = null as any
      continue
    }
    if (offset < DATA_OFFSET) {
      const parser = new SegmentParser(lineSegment)
      switch (offset) {
        case CAVE_OFFSET:
          tripHeader.cave = line.trim()
          break
        case SURVEY_NAME_OFFSET:
          parser.expectIgnoreCase('SURVEY NAME:')
          tripHeader.name = line.substring(parser.index).trim()
          break
        case SURVEY_DATE_OFFSET:
          parser.expectIgnoreCase('SURVEY DATE:')
          tripHeader.date = parseDate(
            parser.nextDelimited(/COMMENT:|$/i).trim()
          )
          tripHeader.comment = line.substring(parser.index).trim() || null
          break
        case SURVEY_TEAM_LABEL_OFFSET:
          parser.expectIgnoreCase('SURVEY TEAM:')
          break
        case SURVEY_TEAM_OFFSET:
          tripHeader.team = line.trim() || null
          break
        case FORMAT_OFFSET: {
          parser.expectIgnoreCase('DECLINATION:')
          parser.skip(/\s*/)
          tripHeader.declination = parseAzimuth(parser, 'declination')
          parser.skip(/\s*/)
          parser.expectIgnoreCase('FORMAT:')
          parser.skip(/\s*/)
          parseFormat(parser, tripHeader)
          parser.skip(/\s*/)
          if (parser.skip(/CORRECTIONS:/i)) {
            parser.skip(/\s*/)
            tripHeader.distanceCorrection = parseLength(
              parser,
              'distance correction'
            )
            parser.skip(/\s*/)
            tripHeader.frontsightAzimuthCorrection = parseAzimuth(
              parser,
              'azimuth correction'
            )
            parser.skip(/\s*/)
            tripHeader.frontsightInclinationCorrection = parseInclination(
              parser,
              'inclination correction'
            )
            parser.skip(/\s*/)
            if (parser.skip(/CORRECTIONS2:/i)) {
              parser.skip(/\s*/)
              tripHeader.backsightAzimuthCorrection = parseAzimuth(
                parser,
                'azimuth correction'
              )
              parser.skip(/\s*/)
              tripHeader.backsightInclinationCorrection = parseInclination(
                parser,
                'inclination correction'
              )
            }
          }
          break
        }
        case COLUMN_HEADERS_OFFSET:
          trip = { header: tripHeader as any, shots: [] }
          break
      }
      continue
    }

    const header = tripHeader as CompassTripHeader

    const parser = new SegmentParser(lineSegment)
    parser.skip(/\s*/)
    if (parser.isAtEndOfLine()) continue
    const from = parser.match(/\S+/, 'missing from station')[0]
    parser.skip(/\s*/)
    const to = parser.match(/\S+/, 'missing to station')[0]
    parser.skip(/\s*/)
    const distanceIndex = parser.index
    const distance = parseLength(parser, 'distance')
    if (!distance) {
      throw new SegmentParseError(
        'distance is required',
        lineSegment.substring(distanceIndex, parser.index)
      )
    }
    parser.skip(/\s*/)
    const frontsightAzimuth = parseAzimuth(parser, 'frontsight azimuth')
    parser.skip(/\s*/)
    const frontsightInclination = parseInclination(
      parser,
      'frontsight inclination'
    )

    parser.skip(/\s*/)
    const left = parseLength(parser, 'left')
    parser.skip(/\s*/)
    const up = parseLength(parser, 'up')
    parser.skip(/\s*/)
    const down = parseLength(parser, 'down')
    parser.skip(/\s*/)
    const right = parseLength(parser, 'right')

    let backsightAzimuth, backsightInclination
    if (header.backsightOrder) {
      parser.skip(/\s*/)
      backsightAzimuth = parseAzimuth(parser, 'backsight azimuth')
      parser.skip(/\s*/)
      backsightInclination = parseInclination(parser, 'backsight inclination')
    }
    const shot: CompassShot = {
      from,
      to,
      distance,
      frontsightAzimuth,
      frontsightInclination,
      backsightAzimuth,
      backsightInclination,
      left,
      right,
      up,
      down,
    }
    parser.skip(/\s*/)
    if (parser.currentChar() === '#') {
      parser.index++
      parser.expect('|')
      while (parser.currentChar() !== '#') {
        if (parser.isAtEndOfLine()) {
          throw new SegmentParseError(
            'missing # after flags',
            lineSegment.charAt(line.length)
          )
        }
        switch (parser.currentChar()) {
          case flagChars.doNotAdjust:
            shot.doNotAdjust = true
            break
          case flagChars.excludeDistance:
            shot.excludeDistance = true
            break
          case flagChars.excludeFromPlotting:
            shot.excludeFromPlotting = true
            break
          case flagChars.excludeFromAllProcessing:
            shot.excludeFromAllProcessing = true
            break
          default:
            throw new SegmentParseError(
              'invalid flag',
              lineSegment.charAt(parser.index)
            )
        }
        parser.index++
      }
      // skip the final #
      parser.index++
    }
    parser.skip(/\s*/)
    const comment = line.substring(parser.index).trim()
    if (comment) shot.comment = comment
    trip.shots.push(shot)
  }
}
export default async function parseCompassDatFile(
  file: string,
  lines: AsyncIterable<string>
): Promise<CompassDatFile> {
  const trips = []
  for await (const trip of parseCompassDatFileBase(file, lines)) {
    trips.push(trip)
  }
  return { trips }
}

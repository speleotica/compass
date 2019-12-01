import {
  CompassTripHeader,
  LrudAssociation,
  FrontsightItem,
  BacksightItem,
  LrudItem,
  InclinationUnit,
} from './CompassTrip'
import { Angle, Length, UnitType, Unitize } from '@speleotica/unitized'
import { assertValidStationName } from '../isValidStationName'

const frontsightHeaders = {
  [FrontsightItem.Distance]: 'LEN     ',
  [FrontsightItem.Azimuth]: 'BEAR    ',
  [FrontsightItem.Inclination]: 'INC     ',
}

const backsightHeaders = {
  [BacksightItem.Azimuth]: 'AZM2    ',
  [BacksightItem.Inclination]: 'INC2    ',
}

const lrudItemHeaders = {
  [LrudItem.Left]: 'LEFT    ',
  [LrudItem.Right]: 'RIGHT   ',
  [LrudItem.Up]: 'UP      ',
  [LrudItem.Down]: 'DOWN    ',
}

export default function formatCompassTripHeader<
  Inc extends UnitType<Inc> = Angle
>({
  cave,
  name,
  date,
  comment,
  team,
  declination,
  distanceUnit,
  azimuthUnit,
  inclinationUnit,
  lrudUnit,
  lrudOrder,
  frontsightOrder,
  backsightOrder,
  hasRedundantBacksights,
  lrudAssociation,
  distanceCorrection,
  frontsightAzimuthCorrection,
  frontsightInclinationCorrection,
  backsightAzimuthCorrection,
  backsightInclinationCorrection,
}: CompassTripHeader<Inc>): string {
  assertValidStationName(name)
  const formatItems: Array<string> = [
    azimuthUnit,
    distanceUnit,
    lrudUnit,
    inclinationUnit,
    ...lrudOrder,
    ...frontsightOrder,
    ...(backsightOrder || []),
  ]
  if (hasRedundantBacksights || lrudAssociation) {
    formatItems.push(
      hasRedundantBacksights ? 'B' : 'N',
      lrudAssociation || LrudAssociation.FromStation
    )
  }
  const format = formatItems.join('')
  const columnHeaders = [
    'FROM         ',
    'TO           ',
    frontsightHeaders[frontsightOrder[0]],
    frontsightHeaders[frontsightOrder[1]],
    frontsightHeaders[frontsightOrder[2]],
    lrudItemHeaders[lrudOrder[0]],
    lrudItemHeaders[lrudOrder[1]],
    lrudItemHeaders[lrudOrder[2]],
    lrudItemHeaders[lrudOrder[3]],
  ]
  if (backsightOrder) {
    columnHeaders.push(
      backsightHeaders[backsightOrder[0]],
      backsightHeaders[backsightOrder[1]]
    )
  }
  const incUnit = (inclinationUnit === InclinationUnit.DepthGauge
    ? Length.feet
    : Angle.degrees) as any
  columnHeaders.push('FLAGS ', 'COMMENTS')
  const corrections =
    distanceCorrection ||
    frontsightAzimuthCorrection ||
    frontsightInclinationCorrection ||
    backsightAzimuthCorrection ||
    backsightInclinationCorrection
      ? [
          (frontsightAzimuthCorrection || Unitize.degrees(0)).get(
            Angle.degrees
          ),
          (frontsightInclinationCorrection || Unitize.degrees(0)).get(incUnit),
          (distanceCorrection || Unitize.feet(0)).get(Length.feet),
        ]
          .map(n => n.toFixed(2))
          .join(' ')
      : null
  const corrections2 =
    backsightAzimuthCorrection || backsightInclinationCorrection
      ? [
          (backsightAzimuthCorrection || Unitize.degrees(0)).get(Angle.degrees),
          (backsightInclinationCorrection || Unitize.degrees(0)).get(incUnit),
        ]
          .map(n => n.toFixed(2))
          .join(' ')
      : ''
  return `${cave.substring(0, 80)}\r
SURVEY NAME: ${name.substring(0, 12)}\r
SURVEY DATE: ${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}${
    comment ? `  COMMENT:${comment}` : ''
  }\r
SURVEY TEAM:\r
${(team || '').slice(0, 100)}\r
DECLINATION: ${declination.get(Angle.degrees).toFixed(2)}  FORMAT: ${format}${
    corrections
      ? `  CORRECTIONS: ${corrections}${
          corrections2 ? ` CORRECTIONS2: ${corrections2}` : ''
        }`
      : ''
  }\r
\r
${columnHeaders.join('')}\r
\r
`
}
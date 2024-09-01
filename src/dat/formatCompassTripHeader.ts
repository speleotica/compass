import {
  CompassTripHeader,
  LrudAssociation,
  InclinationUnit,
} from './CompassTrip'
import { Angle, Length, UnitType, Unitize } from '@speleotica/unitized'

export default function formatCompassTripHeader<
  Inc extends UnitType<Inc> = Angle
>(
  {
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
    shotOrder,
    hasRedundantBacksights,
    lrudAssociation,
    distanceCorrection,
    frontsightAzimuthCorrection,
    frontsightInclinationCorrection,
    backsightAzimuthCorrection,
    backsightInclinationCorrection,
  }: CompassTripHeader<Inc>,
  options: { includeColumnHeaders?: boolean } = {}
): string {
  const formatItems: Array<string> = [
    azimuthUnit,
    distanceUnit,
    lrudUnit,
    inclinationUnit,
    ...lrudOrder,
    ...shotOrder,
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
    'LEN     ',
    'BEAR    ',
    'INC     ',
    'LEFT    ',
    'UP      ',
    'DOWN    ',
    'RIGHT   ',
  ]
  if (hasRedundantBacksights) {
    columnHeaders.push('AZM2    ', 'INC2    ')
  }
  const incUnit = (
    inclinationUnit === InclinationUnit.DepthGauge ? Length.feet : Angle.degrees
  ) as any
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
          .map((n) => n.toFixed(2))
          .join(' ')
      : null
  const corrections2 =
    backsightAzimuthCorrection || backsightInclinationCorrection
      ? [
          (backsightAzimuthCorrection || Unitize.degrees(0)).get(Angle.degrees),
          (backsightInclinationCorrection || Unitize.degrees(0)).get(incUnit),
        ]
          .map((n) => n.toFixed(2))
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
${
  options.includeColumnHeaders !== false
    ? `\r
${columnHeaders.join('')}\r
\r
`
    : ''
}`
}

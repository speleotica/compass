import { CompassShot } from './CompassShot'
import {
  CompassTripHeader,
  FrontsightItem,
  InclinationUnit,
  LrudItem,
  BacksightItem,
} from './CompassTrip'
import {
  UnitizedNumber,
  UnitType,
  Unit,
  Angle,
  Length,
} from '@speleotica/unitized'
import { assertValidStationName } from '../isValidStationName'

function cell(s: string, width: number): string {
  if (s.length >= width) s = s.slice(0, width - 1)
  return s.padStart(width, ' ')
}
function formatNumber<T extends UnitType<T>>(
  n: UnitizedNumber<T> | null | undefined,
  unit: Unit<T>,
  width: number
): string {
  if (!n || !n.isFinite) return cell('-999.00', width)
  return cell(n.get(unit).toFixed(2), width)
}

export const flagChars = {
  excludeDistance: 'L',
  excludeFromPlotting: 'P',
  excludeFromAllProcessing: 'X',
  doNotAdjust: 'C',
}

const formatCompassShot = <Inc extends UnitType<Inc> = Angle>({
  frontsightOrder,
  backsightOrder,
  lrudOrder,
  inclinationUnit,
}: CompassTripHeader) => ({
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
  excludeDistance,
  excludeFromPlotting,
  excludeFromAllProcessing,
  doNotAdjust,
  comment,
}: CompassShot<Inc>): string => {
  assertValidStationName(from)
  assertValidStationName(to)
  const incUnit = (inclinationUnit === InclinationUnit.DepthGauge
    ? Length.feet
    : Angle.degrees) as any
  const cols = [
    cell(from, 13),
    cell(to, 13),
    ...frontsightOrder.map(
      (item: FrontsightItem): string => {
        switch (item) {
          case FrontsightItem.Azimuth:
            return formatNumber(frontsightAzimuth, Angle.degrees, 8)
          case FrontsightItem.Inclination:
            return formatNumber(frontsightInclination, incUnit, 8)
          case FrontsightItem.Distance:
            return formatNumber(distance, Length.feet, 8)
        }
      }
    ),
    ...lrudOrder.map(
      (item: LrudItem): string => {
        switch (item) {
          case LrudItem.Left:
            return formatNumber(left, Length.feet, 8)
          case LrudItem.Right:
            return formatNumber(right, Length.feet, 8)
          case LrudItem.Up:
            return formatNumber(up, Length.feet, 8)
          case LrudItem.Down:
            return formatNumber(down, Length.feet, 8)
        }
      }
    ),
  ]
  if (backsightOrder) {
    cols.push(
      ...backsightOrder.map(
        (item: BacksightItem): string => {
          switch (item) {
            case BacksightItem.Azimuth:
              return formatNumber(backsightAzimuth, Angle.degrees, 8)
            case BacksightItem.Inclination:
              return formatNumber(backsightInclination, incUnit, 8)
          }
        }
      )
    )
  }
  let flags = ''
  if (excludeDistance) flags += flagChars.excludeDistance
  if (excludeFromPlotting) flags += flagChars.excludeFromPlotting
  if (excludeFromAllProcessing) flags += flagChars.excludeFromAllProcessing
  if (doNotAdjust) flags += flagChars.doNotAdjust
  if (flags) cols.push(` #|${flags}#`)
  if (comment) cols.push(' ' + comment.slice(0, 80))
  cols.push('\r\n')
  return cols.join('')
}

export default formatCompassShot

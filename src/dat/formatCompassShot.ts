import { CompassShot } from './CompassShot'
import { CompassTripHeader, InclinationUnit } from './CompassTrip'
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
  backsightOrder,
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
    formatNumber(distance, Length.feet, 8),
    formatNumber(frontsightAzimuth, Angle.degrees, 8),
    formatNumber(frontsightInclination, incUnit, 8),
    formatNumber(left, Length.feet, 8),
    formatNumber(up, Length.feet, 8),
    formatNumber(down, Length.feet, 8),
    formatNumber(right, Length.feet, 8),
  ]
  if (backsightOrder) {
    cols.push(
      formatNumber(backsightAzimuth, Angle.degrees, 8),
      formatNumber(backsightInclination, incUnit, 8)
    )
  }
  let flags = ''
  if (excludeDistance) flags += flagChars.excludeDistance
  if (excludeFromPlotting) flags += flagChars.excludeFromPlotting
  if (excludeFromAllProcessing) flags += flagChars.excludeFromAllProcessing
  if (doNotAdjust) flags += flagChars.doNotAdjust
  if (flags) cols.push(` #|${flags}#`)
  if (comment)
    cols.push(
      ' ' +
        comment
          .replace(/\r\n?|\n/gm, ' ')
          .trim()
          .slice(0, 80)
    )
  cols.push('\r\n')
  return cols.join('')
}

export default formatCompassShot

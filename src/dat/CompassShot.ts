import { UnitizedNumber, Length, Angle, UnitType } from '@speleotica/unitized'

export type CompassShot<Inc extends UnitType<Inc> = Angle> = {
  from: string
  to: string
  distance: UnitizedNumber<Length>
  frontsightAzimuth?: UnitizedNumber<Angle> | null
  frontsightInclination?: UnitizedNumber<Inc> | null
  backsightAzimuth?: UnitizedNumber<Angle> | null
  backsightInclination?: UnitizedNumber<Inc> | null
  left?: UnitizedNumber<Length> | null
  right?: UnitizedNumber<Length> | null
  up?: UnitizedNumber<Length> | null
  down?: UnitizedNumber<Length> | null
  excludeDistance?: boolean | null
  excludeFromPlotting?: boolean | null
  excludeFromAllProcessing?: boolean | null
  doNotAdjust?: boolean | null
  comment?: string | null
}

import { UnitizedNumber, Angle, Length, UnitType } from '@speleotica/unitized'
import { CompassShot } from './CompassShot'

export enum LrudItem {
  Left = 'L',
  Right = 'R',
  Up = 'U',
  Down = 'D',
}

export type LrudOrder = [LrudItem, LrudItem, LrudItem, LrudItem]

export enum FrontsightItem {
  Distance = 'L',
  Azimuth = 'A',
  Inclination = 'D',
}

export enum ShotItem {
  Distance = 'L',
  FrontsightAzimuth = 'A',
  FrontsightInclination = 'D',
  BacksightAzimuth = 'a',
  BacksightInclination = 'd',
}

export type ShotOrder =
  | [ShotItem, ShotItem, ShotItem]
  | [ShotItem, ShotItem, ShotItem, ShotItem, ShotItem]

export enum LrudAssociation {
  FromStation = 'F',
  ToStation = 'T',
}

export enum AzimuthUnit {
  Degrees = 'D',
  Quads = 'Q',
  Gradians = 'R',
}
export enum InclinationUnit {
  Degrees = 'D',
  PercentGrade = 'G',
  DegreesAndMinutes = 'M',
  Gradians = 'R',
  DepthGauge = 'W',
}
export enum DistanceUnit {
  DecimalFeet = 'D',
  FeetAndInches = 'I',
  Meters = 'M',
}

export type CompassTripHeader<Inc extends UnitType<Inc> = Angle> = {
  cave: string
  name: string
  date: Date
  comment?: string | null
  team?: string | null
  declination: UnitizedNumber<Angle>
  azimuthUnit: AzimuthUnit
  distanceUnit: DistanceUnit
  lrudUnit: DistanceUnit
  inclinationUnit: InclinationUnit
  lrudOrder: LrudOrder
  shotOrder: ShotOrder
  hasRedundantBacksights?: boolean | null
  lrudAssociation?: LrudAssociation | null
  distanceCorrection?: UnitizedNumber<Length> | null
  frontsightAzimuthCorrection?: UnitizedNumber<Angle> | null
  frontsightInclinationCorrection?: UnitizedNumber<Inc> | null
  backsightAzimuthCorrection?: UnitizedNumber<Angle> | null
  backsightInclinationCorrection?: UnitizedNumber<Inc> | null
}

export type CompassTrip<Inc extends UnitType<Inc> = Angle> = {
  header: CompassTripHeader<Inc>
  shots: Array<CompassShot<Inc>>
}

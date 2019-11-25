import { describe, it } from 'mocha'
import { expect } from 'chai'
import formatCompassTripHeader from './formatCompassTripHeader'
import { Angle, Length } from '@speleotica/unitized'
import {
  AzimuthUnit,
  DistanceUnit,
  InclinationUnit,
  LrudItem,
  FrontsightItem,
  BacksightItem,
  LrudAssociation,
} from './CompassTrip'

describe('formatCompassTripHeader', () => {
  it('minimum format', () => {
    expect(
      formatCompassTripHeader({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        declination: Angle.degrees(1),
        azimuthUnit: AzimuthUnit.Degrees,
        distanceUnit: DistanceUnit.DecimalFeet,
        lrudUnit: DistanceUnit.DecimalFeet,
        inclinationUnit: InclinationUnit.Degrees,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        frontsightOrder: [
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
          FrontsightItem.Distance,
        ],
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979\r
SURVEY TEAM:\r
\r
DECLINATION: 1.00  FORMAT: DDDDLUDRADL\r
\r
FROM         TO           BEAR    INC     LEN     LEFT    UP      DOWN    RIGHT   FLAGS COMMENTS\r
\r
`)
  })
  it('maximum format', () => {
    expect(
      formatCompassTripHeader({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        comment: 'TEST',
        team: 'Dude',
        declination: Angle.degrees(1),
        azimuthUnit: AzimuthUnit.Quads,
        distanceUnit: DistanceUnit.FeetAndInches,
        lrudUnit: DistanceUnit.Meters,
        inclinationUnit: InclinationUnit.PercentGrade,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        frontsightOrder: [
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
          FrontsightItem.Distance,
        ],
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        distanceCorrection: Length.feet(2),
        frontsightAzimuthCorrection: Angle.degrees(3),
        frontsightInclinationCorrection: Angle.degrees(4),
        backsightAzimuthCorrection: Angle.degrees(5),
        backsightInclinationCorrection: Angle.degrees(6),
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979  COMMENT: TEST\r
SURVEY TEAM:\r
Dude\r
DECLINATION: 1.00  FORMAT: QIMGLUDRADLadBT  CORRECTIONS: 3.00 4.00 2.00 CORRECTIONS2: 5.00 6.00\r
\r
FROM         TO           BEAR    INC     LEN     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS\r
\r
`)
  })
  it('missing corrections', () => {
    expect(
      formatCompassTripHeader({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        comment: 'TEST',
        team: 'Dude',
        declination: Angle.degrees(1),
        azimuthUnit: AzimuthUnit.Quads,
        distanceUnit: DistanceUnit.FeetAndInches,
        lrudUnit: DistanceUnit.Meters,
        inclinationUnit: InclinationUnit.PercentGrade,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        frontsightOrder: [
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
          FrontsightItem.Distance,
        ],
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        frontsightAzimuthCorrection: Angle.degrees(1),
        backsightInclinationCorrection: Angle.degrees(2),
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979  COMMENT: TEST\r
SURVEY TEAM:\r
Dude\r
DECLINATION: 1.00  FORMAT: QIMGLUDRADLadBT  CORRECTIONS: 1.00 0.00 0.00 CORRECTIONS2: 0.00 2.00\r
\r
FROM         TO           BEAR    INC     LEN     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS\r
\r
`)
  })
  it('depth gauge corrections', () => {
    expect(
      formatCompassTripHeader({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        comment: 'TEST',
        team: 'Dude',
        declination: Angle.degrees(1),
        azimuthUnit: AzimuthUnit.Quads,
        distanceUnit: DistanceUnit.FeetAndInches,
        lrudUnit: DistanceUnit.Meters,
        inclinationUnit: InclinationUnit.DepthGauge,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        frontsightOrder: [
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
          FrontsightItem.Distance,
        ],
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        frontsightInclinationCorrection: Length.meters(1),
        backsightInclinationCorrection: Length.meters(2),
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979  COMMENT: TEST\r
SURVEY TEAM:\r
Dude\r
DECLINATION: 1.00  FORMAT: QIMWLUDRADLadBT  CORRECTIONS: 0.00 3.28 0.00 CORRECTIONS2: 0.00 6.56\r
\r
FROM         TO           BEAR    INC     LEN     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS\r
\r
`)
  })
})

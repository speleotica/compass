import { describe, it } from 'mocha'
import { expect } from 'chai'
import formatCompassTripHeader from './formatCompassTripHeader'
import { Unitize } from '@speleotica/unitized'
import {
  AzimuthUnit,
  DistanceUnit,
  InclinationUnit,
  LrudItem,
  ShotItem,
  LrudAssociation,
} from './CompassTrip'
import { repeat } from 'lodash'

describe('formatCompassTripHeader', () => {
  it('minimum format', () => {
    expect(
      formatCompassTripHeader({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        declination: Unitize.degrees(1),
        azimuthUnit: AzimuthUnit.Degrees,
        distanceUnit: DistanceUnit.DecimalFeet,
        lrudUnit: DistanceUnit.DecimalFeet,
        inclinationUnit: InclinationUnit.Degrees,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        shotOrder: [
          ShotItem.FrontsightAzimuth,
          ShotItem.FrontsightInclination,
          ShotItem.Distance,
        ],
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979\r
SURVEY TEAM:\r
\r
DECLINATION: 1.00  FORMAT: DDDDLUDRADL\r
\r
FROM         TO           LEN     BEAR    INC     LEFT    UP      DOWN    RIGHT   FLAGS COMMENTS\r
\r
`)
  })
  it('includeColumnHeaders: false', () => {
    expect(
      formatCompassTripHeader(
        {
          cave: 'SECRET CAVE',
          name: 'A',
          date: new Date('July 10 1979'),
          declination: Unitize.degrees(1),
          azimuthUnit: AzimuthUnit.Degrees,
          distanceUnit: DistanceUnit.DecimalFeet,
          lrudUnit: DistanceUnit.DecimalFeet,
          inclinationUnit: InclinationUnit.Degrees,
          lrudOrder: [
            LrudItem.Left,
            LrudItem.Up,
            LrudItem.Down,
            LrudItem.Right,
          ],
          shotOrder: [
            ShotItem.FrontsightAzimuth,
            ShotItem.FrontsightInclination,
            ShotItem.Distance,
          ],
        },
        { includeColumnHeaders: false }
      )
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979\r
SURVEY TEAM:\r
\r
DECLINATION: 1.00  FORMAT: DDDDLUDRADL\r
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
        declination: Unitize.degrees(1),
        azimuthUnit: AzimuthUnit.Quads,
        distanceUnit: DistanceUnit.FeetAndInches,
        lrudUnit: DistanceUnit.Meters,
        inclinationUnit: InclinationUnit.PercentGrade,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        shotOrder: [
          ShotItem.FrontsightAzimuth,
          ShotItem.FrontsightInclination,
          ShotItem.Distance,
          ShotItem.BacksightAzimuth,
          ShotItem.BacksightInclination,
        ],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        distanceCorrection: Unitize.feet(2),
        frontsightAzimuthCorrection: Unitize.degrees(3),
        frontsightInclinationCorrection: Unitize.degrees(4),
        backsightAzimuthCorrection: Unitize.degrees(5),
        backsightInclinationCorrection: Unitize.degrees(6),
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979  COMMENT:TEST\r
SURVEY TEAM:\r
Dude\r
DECLINATION: 1.00  FORMAT: QIMGLUDRADLadBT  CORRECTIONS: 3.00 4.00 2.00 CORRECTIONS2: 5.00 6.00\r
\r
FROM         TO           LEN     BEAR    INC     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS\r
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
        declination: Unitize.degrees(1),
        azimuthUnit: AzimuthUnit.Quads,
        distanceUnit: DistanceUnit.FeetAndInches,
        lrudUnit: DistanceUnit.Meters,
        inclinationUnit: InclinationUnit.PercentGrade,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        shotOrder: [
          ShotItem.FrontsightAzimuth,
          ShotItem.FrontsightInclination,
          ShotItem.Distance,
          ShotItem.BacksightAzimuth,
          ShotItem.BacksightInclination,
        ],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        frontsightAzimuthCorrection: Unitize.degrees(1),
        backsightInclinationCorrection: Unitize.degrees(2),
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979  COMMENT:TEST\r
SURVEY TEAM:\r
Dude\r
DECLINATION: 1.00  FORMAT: QIMGLUDRADLadBT  CORRECTIONS: 1.00 0.00 0.00 CORRECTIONS2: 0.00 2.00\r
\r
FROM         TO           LEN     BEAR    INC     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS\r
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
        declination: Unitize.degrees(1),
        azimuthUnit: AzimuthUnit.Quads,
        distanceUnit: DistanceUnit.FeetAndInches,
        lrudUnit: DistanceUnit.Meters,
        inclinationUnit: InclinationUnit.DepthGauge,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        shotOrder: [
          ShotItem.FrontsightAzimuth,
          ShotItem.FrontsightInclination,
          ShotItem.Distance,
          ShotItem.BacksightAzimuth,
          ShotItem.BacksightInclination,
        ],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        frontsightInclinationCorrection: Unitize.meters(1),
        backsightInclinationCorrection: Unitize.meters(2),
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979  COMMENT:TEST\r
SURVEY TEAM:\r
Dude\r
DECLINATION: 1.00  FORMAT: QIMWLUDRADLadBT  CORRECTIONS: 0.00 3.28 0.00 CORRECTIONS2: 0.00 6.56\r
\r
FROM         TO           LEN     BEAR    INC     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS\r
\r
`)
  })
  it('truncates team', () => {
    expect(
      formatCompassTripHeader({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        comment: 'TEST',
        team: repeat('Dude', 100),
        declination: Unitize.degrees(1),
        azimuthUnit: AzimuthUnit.Quads,
        distanceUnit: DistanceUnit.FeetAndInches,
        lrudUnit: DistanceUnit.Meters,
        inclinationUnit: InclinationUnit.DepthGauge,
        lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
        shotOrder: [
          ShotItem.FrontsightAzimuth,
          ShotItem.FrontsightInclination,
          ShotItem.Distance,
          ShotItem.BacksightAzimuth,
          ShotItem.BacksightInclination,
        ],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        frontsightInclinationCorrection: Unitize.meters(1),
        backsightInclinationCorrection: Unitize.meters(2),
      })
    ).to.equal(`SECRET CAVE\r
SURVEY NAME: A\r
SURVEY DATE: 7 10 1979  COMMENT:TEST\r
SURVEY TEAM:\r
${repeat('Dude', 50).substring(0, 100)}\r
DECLINATION: 1.00  FORMAT: QIMWLUDRADLadBT  CORRECTIONS: 0.00 3.28 0.00 CORRECTIONS2: 0.00 6.56\r
\r
FROM         TO           LEN     BEAR    INC     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS\r
\r
`)
  })
})

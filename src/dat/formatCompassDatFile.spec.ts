import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Unitize } from '@speleotica/unitized'
import {
  AzimuthUnit,
  DistanceUnit,
  InclinationUnit,
  LrudItem,
  CompassTrip,
  ShotItem,
} from './CompassTrip'
import formatCompassDatFile from './formatCompassDatFile'

describe('formatCompassDatFile', () => {
  it('basic test', () => {
    const trips: Array<CompassTrip> = [
      {
        header: {
          cave: 'SECRET CAVE',
          name: 'A1-3',
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
            ShotItem.BacksightAzimuth,
            ShotItem.BacksightInclination,
          ],
          hasRedundantBacksights: true,
        },
        shots: [
          {
            from: 'A1',
            to: 'A2',
            distance: Unitize.meters(1),
            frontsightAzimuth: Unitize.gradians(50),
            frontsightInclination: Unitize.degrees(-10),
            backsightAzimuth: Unitize.degrees(30),
            backsightInclination: Unitize.degrees(-8),
            left: Unitize.feet(1),
            up: Unitize.feet(2),
          },
          {
            from: 'A2',
            to: 'A3',
            distance: Unitize.feet(5),
            frontsightAzimuth: Unitize.degrees(20),
            frontsightInclination: Unitize.degrees(-10),
            backsightAzimuth: Unitize.degrees(22),
            backsightInclination: Unitize.degrees(-8),
            right: Unitize.feet(1),
            up: Unitize.feet(2),
          },
        ],
      },
      {
        header: {
          cave: 'SECRET CAVE',
          name: 'A3-5',
          date: new Date('Aug 3 1989'),
          declination: Unitize.degrees(1),
          azimuthUnit: AzimuthUnit.Degrees,
          distanceUnit: DistanceUnit.DecimalFeet,
          lrudUnit: DistanceUnit.DecimalFeet,
          inclinationUnit: InclinationUnit.Degrees,
          team: 'Dudes',
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
            ShotItem.BacksightAzimuth,
            ShotItem.BacksightInclination,
          ],
          hasRedundantBacksights: true,
        },
        shots: [
          {
            from: 'A3',
            to: 'A4',
            distance: Unitize.meters(1),
            frontsightAzimuth: Unitize.gradians(50),
            frontsightInclination: Unitize.degrees(-10),
            backsightAzimuth: Unitize.degrees(30),
            backsightInclination: Unitize.degrees(-8),
            down: Unitize.feet(1),
            right: Unitize.feet(2),
          },
          {
            from: 'A4',
            to: 'A5',
            distance: Unitize.feet(5),
            frontsightAzimuth: Unitize.degrees(20),
            frontsightInclination: Unitize.degrees(-10),
            backsightAzimuth: Unitize.degrees(22),
            backsightInclination: Unitize.degrees(-8),
            down: Unitize.feet(1),
            up: Unitize.feet(2),
            excludeDistance: true,
            comment: 'test',
          },
        ],
      },
    ]

    expect(formatCompassDatFile({ trips })).to.equal(
      `SECRET CAVE
SURVEY NAME: A1-3
SURVEY DATE: 7 10 1979
SURVEY TEAM:

DECLINATION: 1.00  FORMAT: DDDDLUDRADLadBF

FROM         TO           LEN     BEAR    INC     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS

           A1           A2    3.28   45.00  -10.00    1.00    2.00 -999.00 -999.00   30.00   -8.00
           A2           A3    5.00   20.00  -10.00 -999.00    2.00 -999.00    1.00   22.00   -8.00
\f
SECRET CAVE
SURVEY NAME: A3-5
SURVEY DATE: 8 3 1989
SURVEY TEAM:
Dudes
DECLINATION: 1.00  FORMAT: DDDDLUDRADLadBF

FROM         TO           LEN     BEAR    INC     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS

           A3           A4    3.28   45.00  -10.00 -999.00 -999.00    1.00    2.00   30.00   -8.00
           A4           A5    5.00   20.00  -10.00 -999.00    2.00    1.00 -999.00   22.00   -8.00 #|L# test
\f
`.replace(/\n/gm, '\r\n')
    )
  })
})

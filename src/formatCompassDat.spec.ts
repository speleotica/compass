import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Angle, Length } from '@speleotica/unitized'
import {
  AzimuthUnit,
  LengthUnit,
  InclinationUnit,
  LrudItem,
  FrontsightItem,
  BacksightItem,
  CompassTrip,
} from './CompassTrip'
import formatCompassDat from './formatCompassDat'

describe('formatCompassDat', () => {
  it('basic test', () => {
    const trips: Array<CompassTrip> = [
      {
        header: {
          cave: 'SECRET CAVE',
          name: 'A1-3',
          date: new Date('July 10 1979'),
          declination: Angle.degrees(1),
          azimuthUnit: AzimuthUnit.Degrees,
          distanceUnit: LengthUnit.DecimalFeet,
          lrudUnit: LengthUnit.DecimalFeet,
          inclinationUnit: InclinationUnit.Degrees,
          lrudOrder: [
            LrudItem.Left,
            LrudItem.Up,
            LrudItem.Down,
            LrudItem.Right,
          ],
          frontsightOrder: [
            FrontsightItem.Azimuth,
            FrontsightItem.Inclination,
            FrontsightItem.Distance,
          ],
          backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        },
        shots: [
          {
            from: 'A1',
            to: 'A2',
            distance: Length.meters(1),
            frontsightAzimuth: Angle.gradians(50),
            frontsightInclination: Angle.degrees(-10),
            backsightAzimuth: Angle.degrees(30),
            backsightInclination: Angle.degrees(-8),
            left: Length.feet(1),
            up: Length.feet(2),
          },
          {
            from: 'A2',
            to: 'A3',
            distance: Length.feet(5),
            frontsightAzimuth: Angle.degrees(20),
            frontsightInclination: Angle.degrees(-10),
            backsightAzimuth: Angle.degrees(22),
            backsightInclination: Angle.degrees(-8),
            right: Length.feet(1),
            up: Length.feet(2),
          },
        ],
      },
      {
        header: {
          cave: 'SECRET CAVE',
          name: 'A3-5',
          date: new Date('Aug 3 1989'),
          declination: Angle.degrees(1),
          azimuthUnit: AzimuthUnit.Degrees,
          distanceUnit: LengthUnit.DecimalFeet,
          lrudUnit: LengthUnit.DecimalFeet,
          inclinationUnit: InclinationUnit.Degrees,
          team: 'Dudes',
          lrudOrder: [
            LrudItem.Left,
            LrudItem.Up,
            LrudItem.Down,
            LrudItem.Right,
          ],
          frontsightOrder: [
            FrontsightItem.Azimuth,
            FrontsightItem.Inclination,
            FrontsightItem.Distance,
          ],
          backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        },
        shots: [
          {
            from: 'A3',
            to: 'A4',
            distance: Length.meters(1),
            frontsightAzimuth: Angle.gradians(50),
            frontsightInclination: Angle.degrees(-10),
            backsightAzimuth: Angle.degrees(30),
            backsightInclination: Angle.degrees(-8),
            down: Length.feet(1),
            right: Length.feet(2),
          },
          {
            from: 'A4',
            to: 'A5',
            distance: Length.feet(5),
            frontsightAzimuth: Angle.degrees(20),
            frontsightInclination: Angle.degrees(-10),
            backsightAzimuth: Angle.degrees(22),
            backsightInclination: Angle.degrees(-8),
            down: Length.feet(1),
            up: Length.feet(2),
            excludeLength: true,
            comment: 'test',
          },
        ],
      },
    ]

    expect(formatCompassDat({ trips })).to.equal(
      `SECRET CAVE
SURVEY NAME: A1-3
SURVEY DATE: 7 10 1979
SURVEY TEAM:

DECLINATION: 1.00  FORMAT: DDDDLUDRADLad

FROM         TO           BEAR    INC     LEN     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS

           A1           A2   45.00  -10.00    3.28    1.00    2.00 -999.00 -999.00   30.00   -8.00
           A2           A3   20.00  -10.00    5.00 -999.00    2.00 -999.00    1.00   22.00   -8.00
\f
SECRET CAVE
SURVEY NAME: A3-5
SURVEY DATE: 8 3 1989
SURVEY TEAM:
Dudes
DECLINATION: 1.00  FORMAT: DDDDLUDRADLad

FROM         TO           BEAR    INC     LEN     LEFT    UP      DOWN    RIGHT   AZM2    INC2    FLAGS COMMENTS

           A3           A4   45.00  -10.00    3.28 -999.00 -999.00    1.00    2.00   30.00   -8.00
           A4           A5   20.00  -10.00    5.00 -999.00    2.00    1.00 -999.00   22.00   -8.00 #|L# test
\f
`.replace(/\n/gm, '\r\n')
    )
  })
})

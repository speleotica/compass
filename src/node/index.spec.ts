import { describe, it } from 'mocha'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'
import {
  CompassTrip,
  AzimuthUnit,
  DistanceUnit,
  InclinationUnit,
  LrudItem,
  FrontsightItem,
  BacksightItem,
} from '../dat/CompassTrip'
import { directives, LrudAssociation } from '../mak'
import { Unitize } from '@speleotica/unitized'
import { writeCompassDatFile, writeCompassMakFile } from './'
import { promisify } from 'util'

const testFile = path.resolve(__dirname, 'testout')

describe('node API', function() {
  afterEach(function() {
    fs.unlinkSync(testFile)
  })
  it('writeCompassDatFile', async function() {
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

    await writeCompassDatFile(testFile, { trips })

    expect(await promisify(fs.readFile)(testFile, 'ASCII')).to.equal(
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
  it('writeCompassMakFile', async function() {
    await writeCompassMakFile(testFile, {
      directives: [
        directives.baseLocation(
          Unitize.feet(100),
          Unitize.meters(200),
          Unitize.meters(300),
          13,
          Unitize.gradians(50)
        ),
        directives.datum('WGS 1984'),
        directives.utmConvergenceAngle(Unitize.degrees(2)),
        directives.utmZone(14),
        directives.fileParameters(true, LrudAssociation.FromStation),
        directives.fileParameters(false, LrudAssociation.ToStation),
        directives.datFile('Foo.dat'),
        directives.datFile('Bar.dat', [{ station: 'A1' }]),
        directives.datFile('Baz.dat', [
          { station: 'A1' },
          {
            station: 'A2',
            location: {
              easting: Unitize.feet(23),
              northing: Unitize.feet(83),
              elevation: Unitize.feet(2),
            },
          },
          {
            station: 'A3',
            location: {
              easting: Unitize.meters(23),
              northing: Unitize.feet(83),
              elevation: Unitize.feet(2),
            },
          },
        ]),
      ],
    })
    expect(await promisify(fs.readFile)(testFile, 'ASCII')).to.equal(
      [
        '@30.480,200.000,300.000,13,45.000;',
        '&WGS 1984;',
        '%2.000;',
        '$14;',
        '!Ot;',
        '!oT;',
        '#Foo.dat;',
        '#Bar.dat,A1;',
        '#Baz.dat,',
        '  A1,',
        '  A2[F,23.000,83.000,2.000],',
        '  A3[M,23.000,25.298,0.610];',
      ].join('\r\n') + '\r\n'
    )
  })
})

import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Length, Unitize } from '@speleotica/unitized'
import {
  AzimuthUnit,
  DistanceUnit,
  InclinationUnit,
  LrudItem,
  FrontsightItem,
  BacksightItem,
} from './CompassTrip'
import formatCompassShot, { flagChars } from './formatCompassShot'

describe('formatCompassShot', () => {
  it('basic test', () => {
    const actual = formatCompassShot({
      cave: 'SECRET CAVE',
      name: 'A',
      date: new Date('July 10 1979'),
      declination: Unitize.degrees(1),
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
    })({
      from: 'foo',
      to: 'bar',
      distance: Unitize.meters(1),
      frontsightAzimuth: Unitize.gradians(50),
      frontsightInclination: Unitize.degrees(-10),
      left: Unitize.feet(1),
      up: Unitize.feet(2),
    })
    expect(actual).to.equal(
      '          foo          bar   45.00  -10.00    3.28    1.00    2.00 -999.00 -999.00\r\n'
    )
  })
  it('backsights', () => {
    const actual = formatCompassShot({
      cave: 'SECRET CAVE',
      name: 'A',
      date: new Date('July 10 1979'),
      declination: Unitize.degrees(1),
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
      backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
    })({
      from: 'foo',
      to: 'bar',
      distance: Unitize.meters(1),
      frontsightAzimuth: Unitize.gradians(50),
      frontsightInclination: Unitize.degrees(-10),
      backsightAzimuth: Unitize.degrees(30),
      backsightInclination: Unitize.degrees(-8),
      left: Unitize.feet(1),
      up: Unitize.feet(2),
    })
    expect(actual).to.equal(
      '          foo          bar   45.00  -10.00    3.28    1.00    2.00 -999.00 -999.00   30.00   -8.00\r\n'
    )
  })
  it('depth gauge', () => {
    const actual = formatCompassShot<Length>({
      cave: 'SECRET CAVE',
      name: 'A',
      date: new Date('July 10 1979'),
      declination: Unitize.degrees(1),
      azimuthUnit: AzimuthUnit.Degrees,
      distanceUnit: DistanceUnit.DecimalFeet,
      lrudUnit: DistanceUnit.DecimalFeet,
      inclinationUnit: InclinationUnit.DepthGauge,
      lrudOrder: [LrudItem.Left, LrudItem.Up, LrudItem.Down, LrudItem.Right],
      frontsightOrder: [
        FrontsightItem.Azimuth,
        FrontsightItem.Inclination,
        FrontsightItem.Distance,
      ],
      backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
    })({
      from: 'foo',
      to: 'bar',
      distance: Unitize.meters(1),
      frontsightAzimuth: Unitize.gradians(50),
      frontsightInclination: Unitize.meters(3),
      backsightAzimuth: Unitize.degrees(30),
      backsightInclination: Unitize.meters(5),
      left: Unitize.feet(1),
      up: Unitize.feet(2),
    })
    expect(actual).to.equal(
      '          foo          bar   45.00    9.84    3.28    1.00    2.00 -999.00 -999.00   30.00   16.40\r\n'
    )
  })
  it('invalid station name', () => {
    expect(() =>
      formatCompassShot({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        declination: Unitize.degrees(1),
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
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
      })
    ).to.throw
  })
  it('comment', () => {
    const comment =
      'this is a really long comment this is a really long comment this is a really long comment this is really long'
    const actual = formatCompassShot({
      cave: 'SECRET CAVE',
      name: 'A',
      date: new Date('July 10 1979'),
      declination: Unitize.degrees(1),
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
    })({
      from: 'foo',
      to: 'bar',
      distance: Unitize.meters(1),
      frontsightAzimuth: Unitize.gradians(50),
      frontsightInclination: Unitize.degrees(-10),
      left: Unitize.feet(1),
      up: Unitize.feet(2),
      comment,
    })
    expect(actual).to.equal(
      `          foo          bar   45.00  -10.00    3.28    1.00    2.00 -999.00 -999.00 ${comment.slice(
        0,
        80
      )}\r\n`
    )
  })
  it('flags', () => {
    for (const flag in flagChars) {
      const actual = formatCompassShot({
        cave: 'SECRET CAVE',
        name: 'A',
        date: new Date('July 10 1979'),
        declination: Unitize.degrees(1),
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
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
      })({
        from: 'foo',
        to: 'bar',
        distance: Unitize.meters(1),
        frontsightAzimuth: Unitize.gradians(50),
        frontsightInclination: Unitize.degrees(-10),
        backsightAzimuth: Unitize.degrees(30),
        backsightInclination: Unitize.degrees(-8),
        left: Unitize.feet(1),
        up: Unitize.feet(2),
        [flag]: true,
      })
      expect(actual).to.equal(
        `          foo          bar   45.00  -10.00    3.28    1.00    2.00 -999.00 -999.00   30.00   -8.00 #|${
          flagChars[flag]
        }#\r\n`
      )
    }
  })
  it('flags and comment', () => {
    const actual = formatCompassShot({
      cave: 'SECRET CAVE',
      name: 'A',
      date: new Date('July 10 1979'),
      declination: Unitize.degrees(1),
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
      backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
    })({
      from: 'foo',
      to: 'bar',
      distance: Unitize.meters(1),
      frontsightAzimuth: Unitize.gradians(50),
      frontsightInclination: Unitize.degrees(-10),
      backsightAzimuth: Unitize.degrees(30),
      backsightInclination: Unitize.degrees(-8),
      left: Unitize.feet(1),
      up: Unitize.feet(2),
      excludeDistance: true,
      excludeFromPlotting: true,
      excludeFromAllProcessing: true,
      doNotAdjust: true,
      comment: 'foo bar baz qux',
    })
    expect(actual).to.equal(
      `          foo          bar   45.00  -10.00    3.28    1.00    2.00 -999.00 -999.00   30.00   -8.00 #|LPXC# foo bar baz qux\r\n`
    )
  })
  it('multiline input comment', () => {
    const actual = formatCompassShot({
      cave: 'SECRET CAVE',
      name: 'A',
      date: new Date('July 10 1979'),
      declination: Unitize.degrees(1),
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
      backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
    })({
      from: 'foo',
      to: 'bar',
      distance: Unitize.meters(1),
      frontsightAzimuth: Unitize.gradians(50),
      frontsightInclination: Unitize.degrees(-10),
      backsightAzimuth: Unitize.degrees(30),
      backsightInclination: Unitize.degrees(-8),
      left: Unitize.feet(1),
      up: Unitize.feet(2),
      excludeDistance: true,
      excludeFromPlotting: true,
      excludeFromAllProcessing: true,
      doNotAdjust: true,
      comment: `foo\r
bar
baz\r
qux`,
    })
    expect(actual).to.equal(
      `          foo          bar   45.00  -10.00    3.28    1.00    2.00 -999.00 -999.00   30.00   -8.00 #|LPXC# foo bar baz qux\r\n`
    )
  })
})

import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Segment, SegmentParser } from 'parse-segment'
import parseCompassDatFile, {
  parseDate,
  parseLength,
  parseAzimuth,
  parseInclination,
  parseFormat,
} from './parseCompassDatFile'
import { UnitizedNumber, Length, Unitize, Angle } from '@speleotica/unitized'
import {
  CompassTripHeader,
  DistanceUnit,
  AzimuthUnit,
  InclinationUnit,
  LrudItem,
  FrontsightItem,
  BacksightItem,
  LrudAssociation,
  CompassShot,
} from '.'

async function* linesOf(value: string): AsyncIterable<string> {
  yield* value.split(/\r\n?|\n/gm)
}

describe('parseCompassDatFile', () => {
  describe('parseDate', () => {
    const parse = (value: string): Date =>
      parseDate(new Segment({ value, source: 'test.dat' }))

    it('works', () => {
      expect(parse('4 3 2019')).to.deep.equal(new Date('Apr 3, 2019'))
    })
    it('throws if year is missing', () => {
      expect(() => parse('2 28 ')).to.throw('missing year')
    })
    it('throws if day is missing', () => {
      expect(() => parse('2 ')).to.throw('missing day')
    })
    it('throws if month is missing', () => {
      expect(() => parse(' ')).to.throw('missing month')
    })
    it('throws if month is invalid', () => {
      expect(() => parse('2a 28 2019')).to.throw('invalid month')
      expect(() => parse('0 28 2019')).to.throw('invalid month')
      expect(() => parse('13 28 2019')).to.throw('invalid month')
    })
    it('throws if date is invalid', () => {
      expect(() => parse('2 0 2019')).to.throw('invalid day')
      expect(() => parse('2 -1 2019')).to.throw('invalid day')
      expect(() => parse('2 a 2019')).to.throw('invalid day')
      expect(() => parse('2 29 2019')).to.throw('invalid day')
      expect(() => parse('2 29 2020')).not.to.throw()
      expect(() => parse('2 29 2100')).to.throw('invalid day')
      expect(() => parse('2 29 2000')).not.to.throw()
    })
    it('throws if year is invalid', () => {
      expect(() => parse('2 10 -2019')).to.throw('invalid year')
    })
    it('throws if there is an extra part at the end', () => {
      expect(() => parse('2 10 2019 foo')).to.throw(
        'expected COMMENT: after date'
      )
    })
  })
  describe('parseLength', () => {
    const parse = (value: string): UnitizedNumber<Length> =>
      parseLength(
        new SegmentParser(new Segment({ value, source: 'test.dat' })),
        'length'
      )
    it('works', () => {
      expect(parse('2.3')).to.deep.equal(Unitize.feet(2.3))
      expect(parse('2.3 something else')).to.deep.equal(Unitize.feet(2.3))
      expect(parse('2.3e6')).to.deep.equal(Unitize.feet(2.3e6))
      expect(parse('0')).to.deep.equal(Unitize.feet(0))
      expect(parse('-1')).to.deep.equal(undefined)
    })
    it('throws if value is invalid', () => {
      expect(() => parse('')).to.throw('missing length')
      expect(() => parse('    ')).to.throw('missing length')
      expect(() => parse('q')).to.throw('invalid length')
      expect(() => parse('2.35q')).to.throw('invalid length')
    })
  })
  describe('parseAzimuth', () => {
    const parse = (value: string): UnitizedNumber<Angle> =>
      parseAzimuth(
        new SegmentParser(new Segment({ value, source: 'test.dat' })),
        'azimuth'
      )
    it('works', () => {
      expect(parse('2.3')).to.deep.equal(Unitize.degrees(2.3))
      expect(parse('2.3 something else')).to.deep.equal(Unitize.degrees(2.3))
      expect(parse('0')).to.deep.equal(Unitize.degrees(0))
      expect(parse('360')).to.deep.equal(Unitize.degrees(360))
      expect(parse('-999')).to.deep.equal(undefined)
    })
    it('throws if value is invalid', () => {
      expect(() => parse('')).to.throw('missing azimuth')
      expect(() => parse('    ')).to.throw('missing azimuth')
      expect(() => parse('q')).to.throw('invalid azimuth')
      expect(() => parse('2.35q')).to.throw('invalid azimuth')
      expect(() => parse('-1')).to.throw('invalid azimuth')
      expect(() => parse('361')).to.throw('invalid azimuth')
    })
  })
  describe('parseInclination', () => {
    const parse = (value: string): UnitizedNumber<Angle> =>
      parseInclination(
        new SegmentParser(new Segment({ value, source: 'test.dat' })),
        'inclination'
      )
    it('works', () => {
      expect(parse('2.3')).to.deep.equal(Unitize.degrees(2.3))
      expect(parse('2.3 something else')).to.deep.equal(Unitize.degrees(2.3))
      expect(parse('0')).to.deep.equal(Unitize.degrees(0))
      expect(parse('90')).to.deep.equal(Unitize.degrees(90))
      expect(parse('-90')).to.deep.equal(Unitize.degrees(-90))
      expect(parse('-999')).to.deep.equal(undefined)
    })
    it('throws if value is invalid', () => {
      expect(() => parse('')).to.throw('missing inclination')
      expect(() => parse('    ')).to.throw('missing inclination')
      expect(() => parse('q')).to.throw('invalid inclination')
      expect(() => parse('2.35q')).to.throw('invalid inclination')
      expect(() => parse('-91')).to.throw('invalid inclination')
      expect(() => parse('91')).to.throw('invalid inclination')
    })
  })
  describe('parseFormat', () => {
    const parse = (value: string): Partial<CompassTripHeader> => {
      const parser = new SegmentParser(
        new Segment({ value, source: 'test.dat' })
      )
      const header: Partial<CompassTripHeader> = {}
      parseFormat(parser, header)
      return header
    }
    it('missing frontsight item', () => {
      expect(() => parse('QIMWDURLDA')).to.throw('missing frontsight item')
    })
    it('invalid frontsight item', () => {
      expect(() => parse('QIMWDURLDAQ')).to.throw('invalid frontsight item')
    })
    it('duplicate frontsight item', () => {
      expect(() => parse('DDDDLRUDDDA')).to.throw('duplicate frontsight item')
    })
    it('missing lrud item', () => {
      expect(() => parse('QIMWDUR')).to.throw('missing lrud item')
    })
    it('invalid lrud item', () => {
      expect(() => parse('QIMWDURQ')).to.throw('invalid lrud item')
    })
    it('duplicate lrud item', () => {
      expect(() => parse('DDDDLRDDLAD')).to.throw('duplicate lrud item')
    })
    it('works', () => {
      expect(parse('QIMWDURLDAL')).to.deep.equal({
        distanceUnit: DistanceUnit.FeetAndInches,
        azimuthUnit: AzimuthUnit.Quads,
        inclinationUnit: InclinationUnit.DepthGauge,
        lrudUnit: DistanceUnit.Meters,
        lrudOrder: [LrudItem.Down, LrudItem.Up, LrudItem.Right, LrudItem.Left],
        frontsightOrder: [
          FrontsightItem.Inclination,
          FrontsightItem.Azimuth,
          FrontsightItem.Distance,
        ],
      })
      expect(parse('QIMWDURLDALNF')).to.deep.equal({
        distanceUnit: DistanceUnit.FeetAndInches,
        azimuthUnit: AzimuthUnit.Quads,
        inclinationUnit: InclinationUnit.DepthGauge,
        lrudUnit: DistanceUnit.Meters,
        lrudOrder: [LrudItem.Down, LrudItem.Up, LrudItem.Right, LrudItem.Left],
        frontsightOrder: [
          FrontsightItem.Inclination,
          FrontsightItem.Azimuth,
          FrontsightItem.Distance,
        ],
        hasRedundantBacksights: false,
        lrudAssociation: LrudAssociation.FromStation,
      })
      expect(parse('QIMWDURLDALdaBF')).to.deep.equal({
        distanceUnit: DistanceUnit.FeetAndInches,
        azimuthUnit: AzimuthUnit.Quads,
        inclinationUnit: InclinationUnit.DepthGauge,
        lrudUnit: DistanceUnit.Meters,
        lrudOrder: [LrudItem.Down, LrudItem.Up, LrudItem.Right, LrudItem.Left],
        frontsightOrder: [
          FrontsightItem.Inclination,
          FrontsightItem.Azimuth,
          FrontsightItem.Distance,
        ],
        backsightOrder: [BacksightItem.Inclination, BacksightItem.Azimuth],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.FromStation,
      })
    })
  })
  describe('trip header parsing', () => {
    const parse = async (value: string): Promise<CompassTripHeader> => {
      return (await parseCompassDatFile('test.dat', linesOf(value))).trips[0]
        .header
    }
    it('unexpected form feed before end of trip header', async (): Promise<
      void
    > => {
      const data = `Gillock's Cave or Devil's Backbone Cave
SURVEY NAME: 3
SURVEY DATE: 5 25 2015  COMMENT:The Windmaker and beyond
SURVEY TEAM:
Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner
DECLINATION: 2.00  FORMAT: DDDDLRUDLADadBT  CORRECTIONS: 3.00 4.00 5.00  CORRECTIONS2: 6.00 7.00

FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS
\f
`
      await expect(parse(data)).to.be.rejectedWith(
        'unexpected form feed before end of trip header'
      )
    })
    it('full example', async (): Promise<void> => {
      const data = `Gillock's Cave or Devil's Backbone Cave
SURVEY NAME: 3
SURVEY DATE: 5 25 2015  COMMENT:The Windmaker and beyond
SURVEY TEAM:
Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner
DECLINATION: 2.00  FORMAT: DDDDLRUDLADadBT  CORRECTIONS: 3.00 4.00 5.00  CORRECTIONS2: 6.00 7.00

FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS

\f
`
      expect(await parse(data)).to.deep.equal({
        cave: `Gillock's Cave or Devil's Backbone Cave`,
        name: '3',
        date: new Date('May 25, 2015'),
        comment: 'The Windmaker and beyond',
        team:
          'Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner',
        declination: Unitize.degrees(2),
        azimuthUnit: AzimuthUnit.Degrees,
        distanceUnit: DistanceUnit.DecimalFeet,
        lrudUnit: DistanceUnit.DecimalFeet,
        inclinationUnit: InclinationUnit.Degrees,
        lrudOrder: [LrudItem.Left, LrudItem.Right, LrudItem.Up, LrudItem.Down],
        frontsightOrder: [
          FrontsightItem.Distance,
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
        ],
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        distanceCorrection: Unitize.feet(3),
        frontsightAzimuthCorrection: Unitize.degrees(4),
        frontsightInclinationCorrection: Unitize.degrees(5),
        backsightAzimuthCorrection: Unitize.degrees(6),
        backsightInclinationCorrection: Unitize.degrees(7),
      })
    })
    it('no CORRECTIONS2', async (): Promise<void> => {
      const data = `Gillock's Cave or Devil's Backbone Cave
SURVEY NAME: 3
SURVEY DATE: 5 25 2015  COMMENT:The Windmaker and beyond
SURVEY TEAM:
Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner
DECLINATION: 2.00  FORMAT: DDDDLRUDLADadBT  CORRECTIONS: 3.00 4.00 5.00

FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS

\f
`
      expect(await parse(data)).to.deep.equal({
        cave: `Gillock's Cave or Devil's Backbone Cave`,
        name: '3',
        date: new Date('May 25, 2015'),
        comment: 'The Windmaker and beyond',
        team:
          'Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner',
        declination: Unitize.degrees(2),
        azimuthUnit: AzimuthUnit.Degrees,
        distanceUnit: DistanceUnit.DecimalFeet,
        lrudUnit: DistanceUnit.DecimalFeet,
        inclinationUnit: InclinationUnit.Degrees,
        lrudOrder: [LrudItem.Left, LrudItem.Right, LrudItem.Up, LrudItem.Down],
        frontsightOrder: [
          FrontsightItem.Distance,
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
        ],
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
        distanceCorrection: Unitize.feet(3),
        frontsightAzimuthCorrection: Unitize.degrees(4),
        frontsightInclinationCorrection: Unitize.degrees(5),
      })
    })
    it('no CORRECTIONS', async (): Promise<void> => {
      const data = `Gillock's Cave or Devil's Backbone Cave
SURVEY NAME: 3
SURVEY DATE: 5 25 2015  COMMENT:The Windmaker and beyond
SURVEY TEAM:
Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner
DECLINATION: 2.00  FORMAT: DDDDLRUDLADadBT

FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS

\f
`
      expect(await parse(data)).to.deep.equal({
        cave: `Gillock's Cave or Devil's Backbone Cave`,
        name: '3',
        date: new Date('May 25, 2015'),
        comment: 'The Windmaker and beyond',
        team:
          'Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner',
        declination: Unitize.degrees(2),
        azimuthUnit: AzimuthUnit.Degrees,
        distanceUnit: DistanceUnit.DecimalFeet,
        lrudUnit: DistanceUnit.DecimalFeet,
        inclinationUnit: InclinationUnit.Degrees,
        lrudOrder: [LrudItem.Left, LrudItem.Right, LrudItem.Up, LrudItem.Down],
        frontsightOrder: [
          FrontsightItem.Distance,
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
        ],
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
      })
    })
    it('no COMMENT', async (): Promise<void> => {
      const data = `Gillock's Cave or Devil's Backbone Cave
SURVEY NAME: 3
SURVEY DATE: 5 25 2015
SURVEY TEAM:
Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner
DECLINATION: 2.00  FORMAT: DDDDLRUDLADadBT

FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS

\f
`
      expect(await parse(data)).to.deep.equal({
        cave: `Gillock's Cave or Devil's Backbone Cave`,
        name: '3',
        date: new Date('May 25, 2015'),
        comment: null,
        team:
          'Sean Lewis;Andy Edwars;Eric Frederickson;Ian Chechet;Chase Varner',
        declination: Unitize.degrees(2),
        azimuthUnit: AzimuthUnit.Degrees,
        distanceUnit: DistanceUnit.DecimalFeet,
        lrudUnit: DistanceUnit.DecimalFeet,
        inclinationUnit: InclinationUnit.Degrees,
        lrudOrder: [LrudItem.Left, LrudItem.Right, LrudItem.Up, LrudItem.Down],
        frontsightOrder: [
          FrontsightItem.Distance,
          FrontsightItem.Azimuth,
          FrontsightItem.Inclination,
        ],
        backsightOrder: [BacksightItem.Azimuth, BacksightItem.Inclination],
        hasRedundantBacksights: true,
        lrudAssociation: LrudAssociation.ToStation,
      })
    })
  })
  describe('shot parsing', () => {
    describe('without backsights', () => {
      const parse = async (value: string): Promise<CompassShot> => {
        const data = `Some Cave
SURVEY NAME: 3
SURVEY DATE: 5 25 2015
SURVEY TEAM:

DECLINATION: 2.00  FORMAT: DDDDLRUDLADN

FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    FLAGS COMMENTS

${value}
\f
`
        return (await parseCompassDatFile('test.dat', linesOf(data))).trips[0]
          .shots[0]
      }

      it('empty line', async function() {
        expect(await parse('  ')).to.equal(undefined)
      })

      it('missing to station', async function() {
        await expect(parse('  A1')).to.be.rejectedWith('missing to station')
      })
      it('missing distance', async function() {
        await expect(parse('       A1LRUD           A1')).to.be.rejectedWith(
          'missing distance'
        )
      })
      it('null distance', async function() {
        await expect(
          parse('       A1LRUD           A1  -999.00')
        ).to.be.rejectedWith('distance is required')
      })
      it('missing frontsight azimuth', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00')
        ).to.be.rejectedWith('missing frontsight azimuth')
      })
      it('missing frontsight inclination', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00    2.00')
        ).to.be.rejectedWith('missing frontsight inclination')
      })
      it('missing left', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00    2.00    3.00')
        ).to.be.rejectedWith('missing left')
      })
      it('missing up', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00    2.00    3.00    4.00')
        ).to.be.rejectedWith('missing up')
      })
      it('missing down', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00'
          )
        ).to.be.rejectedWith('missing down')
      })
      it('missing right', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00'
          )
        ).to.be.rejectedWith('missing right')
      })
      it('comment after flag', async function() {
        expect(
          await parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00 #|L# Foobar'
          )
        ).to.deep.equal({
          from: 'A1LRUD',
          to: 'A1',
          distance: Unitize.feet(1),
          frontsightAzimuth: Unitize.degrees(2),
          frontsightInclination: Unitize.degrees(3),
          backsightAzimuth: undefined,
          backsightInclination: undefined,
          left: Unitize.feet(4),
          up: Unitize.feet(5),
          down: Unitize.feet(6),
          right: Unitize.feet(7),
          excludeDistance: true,
          comment: 'Foobar',
        })
      })
      it('comment without flag', async function() {
        expect(
          await parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00 Foobar'
          )
        ).to.deep.equal({
          from: 'A1LRUD',
          to: 'A1',
          distance: Unitize.feet(1),
          frontsightAzimuth: Unitize.degrees(2),
          frontsightInclination: Unitize.degrees(3),
          backsightAzimuth: undefined,
          backsightInclination: undefined,
          left: Unitize.feet(4),
          up: Unitize.feet(5),
          down: Unitize.feet(6),
          right: Unitize.feet(7),
          comment: 'Foobar',
        })
      })
      it('all flags', async function() {
        expect(
          await parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00 #|LPXC#'
          )
        ).to.deep.equal({
          from: 'A1LRUD',
          to: 'A1',
          distance: Unitize.feet(1),
          frontsightAzimuth: Unitize.degrees(2),
          frontsightInclination: Unitize.degrees(3),
          backsightAzimuth: undefined,
          backsightInclination: undefined,
          left: Unitize.feet(4),
          up: Unitize.feet(5),
          down: Unitize.feet(6),
          right: Unitize.feet(7),
          excludeDistance: true,
          excludeFromAllProcessing: true,
          excludeFromPlotting: true,
          doNotAdjust: true,
        })
      })
      it('invalid flags', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00 #|LRXC#'
          )
        ).to.be.rejectedWith('invalid flag')
      })
      it('missing | at start of flags', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00 #LC'
          )
        ).to.be.rejectedWith('expected |')
      })
      it('missing # after flags', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00 #|LC'
          )
        ).to.be.rejectedWith('missing # after flags')
      })
    })
    describe('with backsights', () => {
      const parse = async (value: string): Promise<CompassShot> => {
        const data = `Some Cave
SURVEY NAME: 3
SURVEY DATE: 5 25 2015
SURVEY TEAM:

DECLINATION: 2.00  FORMAT: DDDDLRUDLADadBT

FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS

${value}
\f
`
        return (await parseCompassDatFile('test.dat', linesOf(data))).trips[0]
          .shots[0]
      }

      it('missing to station', async function() {
        await expect(parse('  A1')).to.be.rejectedWith('missing to station')
      })
      it('missing distance', async function() {
        await expect(parse('       A1LRUD           A1')).to.be.rejectedWith(
          'missing distance'
        )
      })
      it('null distance', async function() {
        await expect(
          parse('       A1LRUD           A1  -999.00')
        ).to.be.rejectedWith('distance is required')
      })
      it('missing frontsight azimuth', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00')
        ).to.be.rejectedWith('missing frontsight azimuth')
      })
      it('missing frontsight inclination', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00    2.00')
        ).to.be.rejectedWith('missing frontsight inclination')
      })
      it('missing left', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00    2.00    3.00')
        ).to.be.rejectedWith('missing left')
      })
      it('missing up', async function() {
        await expect(
          parse('       A1LRUD           A1    1.00    2.00    3.00    4.00')
        ).to.be.rejectedWith('missing up')
      })
      it('missing down', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00'
          )
        ).to.be.rejectedWith('missing down')
      })
      it('missing right', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00'
          )
        ).to.be.rejectedWith('missing right')
      })
      it('missing backsight azimuth', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00'
          )
        ).to.be.rejectedWith('missing backsight azimuth')
      })
      it('missing backsight inclination', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00    8.00    '
          )
        ).to.be.rejectedWith('missing backsight inclination')
      })

      it('comment after flag', async function() {
        expect(
          await parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00    8.00    9.00 #|L# Foobar'
          )
        ).to.deep.equal({
          from: 'A1LRUD',
          to: 'A1',
          distance: Unitize.feet(1),
          frontsightAzimuth: Unitize.degrees(2),
          frontsightInclination: Unitize.degrees(3),
          left: Unitize.feet(4),
          up: Unitize.feet(5),
          down: Unitize.feet(6),
          right: Unitize.feet(7),
          backsightAzimuth: Unitize.degrees(8),
          backsightInclination: Unitize.degrees(9),
          excludeDistance: true,
          comment: 'Foobar',
        })
      })
      it('comment without flag', async function() {
        expect(
          await parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00    8.00    9.00 Foobar'
          )
        ).to.deep.equal({
          from: 'A1LRUD',
          to: 'A1',
          distance: Unitize.feet(1),
          frontsightAzimuth: Unitize.degrees(2),
          frontsightInclination: Unitize.degrees(3),
          left: Unitize.feet(4),
          up: Unitize.feet(5),
          down: Unitize.feet(6),
          right: Unitize.feet(7),
          backsightAzimuth: Unitize.degrees(8),
          backsightInclination: Unitize.degrees(9),
          comment: 'Foobar',
        })
      })
      it('all flags', async function() {
        expect(
          await parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00    8.00    9.00 #|LPXC#'
          )
        ).to.deep.equal({
          from: 'A1LRUD',
          to: 'A1',
          distance: Unitize.feet(1),
          frontsightAzimuth: Unitize.degrees(2),
          frontsightInclination: Unitize.degrees(3),
          left: Unitize.feet(4),
          up: Unitize.feet(5),
          down: Unitize.feet(6),
          right: Unitize.feet(7),
          backsightAzimuth: Unitize.degrees(8),
          backsightInclination: Unitize.degrees(9),
          excludeDistance: true,
          excludeFromAllProcessing: true,
          excludeFromPlotting: true,
          doNotAdjust: true,
        })
      })
      it('invalid flags', async function() {
        await expect(
          parse(
            '       A1LRUD           A1    1.00    2.00    3.00    4.00    5.00    6.00    7.00    8.00    9.00 #|LRXC#'
          )
        ).to.be.rejectedWith('invalid flag')
      })
    })
  })
})

import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  formatCompassDatFileDirective,
  parseCompassDatFileDirective,
  CompassDatFileDirective,
} from './CompassDatFileDirective'
import { datFile } from './directives'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { Segment, SegmentParser } from 'parse-segment'
import { Unitize } from '@speleotica/unitized'
import * as directives from './directives'

describe('formatCompassDatFileDirective', function() {
  it('validates station names', function() {
    expect(() =>
      formatCompassDatFileDirective(datFile('foo.dat', [{ station: 'A 1' }]))
    ).to.throw
  })
})

const parse = (value: string): CompassDatFileDirective =>
  parseCompassDatFileDirective(
    new SegmentParser(
      new Segment({
        value: `${CompassMakDirectiveType.DatFile}${value}`,
        source: 'test.mak',
      })
    )
  )

describe('parseCompassDatFileDirective', function() {
  it('works', () => {
    expect(parse(`foo.dat,A1,A2[M,2,3,4],A3[F,5,6,7];`)).to.deep.equal(
      directives.datFile('foo.dat', [
        { station: 'A1' },
        {
          station: 'A2',
          location: {
            easting: Unitize.meters(2),
            northing: Unitize.meters(3),
            elevation: Unitize.meters(4),
          },
        },
        {
          station: 'A3',
          location: {
            easting: Unitize.feet(5),
            northing: Unitize.feet(6),
            elevation: Unitize.feet(7),
          },
        },
      ])
    )
  })
  it('errors on missing station', () => {
    expect(() => parse('foo.dat,;')).to.throw('missing station')
    expect(() => parse('foo.dat,A1,;')).to.throw('missing station')
    expect(() => parse('foo.dat,A1,A2,;')).to.throw('missing station')
    expect(() => parse('foo.dat,A1[F,1,2,3],;')).to.throw('missing station')
  })
  it('errors on missing closing ]', () => {
    expect(() => parse('foo.dat,A1[F,1,2,3;')).to.throw('missing closing ]')
  })
  it('errors on missing ;', () => {
    expect(() => parse('foo.dat')).to.throw('missing ; at end of directive')
  })
})

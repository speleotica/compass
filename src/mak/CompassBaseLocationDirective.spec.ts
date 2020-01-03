import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  parseCompassBaseLocationDirective,
  CompassBaseLocationDirective,
} from './CompassBaseLocationDirective'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, Segment } from 'parse-segment'
import { Unitize } from '@speleotica/unitized'
import * as directives from './directives'

const parse = (value: string): CompassBaseLocationDirective =>
  parseCompassBaseLocationDirective(
    new SegmentParser(
      new Segment({
        value: `${CompassMakDirectiveType.BaseLocation}${value}`,
        source: 'test.mak',
      })
    )
  )

describe('parseCompassBaseLocationDirective', function() {
  it('works', () => {
    expect(parse(`2.34,-5.36, 8.5 ,16, 2.30;`)).to.deep.equal(
      directives.baseLocation(
        Unitize.meters(2.34),
        Unitize.meters(-5.36),
        Unitize.meters(8.5),
        16,
        Unitize.degrees(2.3)
      )
    )
  })
  it('errors on missing ;', () => {
    expect(() => parse('2.34')).to.throw('missing ; at end of directive')
  })
  it('errors on missing easting', () => {
    expect(() => parse(';')).to.throw('missing easting')
  })
  it('errors on invalid easting', () => {
    expect(() => parse('2.a34,-5.36,8.5,16,2.34;')).to.throw('invalid easting')
  })
  it('errors on missing northing', () => {
    expect(() => parse(`2.34;`)).to.throw('missing northing')
  })
  it('errors on invalid northing', () => {
    expect(() => parse(`2.34,-5a.36,8.5,16,2.34;`)).to.throw('invalid northing')
  })
  it('errors on missing elevation', () => {
    expect(() => parse(`2.34,3.45;`)).to.throw('missing elevation')
  })
  it('errors on invalid elevation', () => {
    expect(() => parse(`2.34,-5.36,q,16,2.34;`)).to.throw('invalid elevation')
  })
  it('errors on missing utmZone', () => {
    expect(() => parse(`2.34,3.45;`)).to.throw('missing elevation')
  })
  it('errors on invalid utmZone', () => {
    expect(() => parse(`2.34,-5.36,3.4,0,2.34;`)).to.throw('invalid UTM zone')
    expect(() => parse(`2.34,-5.36,3.4,61,2.34;`)).to.throw('invalid UTM zone')
    expect(() => parse(`2.34,-5.36,3.4,32.5,2.34;`)).to.throw(
      'invalid UTM zone'
    )
    expect(() => parse(`2.34,-5.36,3.4,60N,2.34;`)).to.throw('invalid UTM zone')
  })
  it('errors on missing convergence angle', () => {
    expect(() => parse(`2.34,-5.36, 8.5 ,16;`)).to.throw(
      'missing convergence angle'
    )
  })
  it('errors on invalid convergence angle', () => {
    expect(() => parse(`2.34,-5.36, 8.5 ,16, 90;`)).to.throw(
      'invalid convergence angle'
    )
  })
  it('errors on extra field after convergence angle', () => {
    expect(() => parse(`2.34,-5.36, 8.5 ,16,2.34,;`)).to.throw(
      'excess field after convergence angle'
    )
  })
})

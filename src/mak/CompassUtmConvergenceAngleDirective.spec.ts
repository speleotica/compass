import { describe, it } from 'mocha'
import { expect } from 'chai'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, Segment } from 'parse-segment'
import {
  parseCompassUtmConvergenceAngleDirective,
  CompassUtmConvergenceAngleDirective,
} from './CompassUtmConvergenceAngleDirective'
import { Unitize } from '@speleotica/unitized'
import * as directives from './directives'

const parse = (value: string): CompassUtmConvergenceAngleDirective =>
  parseCompassUtmConvergenceAngleDirective(
    new SegmentParser(
      new Segment({
        value: `${CompassMakDirectiveType.UtmConvergenceAngle}${value}`,
        source: 'test.mak',
      })
    )
  )

describe('parseCompassUtmConvergenceAngleDirective', function () {
  it('works', () => {
    expect(parse(`2.34;`)).to.deep.equal(
      directives.utmConvergenceAngle(Unitize.degrees(2.34))
    )
  })
  it('errors on invalid angle', () => {
    expect(() => parse('-46;')).to.throw('invalid convergence angle')
    expect(() => parse('46;')).to.throw('invalid convergence angle')
    expect(() => parse('a;')).to.throw('invalid convergence angle')
    expect(() => parse('3.2a;')).to.throw('invalid convergence angle')
  })
  it('errors on missing ;', () => {
    expect(() => parse('2.34')).to.throw('missing ; at end of directive')
  })
})

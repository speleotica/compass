import { describe, it } from 'mocha'
import { expect } from 'chai'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, Segment } from 'parse-segment'
import {
  parseCompassDatumDirective,
  CompassDatumDirective,
} from './CompassDatumDirective'
import * as directives from './directives'

const parse = (value: string): CompassDatumDirective =>
  parseCompassDatumDirective(
    new SegmentParser(
      new Segment({
        value: `${CompassMakDirectiveType.Datum}${value}`,
        source: 'test.mak',
      })
    )
  )

describe('parseCompassDatumDirective', function () {
  it('works', () => {
    expect(parse(` WGS 1984 ;`)).to.deep.equal(directives.datum('WGS 1984'))
  })
  it('errors on missing ;', () => {
    expect(() => parse('WGS 1984')).to.throw('missing ; at end of directive')
  })
})

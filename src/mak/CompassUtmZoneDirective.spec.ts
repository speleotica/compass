import { describe, it } from 'mocha'
import { expect } from 'chai'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, Segment } from 'parse-segment'
import {
  parseCompassUtmZoneDirective,
  CompassUtmZoneDirective,
} from './CompassUtmZoneDirective'
import * as directives from './directives'

const parse = (value: string): CompassUtmZoneDirective =>
  parseCompassUtmZoneDirective(
    new SegmentParser(
      new Segment({
        value: `${CompassMakDirectiveType.UtmZone}${value}`,
        source: 'test.mak',
      })
    )
  )

describe('parseCompassUtmZoneDirective', function() {
  it('works', () => {
    expect(parse(`13;`)).to.deep.equal(directives.utmZone(13))
  })
  it('errors on invalid utm zone', () => {
    expect(() => parse('0;')).to.throw('invalid UTM zone')
    expect(() => parse('61;')).to.throw('invalid UTM zone')
    expect(() => parse('15.2;')).to.throw('invalid UTM zone')
    expect(() => parse('a;')).to.throw('invalid UTM zone')
    expect(() => parse('32a;')).to.throw('invalid UTM zone')
  })
  it('errors on missing ;', () => {
    expect(() => parse('3')).to.throw('missing ; at end of directive')
  })
})

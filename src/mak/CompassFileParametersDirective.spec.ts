import { describe, it } from 'mocha'
import { expect } from 'chai'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, Segment } from 'parse-segment'
import {
  parseCompassFileParametersDirective,
  LrudAssociation,
  CompassFileParametersDirective,
} from './CompassFileParametersDirective'
import * as directives from './directives'

const parse = (value: string): CompassFileParametersDirective =>
  parseCompassFileParametersDirective(
    new SegmentParser(
      new Segment({
        value: `${CompassMakDirectiveType.FileParameters}${value}`,
        source: 'test.mak',
      })
    )
  )

describe('parseCompassFileParametersDirective', function() {
  it('works', () => {
    expect(parse(`ot;`)).to.deep.equal(
      directives.fileParameters(false, LrudAssociation.FromStation)
    )
    expect(parse(`Ot;`)).to.deep.equal(
      directives.fileParameters(true, LrudAssociation.FromStation)
    )
    expect(parse(`OT;`)).to.deep.equal(
      directives.fileParameters(true, LrudAssociation.ToStation)
    )
  })
  it('errors on invalid character', () => {
    expect(() => parse('f;')).to.throw('invalid character')
  })
  it('errors on missing ;', () => {
    expect(() => parse('WGS 1984')).to.throw('missing ; at end of directive')
  })
})

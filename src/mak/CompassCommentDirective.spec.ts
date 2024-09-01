import { describe, it } from 'mocha'
import { expect } from 'chai'
import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, Segment } from 'parse-segment'
import {
  parseCompassCommentDirective,
  CompassCommentDirective,
} from './CompassCommentDirective'
import * as directives from './directives'

const parse = (value: string): CompassCommentDirective =>
  parseCompassCommentDirective(
    new SegmentParser(
      new Segment({
        value: `${CompassMakDirectiveType.Comment}${value}`,
        source: 'test.mak',
      })
    )
  )

describe('parseCompassCommentDirective', function () {
  it('works', () => {
    expect(parse(` blah blah blah`)).to.deep.equal(
      directives.comment(' blah blah blah')
    )
  })
})

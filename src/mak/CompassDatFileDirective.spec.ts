import { describe, it } from 'mocha'
import { expect } from 'chai'
import { formatCompassDatFileDirective } from './CompassDatFileDirective'
import { datFile } from './directives'

describe('formatCompassDatFileDirective', function() {
  it('validates station names', function() {
    expect(() =>
      formatCompassDatFileDirective(datFile('foo.dat', [{ station: 'A 1' }]))
    ).to.throw
  })
})

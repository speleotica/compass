import { describe, it } from 'mocha'
import { expect } from 'chai'
import isValidStationName, {
  assertValidStationName,
} from './isValidStationName'

const valid = ['A1', 'foo-bar_baz', '[!@#$!^blah~', '012345678901']
const invalid = ['', ' ', 'A 1', '0123456789012', 'A\x80', 'A\x81', ' A', 'A ']

describe('isValidStationName', function () {
  for (const stationName of valid) {
    it(`accepts "${stationName}"`, function () {
      expect(isValidStationName(stationName)).to.be.true
    })
  }
  for (const stationName of invalid) {
    it(`rejects "${stationName.replace(/./g, (s) =>
      s < '\x20' || s > '\x7f' ? `\\x${s.charCodeAt(0).toString(16)}` : s
    )}"`, function () {
      expect(isValidStationName(stationName)).to.be.false
    })
  }
})
describe('assertValidStationName', function () {
  for (const stationName of valid) {
    it(`accepts "${stationName}"`, function () {
      assertValidStationName(stationName)
    })
  }
  for (const stationName of invalid) {
    const formatted = stationName.replace(/./g, (s) =>
      s < '\x20' || s > '\x7f' ? `\\x${s.charCodeAt(0).toString(16)}` : s
    )
    it(`rejects "${formatted}"`, function () {
      expect(() => assertValidStationName(stationName)).to.throw(
        Error,
        `Invalid station name: ${formatted}`
      )
    })
  }
})

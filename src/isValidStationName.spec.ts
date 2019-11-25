import { describe, it } from 'mocha'
import { expect } from 'chai'
import isValidStationName from './isValidStationName'

describe('isValidStationName', function() {
  for (const stationName of [
    'A1',
    'foo-bar_baz',
    '[!@#$!^blah~',
    '012345678901',
  ]) {
    it(`accepts "${stationName}"`, function() {
      expect(isValidStationName(stationName)).to.be.true
    })
  }
  for (const stationName of [
    '',
    ' ',
    'A 1',
    '0123456789012',
    'A\x80',
    'A\x81',
    ' A',
    'A ',
  ]) {
    it(`rejects "${stationName.replace(/./g, s =>
      s < '\x20' || s > '\x7f' ? `\\x${s.charCodeAt(0).toString(16)}` : s
    )}"`, function() {
      expect(isValidStationName(stationName)).to.be.false
    })
  }
})

import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser, SegmentParseError } from 'parse-segment'

export enum LrudAssociation {
  FromStation = 't',
  ToStation = 'T',
}

export type CompassFileParametersDirective = {
  type: CompassMakDirectiveType.FileParameters
  overrideLrudAssociations: boolean
  lrudAssociation: LrudAssociation
}

export function formatCompassFileParametersDirective({
  type,
  overrideLrudAssociations,
  lrudAssociation,
}: CompassFileParametersDirective): string {
  return `${type}${overrideLrudAssociations ? 'O' : 'o'}${lrudAssociation};\r\n`
}

export function parseCompassFileParametersDirective(
  parser: SegmentParser
): CompassFileParametersDirective {
  parser.expect(CompassMakDirectiveType.FileParameters)
  const rest = parser.nextDelimited(/;/, 'missing ; at end of directive').trim()
  let overrideLrudAssociations = false
  let lrudAssociation = LrudAssociation.FromStation
  for (let i = 0; i < rest.length; i++) {
    switch (rest.charAt(i).toString()) {
      case 'O':
        overrideLrudAssociations = true
        break
      case 'o':
        overrideLrudAssociations = false
        break
      case 'T':
        lrudAssociation = LrudAssociation.ToStation
        break
      case 't':
        lrudAssociation = LrudAssociation.FromStation
        break
      default:
        throw new SegmentParseError('invalid character', rest.charAt(i))
    }
  }
  return {
    type: CompassMakDirectiveType.FileParameters,
    overrideLrudAssociations,
    lrudAssociation,
  }
}

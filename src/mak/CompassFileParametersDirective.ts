import { CompassMakDirectiveType } from './CompassMakDirective'

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

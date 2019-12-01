import { UnitizedNumber, Length, Angle, Unitize } from '@speleotica/unitized'
import { CompassBaseLocationDirective } from './CompassBaseLocationDirecive'
import { CompassMakDirectiveType } from './CompassMakDirective'
import {
  CompassLinkStation,
  CompassDatFileDirective,
} from './CompassDatFileDirective'
import { CompassDatumDirective } from './CompassDatumDirective'
import {
  CompassFileParametersDirective,
  LrudAssociation,
} from './CompassFileParametersDirective'
import { CompassUtmConvergenceAngleDirective } from './CompassUtmCovergenceAngleDirective'
import { CompassUtmZoneDirective } from './CompassUtmZoneDirective'

export function baseLocation(
  utmEasting: UnitizedNumber<Length>,
  utmNorthing: UnitizedNumber<Length>,
  elevation: UnitizedNumber<Length>,
  utmZone: number,
  utmConvergenceAngle: UnitizedNumber<Angle> = Unitize.degrees(0)
): CompassBaseLocationDirective {
  return {
    type: CompassMakDirectiveType.BaseLocation,
    utmEasting,
    utmNorthing,
    elevation,
    utmZone,
    utmConvergenceAngle,
  }
}

export function datFile(
  file: string,
  linkStations?: Array<CompassLinkStation>
): CompassDatFileDirective {
  return {
    type: CompassMakDirectiveType.DatFile,
    file,
    linkStations,
  }
}

export function datum(datum: string): CompassDatumDirective {
  return {
    type: CompassMakDirectiveType.Datum,
    datum,
  }
}

export function fileParameters(
  overrideLrudAssociations: boolean,
  lrudAssociation: LrudAssociation
): CompassFileParametersDirective {
  return {
    type: CompassMakDirectiveType.FileParameters,
    overrideLrudAssociations,
    lrudAssociation,
  }
}

export function utmConvergenceAngle(
  utmConvergenceAngle: UnitizedNumber<Angle>
): CompassUtmConvergenceAngleDirective {
  return {
    type: CompassMakDirectiveType.UtmConvergenceAngle,
    utmConvergenceAngle,
  }
}

export function utmZone(utmZone: number): CompassUtmZoneDirective {
  return {
    type: CompassMakDirectiveType.UtmZone,
    utmZone,
  }
}

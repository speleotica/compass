import { CompassMakDirectiveType } from './CompassMakDirective'
import { UnitizedNumber, Length } from '@speleotica/unitized'
import { assertValidStationName } from '../isValidStationName'

export type CompassLinkStation = {
  station: string
  location?: {
    easting: UnitizedNumber<Length>
    northing: UnitizedNumber<Length>
    elevation: UnitizedNumber<Length>
  } | null
}

export function formatCompassLinkStation({
  station,
  location,
}: CompassLinkStation): string {
  assertValidStationName(station)
  if (!location) return station
  const { easting, northing, elevation } = location
  const unit = easting.unit === Length.feet ? Length.feet : Length.meters
  const parts = [
    unit === Length.feet ? 'F' : 'M',
    easting.get(unit).toFixed(3),
    northing.get(unit).toFixed(3),
    elevation.get(unit).toFixed(3),
  ]
  return `${station}[${parts.join(',')}]`
}

export type CompassDatFileDirective = {
  type: CompassMakDirectiveType.DatFile
  file: string
  linkStations?: Array<CompassLinkStation> | null
}
export function formatCompassDatFileDirective({
  type,
  file,
  linkStations,
}: CompassDatFileDirective): string {
  if (!linkStations || !linkStations.length) return `${type}${file};\r\n`
  if (linkStations.length === 1)
    return `${type}${file},${formatCompassLinkStation(linkStations[0])};\r\n`
  return `${type}${file},\r\n  ${linkStations
    .map(formatCompassLinkStation)
    .join(',\r\n  ')};\r\n`
}

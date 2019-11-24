import { describe, it } from 'mocha'
import { expect } from 'chai'
import { formatCompassMakFile, CompassMakDirectiveType } from './index'
import { Length, Angle } from '@speleotica/unitized'
import { LrudAssociation } from './CompassFileParametersDirective'

describe('formatCompassMakFile', function() {
  it('works', function() {
    expect(
      formatCompassMakFile({
        directives: [
          {
            type: CompassMakDirectiveType.BaseLocation,
            utmEasting: Length.feet(100),
            utmNorthing: Length.meters(200),
            elevation: Length.meters(300),
            utmZone: 13,
            utmConvergenceAngle: Angle.gradians(50),
          },
          {
            type: CompassMakDirectiveType.Datum,
            datum: 'WGS 1984',
          },
          {
            type: CompassMakDirectiveType.UtmConvergenceAngle,
            utmConvergenceAngle: Angle.degrees(2),
          },
          {
            type: CompassMakDirectiveType.UtmZone,
            utmZone: 14,
          },
          {
            type: CompassMakDirectiveType.FileParameters,
            overrideLrudAssociations: true,
            lrudAssociation: LrudAssociation.FromStation,
          },
          {
            type: CompassMakDirectiveType.FileParameters,
            overrideLrudAssociations: false,
            lrudAssociation: LrudAssociation.ToStation,
          },
          {
            type: CompassMakDirectiveType.DatFile,
            file: 'Foo.dat',
          },
          {
            type: CompassMakDirectiveType.DatFile,
            file: 'Bar.dat',
            linkStations: [{ station: 'A1' }],
          },
          {
            type: CompassMakDirectiveType.DatFile,
            file: 'Baz.dat',
            linkStations: [
              { station: 'A1' },
              {
                station: 'A2',
                location: {
                  easting: Length.feet(23),
                  northing: Length.feet(83),
                  elevation: Length.feet(2),
                },
              },
              {
                station: 'A3',
                location: {
                  easting: Length.meters(23),
                  northing: Length.feet(83),
                  elevation: Length.feet(2),
                },
              },
            ],
          },
        ],
      })
    ).to.equal(
      [
        '@30.480,200.000,300.000,13,45.000;',
        '&WGS 1984;',
        '%2.000;',
        '$14;',
        '!Ot;',
        '!oT;',
        '#Foo.dat;',
        '#Bar.dat,A1;',
        '#Baz.dat,',
        '  A1,',
        '  A2[F,23.000,83.000,2.000],',
        '  A3[M,23.000,25.298,0.610];',
      ].join('\r\n') + '\r\n'
    )
  })
})

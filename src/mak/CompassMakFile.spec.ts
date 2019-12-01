import { describe, it } from 'mocha'
import { expect } from 'chai'
import { formatCompassMakFile } from './CompassMakFile'
import { Unitize } from '@speleotica/unitized'
import { LrudAssociation } from './CompassFileParametersDirective'
import * as directives from './directives'

describe('formatCompassMakFile', function() {
  it('works', function() {
    expect(
      formatCompassMakFile({
        directives: [
          directives.baseLocation(
            Unitize.feet(100),
            Unitize.meters(200),
            Unitize.meters(300),
            13,
            Unitize.gradians(50)
          ),
          directives.datum('WGS 1984'),
          directives.utmConvergenceAngle(Unitize.degrees(2)),
          directives.utmZone(14),
          directives.fileParameters(true, LrudAssociation.FromStation),
          directives.fileParameters(false, LrudAssociation.ToStation),
          directives.datFile('Foo.dat'),
          directives.datFile('Bar.dat', [{ station: 'A1' }]),
          directives.datFile('Baz.dat', [
            { station: 'A1' },
            {
              station: 'A2',
              location: {
                easting: Unitize.feet(23),
                northing: Unitize.feet(83),
                elevation: Unitize.feet(2),
              },
            },
            {
              station: 'A3',
              location: {
                easting: Unitize.meters(23),
                northing: Unitize.feet(83),
                elevation: Unitize.feet(2),
              },
            },
          ]),
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

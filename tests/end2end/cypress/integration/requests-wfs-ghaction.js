describe('Request service', function () {
    it('WFS GetCapabilities', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.0.0"')
            })

        // Project with config.options.hideProject: "True"
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=hide_project&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')

                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.0.0"')
            })
    })

    it('WFS GetCapabilities 1.1.0', function () {
        cy.request('/index.php/lizmap/service/?repository=testsrepository&project=selection&SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities')
            .then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.1.0"')
            })
    })


    it('WFS GetCapabilities XML', function () {
        let body = '<?xml version="1.0" encoding="UTF-8"?>'
        body += '<wfs:GetCapabilities'
        body += '    service="WFS"'
        body += '    version="1.0.0"'
        body += '    xmlns:wfs="http://www.opengis.net/wfs"'
        body += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        body += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.0.0 http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">'
        body += '</wfs:GetCapabilities>'
        body += ''
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            headers: {
                'Content-Type':'text/xml; charset=utf-8'
            },
            body: body,
        }).then((resp) => {
                expect(resp.status).to.eq(200)
                expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
                expect(resp.body).to.contain('WFS_Capabilities')
                expect(resp.body).to.contain('version="1.0.0"')
            })
    })

    it('WFS DescribeFeatureType', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'DescribeFeatureType',
                'TYPENAME': 'selection_polygon'
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('text/xml; charset=utf-8')
            expect(resp.body).to.contain('schema')
            expect(resp.body).to.contain('complexType')
            expect(resp.body).to.contain('selection_polygonType')
        })
    })

    it('WFS DescribeFeatureType JSON', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'DescribeFeatureType',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'JSON'
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/json; charset=utf-8')
            expect(resp.body).to.have.property('name', 'selection_polygon')
            expect(resp.body).to.have.property('aliases')
            expect(resp.body).to.have.property('defaults')
            expect(resp.body).to.have.property('types')
            expect(resp.body.types).to.have.property('id', 'int')
            expect(resp.body.types).to.have.property('geometry', 'gml:PolygonPropertyType')
        })
    })

    it('WFS GetFeature TYPENAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(2)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && BBOX', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && BBOX && SRSNAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '160786,900949,186133,925344',
                'SRSNAME': 'EPSG:2154',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })


    it('WFS GetFeature TYPENAME && BBOX && SRSNAME && FORCE_QGIS', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '160786,900949,186133,925344',
                'SRSNAME': 'EPSG:2154',
                'OUTPUTFORMAT': 'GeoJSON',
                'FORCE_QGIS': '1',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
                'OUTPUTFORMAT': 'GeoJSON',
                'FORCE_QGIS': '1',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && EXP_FILTER', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && EXP_FILTER && BBOX', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && EXP_FILTER && BBOX && FORCE_QGIS', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
                'FORCE_QGIS': '1',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature TYPENAME && EXP_FILTER && BBOX && SRSNAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'BBOX': '160786,900949,186133,925344',
                'SRSNAME': 'EPSG:2154',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection_polygon',
                'EXP_FILTER': '$id IN (1)',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature FEATUREID', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature FEATUREID && BBOX', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature FEATUREID && BBOX && FORCE_QGIS', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '160786,900949,186133,925344',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature FEATUREID && BBOX && SRSNAME', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '160786,900949,186133,925344',
                'SRSNAME': 'EPSG:2154',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })

        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'FEATUREID': 'selection_polygon.1',
                'BBOX': '-72399,-13474,-46812,14094',
                'SRSNAME': 'EPSG:3857',
                'OUTPUTFORMAT': 'GeoJSON',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(1)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            expect(feature.bbox).to.have.length(4)
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('WFS GetFeature XML', function () {
        let body = '<?xml version="1.0" encoding="UTF-8"?>'
        body += '<wfs:GetFeature'
        body += '    service="WFS"'
        body += '    version="1.0.0"'
        body += '    outputFormat="GeoJSON"'
        body += '    xmlns:wfs="http://www.opengis.net/wfs"'
        body += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        body += '    xsi:schemaLocation="http://www.opengis.net/wfs/1.0.0 http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">'
        body += '    <wfs:Query typeName="selection_polygon"/>'
        body += '</wfs:GetFeature>'
        body += ''
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            headers: {
                'Content-Type':'text/xml; charset=utf-8'
            },
            body: body,
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.contain('application/vnd.geo+json')
            expect(resp.body).to.have.property('type', 'FeatureCollection')
            expect(resp.body).to.have.property('features')
            expect(resp.body.features).to.have.length(2)
            const feature = resp.body.features[0]
            expect(feature).to.have.property('id')
            expect(feature.id).to.equal('selection_polygon.1')
            expect(feature).to.have.property('bbox')
            assert.isNumber(feature.bbox[0], 'BBox xmin is number')
            assert.isNumber(feature.bbox[1], 'BBox ymin is number')
            assert.isNumber(feature.bbox[2], 'BBox xmax is number')
            assert.isNumber(feature.bbox[3], 'BBox ymax is number')
            expect(feature.bbox).to.have.length(4)
            expect(feature).to.have.property('properties')
            expect(feature.properties).to.have.property('id', 1)
            expect(feature).to.have.property('geometry')
            expect(feature.geometry).to.have.property('type', 'Polygon')
            expect(feature.geometry).to.have.property('coordinates')
            expect(feature.geometry.coordinates).to.have.length(1)
            expect(feature.geometry.coordinates[0]).to.have.length(5)
            expect(feature.geometry.coordinates[0][0]).to.have.length(2)
            expect(feature.geometry.coordinates[0][1]).to.have.length(2)
            expect(feature.geometry.coordinates[0][2]).to.have.length(2)
            expect(feature.geometry.coordinates[0][3]).to.have.length(2)
            expect(feature.geometry.coordinates[0][4]).to.have.length(2)
        })
    })

    it('Version parameter is mandatory except for GetCapabilities request', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'REQUEST': 'GetFeature',
                'TYPENAME': 'selection',
                'OUTPUTFORMAT': 'GeoJSON',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(501)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })

        cy.request({
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'REQUEST': 'GetCapabilities',
            },
        }).then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.headers['content-type']).to.eq('text/xml; charset=utf-8')
            expect(resp.body).to.contain('WFS_Capabilities')
            expect(resp.body).to.contain('version="1.0.0"')
        })
    })

    it('TYPENAME or FEATUREID is mandatory for WFS GetFeature request', function () {
        cy.request({
            method: 'POST',
            url: '/index.php/lizmap/service/?repository=testsrepository&project=selection',
            qs: {
                'SERVICE': 'WFS',
                'VERSION': '1.0.0',
                'REQUEST': 'GetFeature',
                'OUTPUTFORMAT': 'GeoJSON',
            },
            failOnStatusCode: false,
        }).then((resp) => {
            expect(resp.status).to.eq(400)
            expect(resp.headers['content-type']).to.contain('text/xml')
            expect(resp.body).to.contain('ServiceException')
        })
    })
})

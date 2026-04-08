(function () {
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') return;

    const globeWidth = 640;
    const globeHeight = 640;
    const svgGlobe = d3.select('#globe-svg');
    if (svgGlobe.empty()) return;

    const projection = d3.geoOrthographic()
        .scale(300)
        .translate([globeWidth / 2, globeHeight / 2])
        .clipAngle(90)
        .precision(0.1);

    const geoPath = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule();
    const mapContainer = document.querySelector('.map-container');

    const defs = svgGlobe.append('defs');
    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

    const gridPath = svgGlobe.append('path')
        .datum(graticule)
        .attr('class', 'graticule')
        .attr('d', geoPath)
        .style('fill', 'none')
        .style('stroke', accentColor)
        .style('stroke-width', '0.5')
        .style('stroke-opacity', '0.3');

    const landPath = svgGlobe.append('path')
        .style('fill', 'none')
        .style('stroke', accentColor)
        .style('stroke-width', '1.5')
        .style('filter', 'url(#glow)');

    d3.json('data/land-110m.json').then((world) => {
        const land = topojson.feature(world, world.objects.land);
        landPath.datum(land).attr('d', geoPath);
    });

    const globeCities = [
        { name: 'OTTAWA 2003', coords: [-75.6972, 45.4215], type: 'pink' },
        { name: 'COLOMBO 2004', coords: [79.8612, 6.9271], type: 'pink' },
        { name: 'MANILA 2005 - 2006, 2016', coords: [120.9842, 14.5995], type: 'pink' },
        { name: 'NYC 2007 - 2012', coords: [-74.0060, 40.7128], type: 'pink' },
        { name: 'CINCINNATI 2014', coords: [-84.5120, 39.1031], type: 'pink' },
        { name: 'TORONTO 2015', coords: [-79.3470, 43.6510], type: 'pink' },
        { name: 'SHANGHAI 2017 - 2021', coords: [121.4737, 31.2304], type: 'pink' },
        { name: 'VANCOUVER 2022 - 2024, 2026', coords: [-123.1207, 49.2827], type: 'pink' },
        { name: 'HONG KONG 2025', coords: [114.1694, 22.3193], type: 'pink' },
        { name: "MT FUJI - Climbed '25", coords: [138.7274, 35.3606], type: 'gold' },
        { name: 'WHISTLER - Home Ski Spot', coords: [-122.9574, 50.1163], type: 'gold' },
        { name: 'NISEKO - Craziest Pow for Skiing', coords: [140.6874, 42.8048], type: 'gold' },
        { name: 'PALAWAN - Swimming with Whalesharks', coords: [118.7361, 9.8432], type: 'gold' },
        { name: 'LONDON - Favorite City', coords: [-0.1278, 51.5074], type: 'gold' },
        { name: 'TAIWAN - First Time Surfing', coords: [120.9605, 23.6978], type: 'gold' },
        { name: 'DOLOMITES - Best Ski Weather', coords: [11.7049, 46.5598], type: 'gold' },
        { name: 'THUNDER RIDGE - First Ski Spot', coords: [-73.5818, 41.5081], type: 'gold' },
        { name: 'KIPAWA - 22 Day Canoe Trip', coords: [-78.9667, 46.9667], type: 'gold' }
    ];

    const routeCoords = [
        [-75.6972, 45.4215],
        [79.8612, 6.9271],
        [120.9842, 14.5995],
        [-74.0060, 40.7128],
        [-84.5120, 39.1031],
        [-79.3470, 43.6510],
        [120.9842, 14.5995],
        [121.4737, 31.2304],
        [-123.1207, 49.2827],
        [114.1694, 22.3193],
        [-123.1207, 49.2827]
    ];

    const detailedCoords = [];
    for (let i = 0; i < routeCoords.length - 1; i++) {
        const p1 = routeCoords[i];
        const p2 = routeCoords[i + 1];
        const interpolate = d3.geoInterpolate(p1, p2);
        const dist = d3.geoDistance(p1, p2);
        const steps = Math.max(8, Math.floor(dist * 42));
        for (let j = 0; j <= steps; j++) {
            detailedCoords.push(interpolate(j / steps));
        }
    }

    const routeLayer = svgGlobe.append('g')
        .attr('class', 'route-trail-layer')
        .style('filter', 'url(#glow)');

    const cityGroups = svgGlobe.selectAll('.city-node')
        .data(globeCities)
        .enter()
        .append('g')
        .attr('class', 'city-node');

    cityGroups.append('circle')
        .attr('class', 'city-circle')
        .attr('r', (d) => d.type === 'gold' ? 4 : 5)
        .style('fill', (d) => d.type === 'gold' ? '#ffd700' : '#ff00ff')
        .style('stroke', '#000')
        .style('stroke-width', '1');

    cityGroups.append('circle')
        .attr('r', 15)
        .style('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
            const tooltip = d3.select('#globe-tooltip');
            tooltip.style('display', 'block').text(d.name);
        })
        .on('mousemove', function (event) {
            const tooltip = d3.select('#globe-tooltip');
            const pointer = d3.pointer(event, mapContainer);
            tooltip.style('left', (pointer[0] + 15) + 'px')
                .style('top', (pointer[1] + 15) + 'px');
        })
        .on('mouseout', function () {
            d3.select('#globe-tooltip').style('display', 'none');
        });

    function renderGlobe() {
        gridPath.attr('d', geoPath);
        if (landPath.datum()) {
            landPath.attr('d', geoPath);
        }
        routeLayer.selectAll('path').attr('d', geoPath);

        cityGroups.attr('transform', (d) => {
            const p = projection(d.coords);
            return p ? `translate(${p[0]},${p[1]})` : 'translate(-100,-100)';
        }).style('display', (d) => {
            const center = projection.invert([globeWidth / 2, globeHeight / 2]);
            if (!center) return 'none';
            const dist = d3.geoDistance(d.coords, center);
            return dist > Math.PI / 2 ? 'none' : 'block';
        });
    }

    const mapWindow = document.getElementById('win-map');
    const rotationToggleBtn = document.getElementById('toggle-rotation');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetFrameMs = prefersReducedMotion ? (1000 / 12) : (1000 / 24);
    const rotationVelocity = [0.015, -0.002];
    const routeSpeedPerMs = 0.0264 / 4;
    const trailLength = 16;

    let isAutoRotating = !prefersReducedMotion;
    let lastTime = performance.now();
    let lastFrameTime = lastTime;
    let trailHeadIdx = 0;

    function updateRotationToggleLabel() {
        if (!rotationToggleBtn) return;
        rotationToggleBtn.innerText = isAutoRotating ? 'Pause Rotation' : 'Play Rotation';
    }

    function isGlobeActive() {
        const mapVisible = mapWindow && getComputedStyle(mapWindow).display !== 'none';
        return mapVisible && !document.hidden;
    }

    updateRotationToggleLabel();

    if (rotationToggleBtn) {
        rotationToggleBtn.addEventListener('click', function () {
            isAutoRotating = !isAutoRotating;
            updateRotationToggleLabel();
            if (isAutoRotating) {
                lastTime = performance.now();
            }
        });
    }

    d3.timer(function () {
        const now = performance.now();
        const frameDt = now - lastFrameTime;
        if (frameDt < targetFrameMs) return;

        const dt = Math.min(80, now - lastTime);
        lastTime = now;
        lastFrameTime = now;

        if (!isGlobeActive()) return;

        if (isAutoRotating) {
            const rot = projection.rotate();
            projection.rotate([rot[0] + rotationVelocity[0] * dt, rot[1] + rotationVelocity[1] * dt]);
        }

        trailHeadIdx += dt * routeSpeedPerMs;
        if (trailHeadIdx >= detailedCoords.length) {
            trailHeadIdx = 0;
        }

        const startIdx = Math.max(0, Math.floor(trailHeadIdx) - trailLength);
        const endIdx = Math.floor(trailHeadIdx);
        const currentTrail = detailedCoords.slice(startIdx, endIdx + 1);

        const trailSegments = [];
        if (currentTrail.length > 1) {
            for (let i = 0; i < currentTrail.length - 1; i++) {
                const progress = (i + 1) / (currentTrail.length - 1);
                trailSegments.push({
                    type: 'LineString',
                    coordinates: [currentTrail[i], currentTrail[i + 1]],
                    opacity: Math.max(0.08, Math.pow(progress, 1.8)),
                    width: 0.8 + progress * 2.2
                });
            }
        }

        routeLayer.selectAll('path')
            .data(trailSegments)
            .join('path')
            .style('fill', 'none')
            .style('stroke', '#ff00ff')
            .style('stroke-linecap', 'round')
            .style('stroke-opacity', (d) => d.opacity)
            .style('stroke-width', (d) => d.width)
            .attr('d', geoPath);

        renderGlobe();
    });

    const supportsTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    let touchStartRotate = null;
    let touchStartPoint = null;
    let pinchStartDistance = null;
    let pinchStartScale = null;

    function getTouchDistance(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.hypot(dx, dy);
    }

    if (supportsTouch) {
        svgGlobe.style('touch-action', 'none');
        const globeNode = svgGlobe.node();

        globeNode.addEventListener('touchstart', function (event) {
            if (event.touches.length === 1) {
                isAutoRotating = false;
                updateRotationToggleLabel();
                touchStartPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
                touchStartRotate = projection.rotate();
                pinchStartDistance = null;
                pinchStartScale = null;
            } else if (event.touches.length === 2) {
                pinchStartDistance = getTouchDistance(event.touches[0], event.touches[1]);
                pinchStartScale = projection.scale();
            }
        }, { passive: false });

        globeNode.addEventListener('touchmove', function (event) {
            event.preventDefault();

            if (event.touches.length === 1 && touchStartPoint && touchStartRotate) {
                const dx = event.touches[0].clientX - touchStartPoint.x;
                const dy = event.touches[0].clientY - touchStartPoint.y;
                const k = 85 / projection.scale();
                projection.rotate([touchStartRotate[0] + dx * k, touchStartRotate[1] - dy * k]);
                renderGlobe();
            } else if (event.touches.length === 2 && pinchStartDistance && pinchStartScale) {
                const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
                const scaleFactor = currentDistance / pinchStartDistance;
                const newScale = Math.max(150, Math.min(800, pinchStartScale * scaleFactor));
                projection.scale(newScale);
                renderGlobe();
            }
        }, { passive: false });

        globeNode.addEventListener('touchend', function (event) {
            if (event.touches && event.touches.length === 0) {
                touchStartPoint = null;
                touchStartRotate = null;
                pinchStartDistance = null;
                pinchStartScale = null;
            }
        }, { passive: true });
    } else {
        svgGlobe.call(
            d3.drag()
                .on('start', function () {
                    isAutoRotating = false;
                    updateRotationToggleLabel();
                })
                .on('drag', function (event) {
                    const rotate = projection.rotate();
                    const k = 75 / projection.scale();
                    projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
                    renderGlobe();
                })
        );
    }

    svgGlobe.on('wheel', function (event) {
        event.preventDefault();
        let scale = projection.scale();
        scale += event.deltaY * -0.5;
        scale = Math.max(150, Math.min(800, scale));
        projection.scale(scale);
        renderGlobe();
    });

    renderGlobe();
})();
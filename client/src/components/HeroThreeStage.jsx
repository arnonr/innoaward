import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  DOMAIN_ORBIT_COLORS,
  DISTRICT_LAYOUTS,
  getTourStoryState,
  getDistrictTargetState,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

const MAX_PARTICLES = 120;

export default function HeroThreeStage({ activeDomainIndex = null }) {
  const containerRef = useRef(null);
  const activeDomainRef = useRef(activeDomainIndex);

  useEffect(() => {
    activeDomainRef.current = activeDomainIndex;
  }, [activeDomainIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }

    let config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(config.safeWidth, config.safeHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, config.aspect, 0.1, 100);
    camera.position.set(
      config.cityOffsetX + 2.4 * config.distanceScale,
      config.cityOffsetY + 1.35,
      3.8 * config.distanceScale
    );

    const ambientLight = new THREE.AmbientLight(0xECFDF5, 0.85);
    const keyLight = new THREE.DirectionalLight(0xFFFBEB, 2.5);
    keyLight.position.set(4.5, 6.0, 4.5);
    const rimLight = new THREE.PointLight(0x00F5A0, 3.0, 14);
    rimLight.position.set(-3.8, 2.2, 3.0);
    const cyanLight = new THREE.PointLight(0x00D9F5, 2.4, 14);
    cyanLight.position.set(3.5, 1.8, -3.2);
    scene.add(ambientLight, keyLight, rimLight, cyanLight);

    const disposableGeometries = [];
    const disposableMaterials = [];
    const trackGeo = (geo) => {
      disposableGeometries.push(geo);
      return geo;
    };
    const trackMat = (mat) => {
      disposableMaterials.push(mat);
      return mat;
    };

    // 1. Island Foundation & Energy Conduits
    const cityGroup = new THREE.Group();
    cityGroup.position.set(config.cityOffsetX, config.cityOffsetY, 0);
    scene.add(cityGroup);

    const spireGlowLight = new THREE.PointLight(0xFB923C, 3.2, 10);
    spireGlowLight.position.set(0, 1.35, 0);
    cityGroup.add(spireGlowLight);

    const islandMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x062019,
        emissive: 0x03120E,
        emissiveIntensity: 0.4,
        metalness: 0.78,
        roughness: 0.28,
        flatShading: true,
      })
    );

    const mainIslandGeo = trackGeo(new THREE.CylinderGeometry(3.2, 2.6, 0.28, 6));
    const mainIslandMesh = new THREE.Mesh(mainIslandGeo, islandMat);
    mainIslandMesh.position.set(0, -0.14, 0);
    cityGroup.add(mainIslandMesh);

    const subIslandGeo = trackGeo(new THREE.CylinderGeometry(2.5, 1.65, 0.24, 6));
    const subIslandMesh = new THREE.Mesh(subIslandGeo, islandMat);
    subIslandMesh.position.set(0, -0.38, 0);
    cityGroup.add(subIslandMesh);

    const upperDeckGeo = trackGeo(new THREE.CylinderGeometry(2.85, 3.0, 0.06, 6));
    const upperDeckMesh = new THREE.Mesh(upperDeckGeo, islandMat);
    upperDeckMesh.position.set(0, 0.03, 0);
    cityGroup.add(upperDeckMesh);

    const islandRimGeo = trackGeo(new THREE.TorusGeometry(3.15, 0.02, 8, 6));
    const islandRimMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x00F5A0,
        transparent: true,
        opacity: 0.65,
      })
    );
    const islandRimMesh = new THREE.Mesh(islandRimGeo, islandRimMat);
    islandRimMesh.rotation.set(Math.PI / 2, 0, Math.PI / 6);
    islandRimMesh.position.set(0, 0.02, 0);
    cityGroup.add(islandRimMesh);

    // 2. Central Royal Trophy Spire ([0, 0, 0])
    const spireGroup = new THREE.Group();
    cityGroup.add(spireGroup);

    const spireGoldMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xFB923C,
        emissive: 0xEA580C,
        emissiveIntensity: 0.6,
        metalness: 0.88,
        roughness: 0.18,
        flatShading: true,
      })
    );

    const pedestalStep1Geo = trackGeo(new THREE.CylinderGeometry(0.68, 0.78, 0.12, 6));
    const pedestalStep1Mesh = new THREE.Mesh(pedestalStep1Geo, spireGoldMat);
    pedestalStep1Mesh.position.set(0, 0.08, 0);
    spireGroup.add(pedestalStep1Mesh);

    const pedestalStep2Geo = trackGeo(new THREE.CylinderGeometry(0.52, 0.62, 0.12, 6));
    const pedestalStep2Mesh = new THREE.Mesh(pedestalStep2Geo, spireGoldMat);
    pedestalStep2Mesh.position.set(0, 0.2, 0);
    spireGroup.add(pedestalStep2Mesh);

    const spireConeGeo = trackGeo(new THREE.ConeGeometry(0.42, 1.55, 6));
    const spireConeMesh = new THREE.Mesh(spireConeGeo, spireGoldMat);
    spireConeMesh.position.set(0, 1.02, 0);
    spireGroup.add(spireConeMesh);

    const spireCrownGeo = trackGeo(new THREE.OctahedronGeometry(0.36, 1));
    const spireCrownMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xFB923C,
        emissive: 0xEA580C,
        emissiveIntensity: 0.75,
        metalness: 0.9,
        roughness: 0.15,
        flatShading: true,
      })
    );
    const spireCrownMesh = new THREE.Mesh(spireCrownGeo, spireCrownMat);
    spireCrownMesh.position.set(0, 2.02, 0);
    spireGroup.add(spireCrownMesh);

    const haloMat1 = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xFDBA74,
        transparent: true,
        opacity: 0.68,
      })
    );
    const haloRing1Geo = trackGeo(new THREE.TorusGeometry(0.62, 0.016, 10, 48));
    const haloRing1Mesh = new THREE.Mesh(haloRing1Geo, haloMat1);
    haloRing1Mesh.position.set(0, 1.98, 0);
    haloRing1Mesh.rotation.set(0.45, 0, 0.25);
    spireGroup.add(haloRing1Mesh);

    const haloMat2 = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xFDBA74,
        transparent: true,
        opacity: 0.5,
      })
    );
    const haloRing2Geo = trackGeo(new THREE.TorusGeometry(0.78, 0.014, 10, 48));
    const haloRing2Mesh = new THREE.Mesh(haloRing2Geo, haloMat2);
    haloRing2Mesh.position.set(0, 1.98, 0);
    haloRing2Mesh.rotation.set(-0.4, 0.3, -0.3);
    spireGroup.add(haloRing2Mesh);

    // Horizontal Royal Surge Shockwave Ring
    const shockwaveGeo = trackGeo(new THREE.TorusGeometry(0.55, 0.035, 12, 64));
    const shockwaveMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xFDBA74,
        transparent: true,
        opacity: 0,
      })
    );
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2;
    shockwaveMesh.position.set(0, 0.18, 0);
    cityGroup.add(shockwaveMesh);

    // Shared geometries for districts and conduits
    const pulseSphereGeo = trackGeo(new THREE.SphereGeometry(0.065, 12, 12));
    const districtPadGeo = trackGeo(new THREE.CylinderGeometry(0.68, 0.74, 0.08, 6));
    const districtRingGeo = trackGeo(new THREE.TorusGeometry(0.68, 0.015, 8, 36));

    // 3. 5 Living Innovation Districts & Radial Energy Conduits
    const districts = DISTRICT_LAYOUTS.map((layout) => {
      const [dx, dy, dz] = layout.position;
      const districtGroup = new THREE.Group();
      districtGroup.position.set(dx, dy, dz);
      cityGroup.add(districtGroup);

      const primaryMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: layout.color,
          emissive: layout.color,
          emissiveIntensity: 0.4,
          metalness: 0.72,
          roughness: 0.25,
          flatShading: true,
        })
      );

      const accentMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: layout.color,
          transparent: true,
          opacity: 0.72,
        })
      );

      const padMesh = new THREE.Mesh(districtPadGeo, islandMat);
      padMesh.position.set(0, 0.08, 0);
      districtGroup.add(padMesh);

      const padRingMesh = new THREE.Mesh(districtRingGeo, accentMat);
      padRingMesh.rotation.x = Math.PI / 2;
      padRingMesh.position.set(0, 0.125, 0);
      districtGroup.add(padRingMesh);

      // Radial conduit track connecting [x, 0.16, z] to [0, 0.16, 0]
      const radialDistance = Math.hypot(dx, dz);
      const radialAngle = Math.atan2(dz, dx);
      const conduitGeo = trackGeo(new THREE.BoxGeometry(radialDistance, 0.018, 0.045));
      const conduitMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: layout.color,
          transparent: true,
          opacity: 0.35,
        })
      );
      const conduitMesh = new THREE.Mesh(conduitGeo, conduitMat);
      conduitMesh.position.set(dx * 0.5, 0.16, dz * 0.5);
      conduitMesh.rotation.y = -radialAngle;
      cityGroup.add(conduitMesh);

      const conduitStart = new THREE.Vector3(dx, 0.16, dz);
      const conduitEnd = new THREE.Vector3(0, 0.16, 0);
      const pulseMat = trackMat(
        new THREE.MeshBasicMaterial({
          color: layout.color,
          transparent: true,
          opacity: 0.9,
        })
      );
      const pulseSpheres = [0, 1].map((pulseIdx) => {
        const sphere = new THREE.Mesh(pulseSphereGeo, pulseMat);
        sphere.position.lerpVectors(conduitStart, conduitEnd, pulseIdx * 0.5);
        cityGroup.add(sphere);
        return sphere;
      });

      const customRefs = {};

      if (layout.index === 0) {
        // District 0 (0x00F5A0 Energy & Environment): 3 wind turbines + 2 angled solar array panels
        const turbineCoords = [
          [-0.24, -0.14, 0.58],
          [0.24, -0.12, 0.48],
          [0.0, 0.2, 0.52],
        ];
        const bladeGeo = trackGeo(new THREE.BoxGeometry(0.028, 0.22, 0.008));
        const hubGeo = trackGeo(new THREE.SphereGeometry(0.038, 8, 8));
        customRefs.rotors = turbineCoords.map(([tx, tz, th]) => {
          const towerGeo = trackGeo(new THREE.CylinderGeometry(0.022, 0.036, th, 8));
          const towerMesh = new THREE.Mesh(towerGeo, primaryMat);
          towerMesh.position.set(tx, 0.12 + th * 0.5, tz);
          districtGroup.add(towerMesh);

          const hubMesh = new THREE.Mesh(hubGeo, accentMat);
          hubMesh.position.set(tx, 0.12 + th, tz + 0.03);
          districtGroup.add(hubMesh);

          const rotorGroup = new THREE.Group();
          rotorGroup.position.set(tx, 0.12 + th, tz + 0.035);
          for (let b = 0; b < 3; b += 1) {
            const bladePivot = new THREE.Group();
            bladePivot.rotation.z = (b * Math.PI * 2) / 3;
            const bladeMesh = new THREE.Mesh(bladeGeo, accentMat);
            bladeMesh.position.set(0, 0.1, 0);
            bladePivot.add(bladeMesh);
            rotorGroup.add(bladePivot);
          }
          districtGroup.add(rotorGroup);
          return rotorGroup;
        });

        const panelGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.018, 0.16));
        const postGeo = trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.1, 6));
        [-0.2, 0.2].forEach((sx) => {
          const postMesh = new THREE.Mesh(postGeo, primaryMat);
          postMesh.position.set(sx, 0.17, 0.34);
          districtGroup.add(postMesh);

          const panelMesh = new THREE.Mesh(panelGeo, primaryMat);
          panelMesh.position.set(sx, 0.22, 0.34);
          panelMesh.rotation.x = 0.45;
          districtGroup.add(panelMesh);
        });
      } else if (layout.index === 1) {
        // District 1 (0x22C55E Food & Smart Agriculture): Geodesic bio-dome + 2 hydro-towers + 2 orbiting agri-drones with scan cones
        const bioDomeWireGeo = trackGeo(new THREE.IcosahedronGeometry(0.42, 1));
        const bioDomeWireMat = trackMat(
          new THREE.MeshBasicMaterial({
            color: layout.color,
            wireframe: true,
            transparent: true,
            opacity: 0.62,
          })
        );
        const bioDomeWireMesh = new THREE.Mesh(bioDomeWireGeo, bioDomeWireMat);
        bioDomeWireMesh.position.set(0, 0.28, 0.04);
        districtGroup.add(bioDomeWireMesh);

        const innerDomeGeo = trackGeo(new THREE.IcosahedronGeometry(0.36, 1));
        const innerDomeMat = trackMat(
          new THREE.MeshStandardMaterial({
            color: layout.color,
            emissive: layout.color,
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.32,
            roughness: 0.2,
          })
        );
        const innerDomeMesh = new THREE.Mesh(innerDomeGeo, innerDomeMat);
        innerDomeMesh.position.set(0, 0.26, 0.04);
        districtGroup.add(innerDomeMesh);

        const hydroTowerGeo = trackGeo(new THREE.CylinderGeometry(0.075, 0.085, 0.56, 8));
        const hydroRingGeo = trackGeo(new THREE.TorusGeometry(0.09, 0.012, 6, 18));
        [-0.36, 0.36].forEach((hx) => {
          const towerMesh = new THREE.Mesh(hydroTowerGeo, primaryMat);
          towerMesh.position.set(hx, 0.4, -0.2);
          districtGroup.add(towerMesh);

          const ringMesh = new THREE.Mesh(hydroRingGeo, accentMat);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.position.set(hx, 0.48, -0.2);
          districtGroup.add(ringMesh);
        });

        const droneOrbitGroup = new THREE.Group();
        droneOrbitGroup.position.set(0, 0.68, 0.04);
        districtGroup.add(droneOrbitGroup);

        const droneBodyGeo = trackGeo(new THREE.OctahedronGeometry(0.055, 0));
        const scanConeGeo = trackGeo(new THREE.ConeGeometry(0.14, 0.32, 12, 1, true));
        const scanConeMat = trackMat(
          new THREE.MeshBasicMaterial({
            color: layout.color,
            transparent: true,
            opacity: 0.28,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );

        [-0.44, 0.44].forEach((droneX) => {
          const droneUnit = new THREE.Group();
          droneUnit.position.set(droneX, 0, 0);
          const droneMesh = new THREE.Mesh(droneBodyGeo, accentMat);
          droneUnit.add(droneMesh);

          const coneMesh = new THREE.Mesh(scanConeGeo, scanConeMat);
          coneMesh.position.set(0, -0.18, 0);
          droneUnit.add(coneMesh);
          droneOrbitGroup.add(droneUnit);
        });

        customRefs.droneOrbitGroup = droneOrbitGroup;
      } else if (layout.index === 2) {
        // District 2 (0x00D9F5 Social & Digital Economy): 4 stepped cyber-skyscrapers + circular sky-rail + 2 light-train capsules
        const towerSpecs = [
          [-0.18, -0.18, 0.78],
          [0.18, -0.16, 0.62],
          [-0.16, 0.18, 0.52],
          [0.18, 0.18, 0.68],
        ];
        const crownGeo = trackGeo(new THREE.BoxGeometry(0.15, 0.035, 0.15));
        const stepGeo = trackGeo(new THREE.BoxGeometry(0.13, 0.1, 0.13));

        towerSpecs.forEach(([tx, tz, th]) => {
          const bodyGeo = trackGeo(new THREE.BoxGeometry(0.18, th, 0.18));
          const bodyMesh = new THREE.Mesh(bodyGeo, primaryMat);
          bodyMesh.position.set(tx, 0.12 + th * 0.5, tz);
          districtGroup.add(bodyMesh);

          const stepMesh = new THREE.Mesh(stepGeo, primaryMat);
          stepMesh.position.set(tx, 0.12 + th + 0.05, tz);
          districtGroup.add(stepMesh);

          const crownMesh = new THREE.Mesh(crownGeo, accentMat);
          crownMesh.position.set(tx, 0.12 + th + 0.115, tz);
          districtGroup.add(crownMesh);
        });

        const skyRailGeo = trackGeo(new THREE.TorusGeometry(0.56, 0.014, 8, 48));
        const skyRailMesh = new THREE.Mesh(skyRailGeo, accentMat);
        skyRailMesh.rotation.x = Math.PI / 2;
        skyRailMesh.position.set(0, 0.4, 0);
        districtGroup.add(skyRailMesh);

        const skyRailTrainGroup = new THREE.Group();
        skyRailTrainGroup.position.set(0, 0.4, 0);
        districtGroup.add(skyRailTrainGroup);

        const trainCapsuleGeo = trackGeo(new THREE.BoxGeometry(0.05, 0.036, 0.14));
        [-0.56, 0.56].forEach((rx) => {
          const trainMesh = new THREE.Mesh(trainCapsuleGeo, accentMat);
          trainMesh.position.set(rx, 0, 0);
          skyRailTrainGroup.add(trainMesh);
        });

        customRefs.skyRailTrainGroup = skyRailTrainGroup;
      } else if (layout.index === 3) {
        // District 3 (0xFB7185 Medical Device & Healthcare): Med-tech pavilion base + rotating 3D double-helix DNA monument + rising vitality pulse ring
        const pavilionBaseGeo = trackGeo(new THREE.CylinderGeometry(0.38, 0.46, 0.12, 8));
        const pavilionBaseMesh = new THREE.Mesh(pavilionBaseGeo, primaryMat);
        pavilionBaseMesh.position.set(0, 0.16, 0);
        districtGroup.add(pavilionBaseMesh);

        const pavilionPlinthGeo = trackGeo(new THREE.CylinderGeometry(0.26, 0.32, 0.08, 8));
        const pavilionPlinthMesh = new THREE.Mesh(pavilionPlinthGeo, primaryMat);
        pavilionPlinthMesh.position.set(0, 0.24, 0);
        districtGroup.add(pavilionPlinthMesh);

        const dnaGroup = new THREE.Group();
        dnaGroup.position.set(0, 0.28, 0);
        districtGroup.add(dnaGroup);

        const strandNodeGeo = trackGeo(new THREE.SphereGeometry(0.042, 10, 10));
        const rungGeo = trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6));

        for (let k = 0; k < 6; k += 1) {
          const yLevel = k * 0.11 + 0.06;
          const twistAngle = k * 0.68;
          const nx = Math.cos(twistAngle) * 0.18;
          const nz = Math.sin(twistAngle) * 0.18;

          const nodeA = new THREE.Mesh(strandNodeGeo, primaryMat);
          nodeA.position.set(nx, yLevel, nz);
          dnaGroup.add(nodeA);

          const nodeB = new THREE.Mesh(strandNodeGeo, accentMat);
          nodeB.position.set(-nx, yLevel, -nz);
          dnaGroup.add(nodeB);

          const rungMesh = new THREE.Mesh(rungGeo, accentMat);
          rungMesh.position.set(0, yLevel, 0);
          rungMesh.rotation.z = Math.PI / 2;
          rungMesh.rotation.y = -twistAngle;
          dnaGroup.add(rungMesh);
        }

        const vitalityRingGeo = trackGeo(new THREE.TorusGeometry(0.34, 0.016, 8, 36));
        const vitalityRingMesh = new THREE.Mesh(vitalityRingGeo, accentMat);
        vitalityRingMesh.rotation.x = Math.PI / 2;
        vitalityRingMesh.position.set(0, 0.3, 0);
        districtGroup.add(vitalityRingMesh);

        customRefs.dnaGroup = dnaGroup;
        customRefs.vitalityRingMesh = vitalityRingMesh;
        customRefs.vitalityPhase = 0;
      } else if (layout.index === 4) {
        // District 4 (0xF59E0B Advanced Material & Manufacturing): Industrial forge frame + 2 articulating gantry arms + levitating faceted crystal cube
        const pillarGeo = trackGeo(new THREE.BoxGeometry(0.055, 0.68, 0.055));
        const pillarCoords = [
          [-0.28, -0.22],
          [0.28, -0.22],
          [-0.28, 0.22],
          [0.28, 0.22],
        ];
        pillarCoords.forEach(([px, pz]) => {
          const pillarMesh = new THREE.Mesh(pillarGeo, primaryMat);
          pillarMesh.position.set(px, 0.46, pz);
          districtGroup.add(pillarMesh);
        });

        const topBeamGeo = trackGeo(new THREE.BoxGeometry(0.64, 0.05, 0.06));
        [-0.22, 0.22].forEach((bz) => {
          const beamMesh = new THREE.Mesh(topBeamGeo, primaryMat);
          beamMesh.position.set(0, 0.8, bz);
          districtGroup.add(beamMesh);
        });

        const crossBeamGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.05, 0.5));
        const crossBeamMesh = new THREE.Mesh(crossBeamGeo, primaryMat);
        crossBeamMesh.position.set(0, 0.8, 0);
        districtGroup.add(crossBeamMesh);

        const armSegmentGeo = trackGeo(new THREE.BoxGeometry(0.22, 0.038, 0.038));
        const gantryArmLeft = new THREE.Group();
        gantryArmLeft.position.set(-0.26, 0.68, 0);
        const leftArmMesh = new THREE.Mesh(armSegmentGeo, accentMat);
        leftArmMesh.position.set(0.1, 0, 0);
        gantryArmLeft.add(leftArmMesh);
        districtGroup.add(gantryArmLeft);

        const gantryArmRight = new THREE.Group();
        gantryArmRight.position.set(0.26, 0.68, 0);
        const rightArmMesh = new THREE.Mesh(armSegmentGeo, accentMat);
        rightArmMesh.position.set(-0.1, 0, 0);
        gantryArmRight.add(rightArmMesh);
        districtGroup.add(gantryArmRight);

        const crystalCubeGeo = trackGeo(new THREE.OctahedronGeometry(0.24, 0));
        const forgeCrystalMesh = new THREE.Mesh(crystalCubeGeo, primaryMat);
        forgeCrystalMesh.position.set(0, 0.46, 0);
        districtGroup.add(forgeCrystalMesh);

        customRefs.gantryArmLeft = gantryArmLeft;
        customRefs.gantryArmRight = gantryArmRight;
        customRefs.forgeCrystalMesh = forgeCrystalMesh;
      }

      return {
        index: layout.index,
        layout,
        districtGroup,
        primaryMat,
        accentMat,
        conduitMat,
        conduitStart,
        conduitEnd,
        pulseSpheres,
        pulseOffset: layout.index * 0.2,
        customRefs,
      };
    });

    // Ambient atmospheric particle field around the island
    const particleGeo = trackGeo(new THREE.BufferGeometry());
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const scratchColor = new THREE.Color();

    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      const i3 = i * 3;
      const r = 2.0 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      positions[i3] = Math.cos(theta) * r;
      positions[i3 + 1] = 0.15 + Math.random() * 2.8;
      positions[i3 + 2] = Math.sin(theta) * r;

      scratchColor.setHex(DOMAIN_ORBIT_COLORS[i % DOMAIN_ORBIT_COLORS.length]);
      colors[i3] = scratchColor.r;
      colors[i3 + 1] = scratchColor.g;
      colors[i3 + 2] = scratchColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setDrawRange(0, config.particleCount);

    const particleMat = trackMat(
      new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
      })
    );
    const particles = new THREE.Points(particleGeo, particleMat);
    cityGroup.add(particles);

    // 4. 3-Act CatmullRomCurve3 Camera Rig (local city coordinates)
    const cameraWaypoints = [
      ...DISTRICT_LAYOUTS.map(
        (d, idx) =>
          new THREE.Vector3(
            d.position[0] * 1.42,
            1.15 + (idx % 2) * 0.16,
            d.position[2] * 1.42 + 0.55
          )
      ),
      new THREE.Vector3(1.85, 1.42, -2.4),
      new THREE.Vector3(0.4, 2.75, 4.9),
      new THREE.Vector3(2.4, 2.35, 3.8),
    ];

    const lookAtWaypoints = [
      ...DISTRICT_LAYOUTS.map(
        (d) => new THREE.Vector3(d.position[0] * 0.55, 0.55, d.position[2] * 0.55)
      ),
      new THREE.Vector3(0.35, 0.62, -0.45),
      new THREE.Vector3(0, 0.65, 0),
      new THREE.Vector3(0.45, 0.6, 0.15),
    ];

    const cameraCurve = new THREE.CatmullRomCurve3(cameraWaypoints, true);
    const lookAtCurve = new THREE.CatmullRomCurve3(lookAtWaypoints, true);

    // Pre-allocated scratch vectors (zero per-frame heap allocations inside animate)
    const desiredCamPos = new THREE.Vector3();
    const desiredLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3(
      config.cityOffsetX,
      config.cityOffsetY + 0.55,
      0
    );
    const targetCityPos = new THREE.Vector3(config.cityOffsetX, config.cityOffsetY, 0);
    const pointer = { x: 0, y: 0 };

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let prefersReducedMotion = Boolean(motionQuery?.matches);

    const handleMotionChange = (event) => {
      prefersReducedMotion = Boolean(event.matches);
    };
    motionQuery?.addEventListener?.('change', handleMotionChange);

    const handlePointerMove = (event) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      pointer.x = (event.clientX / width) * 2 - 1;
      pointer.y = -(event.clientY / height) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp) => {
      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.1);
      const elapsed = timer.getElapsed();
      const { speedFactor, parallaxFactor } = getMotionFactor(prefersReducedMotion);

      const storyState = getTourStoryState(elapsed * speedFactor, activeDomainRef.current);

      const cityBob = Math.sin(elapsed * 1.15 * speedFactor) * 0.035;
      targetCityPos.set(config.cityOffsetX, config.cityOffsetY + cityBob, 0);
      cityGroup.position.lerp(targetCityPos, 0.08);

      // Central Royal Trophy Spire animation & Act 3 Surge shockwave
      const spireSpinMultiplier = storyState.mode === 'surge' ? 2.2 : 1.0;
      spireCrownMesh.rotation.y += delta * 0.65 * spireSpinMultiplier * speedFactor;
      spireCrownMesh.rotation.x += delta * 0.28 * spireSpinMultiplier * speedFactor;
      haloRing1Mesh.rotation.z += delta * 0.52 * spireSpinMultiplier * speedFactor;
      haloRing2Mesh.rotation.z -= delta * 0.44 * spireSpinMultiplier * speedFactor;

      if (storyState.mode === 'surge') {
        const surgeScale = 1 + storyState.surgeProgress * 5.2;
        shockwaveMesh.scale.setScalar(surgeScale);
        shockwaveMat.opacity =
          Math.sin(storyState.surgeProgress * Math.PI) *
          0.85 *
          (1 - storyState.surgeProgress * 0.35);
        spireGlowLight.intensity =
          4.2 + Math.sin(storyState.surgeProgress * Math.PI * 2) * 1.4;
        spireCrownMat.emissiveIntensity = 1.25;
      } else {
        shockwaveMesh.scale.setScalar(1);
        shockwaveMat.opacity = THREE.MathUtils.lerp(shockwaveMat.opacity, 0, 0.12);
        spireGlowLight.intensity = THREE.MathUtils.lerp(spireGlowLight.intensity, 3.2, 0.08);
        spireCrownMat.emissiveIntensity = THREE.MathUtils.lerp(
          spireCrownMat.emissiveIntensity,
          0.75,
          0.08
        );
      }

      // Update each of the 5 districts & radial energy conduits
      for (let i = 0; i < districts.length; i += 1) {
        const district = districts[i];
        const target = getDistrictTargetState(i, storyState);
        const activity = target.activityMultiplier * speedFactor;

        district.primaryMat.emissiveIntensity = THREE.MathUtils.lerp(
          district.primaryMat.emissiveIntensity,
          target.emissiveBoost,
          0.1
        );
        district.accentMat.opacity = THREE.MathUtils.lerp(
          district.accentMat.opacity,
          0.35 + target.emissiveBoost * 0.5,
          0.1
        );
        district.conduitMat.opacity = THREE.MathUtils.lerp(
          district.conduitMat.opacity,
          0.16 + target.conduitPulseIntensity * 0.58,
          0.1
        );

        district.pulseOffset =
          (district.pulseOffset +
            delta * (0.38 + target.conduitPulseIntensity * 0.75) * speedFactor) %
          1;
        for (let pIdx = 0; pIdx < district.pulseSpheres.length; pIdx += 1) {
          const sphere = district.pulseSpheres[pIdx];
          const progress = (district.pulseOffset + pIdx * 0.5) % 1;
          sphere.position.lerpVectors(district.conduitStart, district.conduitEnd, progress);
          sphere.position.y = 0.16 + Math.sin(progress * Math.PI) * 0.06;
        }

        const refs = district.customRefs;
        if (district.index === 0 && refs.rotors) {
          for (let r = 0; r < refs.rotors.length; r += 1) {
            refs.rotors[r].rotation.z += delta * 2.8 * activity;
          }
        } else if (district.index === 1 && refs.droneOrbitGroup) {
          refs.droneOrbitGroup.rotation.y += delta * 1.45 * activity;
          refs.droneOrbitGroup.position.y =
            0.68 + Math.sin(elapsed * 2.4 * speedFactor) * 0.04;
        } else if (district.index === 2 && refs.skyRailTrainGroup) {
          refs.skyRailTrainGroup.rotation.y += delta * 1.85 * activity;
        } else if (district.index === 3 && refs.dnaGroup && refs.vitalityRingMesh) {
          refs.dnaGroup.rotation.y += delta * 1.4 * activity;
          refs.vitalityPhase = (refs.vitalityPhase + delta * 0.55 * activity) % 1;
          refs.vitalityRingMesh.position.y = 0.26 + refs.vitalityPhase * 0.65;
          refs.vitalityRingMesh.scale.setScalar(
            0.85 + Math.sin(refs.vitalityPhase * Math.PI) * 0.32
          );
        } else if (
          district.index === 4 &&
          refs.forgeCrystalMesh &&
          refs.gantryArmLeft &&
          refs.gantryArmRight
        ) {
          refs.forgeCrystalMesh.rotation.y += delta * 1.65 * activity;
          refs.forgeCrystalMesh.rotation.x += delta * 0.95 * activity;
          refs.forgeCrystalMesh.position.y =
            0.46 + Math.sin(elapsed * 2.6 * speedFactor) * 0.04;
          const armSwing = Math.sin(elapsed * 2.2 * activity) * 0.22;
          refs.gantryArmLeft.rotation.z = -0.25 + armSwing;
          refs.gantryArmRight.rotation.z = 0.25 - armSwing;
        }
      }

      // Camera target calculation (Dive vs 3-Act CatmullRomCurve3 Tour)
      const parallaxX = pointer.x * 0.28 * parallaxFactor;
      const parallaxY = pointer.y * 0.16 * parallaxFactor;

      if (storyState.mode === 'dive') {
        const activeLayout =
          DISTRICT_LAYOUTS[storyState.activeDistrictIndex] || DISTRICT_LAYOUTS[0];
        desiredCamPos.set(
          cityGroup.position.x +
            (activeLayout.position[0] + activeLayout.cameraOffset[0]) * config.distanceScale +
            parallaxX,
          cityGroup.position.y +
            activeLayout.position[1] +
            activeLayout.cameraOffset[1] +
            parallaxY,
          cityGroup.position.z +
            (activeLayout.position[2] + activeLayout.cameraOffset[2]) * config.distanceScale
        );
        desiredLookAt.set(
          cityGroup.position.x + activeLayout.position[0] + activeLayout.lookAtOffset[0],
          cityGroup.position.y + activeLayout.position[1] + activeLayout.lookAtOffset[1],
          cityGroup.position.z + activeLayout.position[2] + activeLayout.lookAtOffset[2]
        );
      } else {
        cameraCurve.getPointAt(storyState.tourProgress, desiredCamPos);
        lookAtCurve.getPointAt(storyState.tourProgress, desiredLookAt);

        desiredCamPos.x =
          cityGroup.position.x + desiredCamPos.x * config.distanceScale + parallaxX;
        desiredCamPos.y = cityGroup.position.y + desiredCamPos.y + parallaxY;
        desiredCamPos.z = cityGroup.position.z + desiredCamPos.z * config.distanceScale;

        desiredLookAt.x += cityGroup.position.x;
        desiredLookAt.y += cityGroup.position.y;
        desiredLookAt.z += cityGroup.position.z;
      }

      camera.position.lerp(desiredCamPos, 0.06);
      currentLookAt.lerp(desiredLookAt, 0.08);
      camera.lookAt(currentLookAt);

      particles.rotation.y += delta * 0.04 * speedFactor;

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    const handleResize = () => {
      config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);
      camera.aspect = config.aspect;
      camera.updateProjectionMatrix();
      particleGeo.setDrawRange(0, config.particleCount);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(config.safeWidth, config.safeHeight);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(container);

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              if (!entry) return;
              if (entry.isIntersecting) {
                renderer.setAnimationLoop(animate);
              } else {
                renderer.setAnimationLoop(null);
              }
            },
            { threshold: 0.05 }
          )
        : null;
    intersectionObserver?.observe(container);

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      motionQuery?.removeEventListener?.('change', handleMotionChange);
      renderer.setAnimationLoop(null);
      timer.dispose();

      for (let i = 0; i < disposableGeometries.length; i += 1) {
        disposableGeometries[i].dispose();
      }
      for (let i = 0; i < disposableMaterials.length; i += 1) {
        disposableMaterials[i].dispose();
      }

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="hero-three-canvas-wrap" aria-hidden="true" />;
}

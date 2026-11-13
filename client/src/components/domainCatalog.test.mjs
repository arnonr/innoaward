import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_CATALOG,
  getDomainById,
  getDomainSampleWinners,
} from './domainCatalog.js';

const EXPECTED_DOMAIN_IDS = [
  'agri_food',
  'health_medtech',
  'engineering_ai',
  'energy_env_material_bcg',
  'quality_of_life_soft_power',
];

test('DOMAIN_CATALOG defines all 5 2570 innovation domains in official 1..5 order with required schema', () => {
  assert.equal(DOMAIN_CATALOG.length, 5);
  assert.deepEqual(
    DOMAIN_CATALOG.map((d) => d.id),
    EXPECTED_DOMAIN_IDS
  );
  assert.deepEqual(
    DOMAIN_CATALOG.map((d) => d.indexLabel),
    ['DOMAIN 01', 'DOMAIN 02', 'DOMAIN 03', 'DOMAIN 04', 'DOMAIN 05']
  );
  assert.deepEqual(
    DOMAIN_CATALOG.map((d) => d.color),
    ['#16A34A', '#E11D48', '#06B6D4', '#059669', '#D97706']
  );
  assert.deepEqual(
    DOMAIN_CATALOG.map((d) => d.bgImage),
    [
      '/domain-food.jpg',
      '/domain-medical.jpg',
      '/domain-engineering.jpg',
      '/domain-energy.jpg',
      '/domain-softpower.jpg',
    ]
  );

  for (const domain of DOMAIN_CATALOG) {
    assert.equal(typeof domain.nameTh, 'string');
    assert.equal(domain.nameTh.length > 0, true);
    assert.equal(typeof domain.nameEn, 'string');
    assert.equal(domain.nameEn.length > 0, true);
    assert.equal(typeof domain.titleTh, 'string');
    assert.equal(domain.titleTh.length > 0, true);
    assert.equal(typeof domain.titleEn, 'string');
    assert.equal(domain.titleEn.length > 0, true);
    assert.equal(domain.overview.length > domain.desc.length, true);
    assert.equal(Array.isArray(domain.relatedCategoryIds) && domain.relatedCategoryIds.includes(domain.id), true);
    assert.equal(Array.isArray(domain.subTopics) && domain.subTopics.length >= 3, true);
    assert.equal(Array.isArray(domain.initialCriteria) && domain.initialCriteria.length >= 3, true);
    for (const topic of domain.subTopics) {
      assert.equal(Boolean(topic.title && topic.detail), true);
    }
    for (const criterion of domain.initialCriteria) {
      assert.equal(Boolean(criterion.title && criterion.detail), true);
    }
    // Mandatory Prototype baseline & Idea-only rejection in initialCriteria[0].detail
    assert.equal(domain.initialCriteria[0].detail.includes('Prototype'), true);
    assert.equal(
      domain.initialCriteria[0].detail.includes('ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)'),
      true
    );
  }

  // Never mention plaques (โล่) anywhere
  assert.equal(JSON.stringify(DOMAIN_CATALOG).includes('โล่'), false);
});

test('DOMAIN_CATALOG overviews contain key phrases from the official Thai scope (๑–๕)', () => {
  const agri = getDomainById('agri_food');
  assert.equal(agri?.overview.includes('อาหารฟังก์ชัน'), true);
  assert.equal(agri?.overview.includes('แมลงเศรษฐกิจ'), true);

  const health = getDomainById('health_medtech');
  assert.equal(health?.overview.includes('Healthtech'), true);
  assert.equal(health?.overview.includes('Medtech'), true);

  const eng = getDomainById('engineering_ai');
  assert.equal(eng?.overview.includes('Robotics'), true);
  assert.equal(eng?.overview.includes('Machine Learning'), true);

  const bcg = getDomainById('energy_env_material_bcg');
  assert.equal(bcg?.overview.includes('BCG Economy Model'), true);

  const softPower = getDomainById('quality_of_life_soft_power');
  assert.equal(softPower?.overview.includes('อุตสาหกรรมสร้างสรรค์ 11 สาขา'), true);
  assert.equal(softPower?.overview.includes('Soft Power'), true);
});

test('getDomainById returns matching 2570 domain object or null for unknown/invalid ids', () => {
  const agri = getDomainById('agri_food');
  assert.equal(agri?.titleTh, 'ด้านการเกษตรและอุตสาหกรรมอาหาร');
  assert.equal(getDomainById('others'), null);
  assert.equal(getDomainById('energy_environment'), null);
  assert.equal(getDomainById(''), null);
  assert.equal(getDomainById(null), null);
  assert.equal(getDomainById(undefined), null);
});

test('getDomainSampleWinners matches both 2570 domainId and legacy 2569 relatedCategoryIds safely', () => {
  const mock2569Winners = [
    { id: 'w1', category: 'energy_environment', titleTh: 'งานพลังงาน 2569' },
    { id: 'w2', category: 'medical_device', titleTh: 'งานแพทย์ 2569' },
    { id: 'w3', category: 'material', titleTh: 'งานวัสดุ 2569' },
    { id: 'w4', category: 'food_agriculture', titleTh: 'งานเกษตร 2569' },
    { id: 'w5', category: 'social_economy', titleTh: 'งานดิจิทัล 2569' },
    { id: 'w6', category: 'energy_env_material_bcg', titleTh: 'งานพลังงาน BCG 2570' },
    null,
    {},
  ];

  const bcgSample = getDomainSampleWinners('energy_env_material_bcg', mock2569Winners, 2);
  assert.equal(bcgSample.length, 2);
  assert.deepEqual(bcgSample.map((w) => w.id), ['w1', 'w3']);

  const bcgAll = getDomainSampleWinners('energy_env_material_bcg', mock2569Winners, 5);
  assert.deepEqual(bcgAll.map((w) => w.id), ['w1', 'w3', 'w6']);

  assert.deepEqual(
    getDomainSampleWinners('agri_food', mock2569Winners, 2).map((w) => w.id),
    ['w4']
  );
  assert.deepEqual(
    getDomainSampleWinners('health_medtech', mock2569Winners, 2).map((w) => w.id),
    ['w2']
  );
  assert.deepEqual(
    getDomainSampleWinners('engineering_ai', mock2569Winners, 2).map((w) => w.id),
    ['w5']
  );
  assert.deepEqual(
    getDomainSampleWinners('quality_of_life_soft_power', mock2569Winners, 2),
    []
  );

  assert.deepEqual(getDomainSampleWinners('energy_env_material_bcg', mock2569Winners, 0), []);
  assert.deepEqual(getDomainSampleWinners('energy_env_material_bcg', mock2569Winners, -3), []);
  assert.deepEqual(getDomainSampleWinners('energy_env_material_bcg', mock2569Winners, Number.NaN), []);
  assert.deepEqual(getDomainSampleWinners('energy_env_material_bcg', null, 2), []);
  assert.deepEqual(getDomainSampleWinners(null, mock2569Winners, 2), []);
});

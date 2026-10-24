import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_CATALOG,
  getDomainById,
  getDomainSampleWinners,
} from './domainCatalog.js';

test('DOMAIN_CATALOG defines all 5 innovation domains with overview, subTopics, and initialCriteria', () => {
  assert.equal(DOMAIN_CATALOG.length, 5);
  assert.deepEqual(
    DOMAIN_CATALOG.map((d) => d.id),
    [
      'energy_environment',
      'food_agriculture',
      'social_economy',
      'medical_device',
      'material',
    ]
  );

  for (const domain of DOMAIN_CATALOG) {
    assert.equal(typeof domain.indexLabel, 'string');
    assert.equal(domain.overview.length > domain.desc.length, true);
    assert.equal(Array.isArray(domain.subTopics) && domain.subTopics.length >= 3, true);
    assert.equal(Array.isArray(domain.initialCriteria) && domain.initialCriteria.length >= 3, true);
    for (const topic of domain.subTopics) {
      assert.equal(Boolean(topic.title && topic.detail), true);
    }
    for (const criterion of domain.initialCriteria) {
      assert.equal(Boolean(criterion.title && criterion.detail), true);
    }
  }
});

test('getDomainById returns matching domain object or null for unknown/invalid ids', () => {
  const energy = getDomainById('energy_environment');
  assert.equal(energy?.titleTh, 'พลังงานและสิ่งแวดล้อม');
  assert.equal(getDomainById('others'), null);
  assert.equal(getDomainById(''), null);
  assert.equal(getDomainById(null), null);
  assert.equal(getDomainById(undefined), null);
});

test('getDomainSampleWinners filters winners by category and handles invalid inputs or limits safely', () => {
  const mockWinners = [
    { id: 'w1', category: 'energy_environment', titleTh: 'งานพลังงาน 1' },
    { id: 'w2', category: 'medical_device', titleTh: 'งานแพทย์ 1' },
    { id: 'w3', category: 'energy_environment', titleTh: 'งานพลังงาน 2' },
    { id: 'w4', category: 'energy_environment', titleTh: 'งานพลังงาน 3' },
    null,
    {},
  ];

  const topTwo = getDomainSampleWinners('energy_environment', mockWinners, 2);
  assert.equal(topTwo.length, 2);
  assert.deepEqual(topTwo.map((w) => w.id), ['w1', 'w3']);

  assert.deepEqual(getDomainSampleWinners('energy_environment', mockWinners, 0), []);
  assert.deepEqual(getDomainSampleWinners('energy_environment', mockWinners, -3), []);
  assert.deepEqual(getDomainSampleWinners('energy_environment', mockWinners, Number.NaN), []);
  assert.deepEqual(getDomainSampleWinners('energy_environment', null, 2), []);
  assert.deepEqual(getDomainSampleWinners(null, mockWinners, 2), []);
});

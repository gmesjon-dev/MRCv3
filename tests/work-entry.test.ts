import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canViewDepartment,
  departmentFromRole,
  isAdminRole,
  isDepartmentKey,
} from '../lib/work-entry.ts';

test('reconhece os quatro setores aceitos', () => {
  for (const department of ['social_media', 'designer', 'trafego', 'web']) {
    assert.equal(isDepartmentKey(department), true);
  }
  assert.equal(isDepartmentKey('financeiro'), false);
});

test('mapeia nomes de cargos e departamentos com acentos', () => {
  assert.equal(departmentFromRole('Social Media', null), 'social_media');
  assert.equal(departmentFromRole(null, 'Criação e Design'), 'designer');
  assert.equal(departmentFromRole('Gestor de Tráfego', null), 'trafego');
  assert.equal(departmentFromRole(null, 'Desenvolvimento Web'), 'web');
});

test('administrador vê todos os setores e colaborador apenas o próprio', () => {
  assert.equal(canViewDepartment(true, null, 'designer'), true);
  assert.equal(canViewDepartment(false, 'social_media', 'social_media'), true);
  assert.equal(canViewDepartment(false, 'social_media', 'designer'), false);
});

test('identifica o papel administrativo', () => {
  assert.equal(isAdminRole('Administrador'), true);
  assert.equal(isAdminRole('Social Media'), false);
});

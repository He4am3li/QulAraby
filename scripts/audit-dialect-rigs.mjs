#!/usr/bin/env node
/**
 * Verify all approved original dialect portraits, without falsely claiming
 * that a flattened WEBP is an editable Cubism/PSD rig.
 * Usage: node scripts/audit-dialect-rigs.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/avatars/original-rigs');
const expected = 43; // 22 countries * two characters, excluding Saudi male (Salman).
const errors = [];
const pending = [];
const approved = [];
const safeAsset = name => typeof name === 'string' && /^[A-Za-z0-9_-]+\\.webp$/.test(name);

function dimensions(file) {
  const b = readFileSync(file);
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Not a valid WEBP container');
  }
  const type = b.toString('ascii', 12, 16);
  if (type === 'VP8X') {
    return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  }
  if (type === 'VP8 ') {
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  if (type === 'VP8L' && b[20] === 0x2f) {
    const bits = b.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  throw new Error('Unsupported WEBP encoding: ' + type);
}

function checkAsset(dir, name, baseline) {
  if (!safeAsset(name)) throw new Error('Unsafe/invalid asset name: ' + name);
  const file = path.join(dir, name);
  if (!existsSync(file)) throw new Error('Missing layer: ' + name);
  const size = dimensions(file);
  if (baseline && (size[0] !== baseline[0] || size[1] !== baseline[1])) {
    throw new Error('Dimension mismatch: ' + name + ' ' + size.join('x') + ' vs ' + baseline.join('x'));
  }
  return size;
}

const countries = readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory());
const ids = [];
for (const country of countries) {
  for (const gender of ['male', 'female']) {
    if (country.name === 'saudi' && gender === 'male') continue;
    const dir = path.join(root, country.name, gender);
    if (!existsSync(dir)) {
      errors.push('Missing original portrait folder: ' + country.name + '/' + gender);
      continue;
    }
    const id = country.name + '_' + gender;
    ids.push(id);
    try {
      checkAsset(dir, 'source.webp');
      const baseline = checkAsset(dir, 'cutout.webp');
      const identityPath = path.join(dir, 'identity.json');
      const identity = JSON.parse(readFileSync(identityPath, 'utf8'));
      if (identity.id !== id || identity.original !== true) {
        throw new Error('Identity metadata mismatch');
      }
      const approvedPath = path.join(dir, 'rig-approved.json');
      if (!existsSync(approvedPath)) {
        pending.push(id);
        continue;
      }
      const rig = JSON.parse(readFileSync(approvedPath, 'utf8'));
      if (rig.status !== 'approved' || rig.source !== 'cutout.webp') {
        throw new Error('Rig manifest is not approved or has wrong source');
      }
      checkAsset(dir, rig.eyesClosed, baseline);
      const mouthFiles = ['A', 'E', 'O'].map(k => rig.mouth?.[k]).filter(Boolean);
      if (rig.mouthVisible === true && mouthFiles.length !== 3) {
        throw new Error('Visible mouth requires all A/E/O variants');
      }
      if (rig.mouthVisible !== true && mouthFiles.length) {
        throw new Error('Covered mouth must not contain viseme layers');
      }
      for (const name of mouthFiles) checkAsset(dir, name, baseline);
      for (const name of [rig.smile, rig.thinkingBrows, rig.listeningBrows].filter(Boolean)) {
        checkAsset(dir, name, baseline);
      }
      approved.push(id);
    } catch (error) {
      errors.push(id + ': ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}
if (countries.length !== 22) errors.push('Expected 22 countries, found ' + countries.length);
if (ids.length !== expected) errors.push('Expected 43 portraits, found ' + ids.length);

const report = {
  total: ids.length,
  originalPortraitsPresent: ids.length - errors.filter(e => /Missing original portrait folder/.test(e)).length,
  approvedFacialRigs: approved.length,
  pendingFacialRigs: pending.length,
  live2dReady: 0, // Asset approval is not equivalent to Cubism mesh rigging.
  pending,
  errors
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;

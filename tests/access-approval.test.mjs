import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Policy regression checks. Firestore rule semantics still require emulator tests
// before publishing to the live database.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const auth = read('components/AuthProvider.tsx');
const app = read('App.tsx');
const schoolAccess = read('components/SchoolAccessProvider.tsx');
const admin = read('pages/AdminConsole.tsx');
const rules = read('firestore.rules');

assert.match(app, /profile\?\.approved !== true/, 'Unapproved accounts must be blocked before routes render');
assert.match(app, /user\.emailVerified/, 'Access requires a verified Google identity');
assert.match(auth, /onSnapshot\(userDocRef/, 'Revocation must be observed without a fresh login');
assert.match(auth, /setProfile\(null\); \/\/ Never grant a fallback role/, 'Firestore errors must fail closed');
assert.match(schoolAccess, /profile\.approved !== true/, 'School modules must reject pending accounts');
assert.match(schoolAccess, /isRestricted: true,\s+enabledModules: \[\]/, 'Default module access must be denied');
assert.match(admin, /setUserApproval\(userRecord, userRecord\.approved !== true\)/, 'Admin must be able to approve and revoke access');
assert.match(rules, /function isAuthenticated\(\) \{[\s\S]*?data\.approved == true/, 'Database reads must require explicit approval');
assert.match(rules, /request\.resource\.data\.email == request\.auth\.token\.email/, 'Self-service registration must not spoof another email');
assert.match(rules, /request\.auth\.uid == userId/, 'Profile creation must be restricted to the signed-in user');
assert.match(rules, /!\('approved' in request\.resource\.data\) \|\| request\.resource\.data\.approved == false/, 'New accounts must not self-approve');
assert.match(rules, /isSchoolAdmin\(\) && belongsToSchool\(schoolId\)/, 'School mutations must be restricted to school administrators');
assert.doesNotMatch(rules, /allow read: if true;/, 'Firestore must not permit anonymous document reads');
assert.doesNotMatch(rules, /hasAny\(\['poll', 'exercise', 'reaction', 'stickyNotes'\]\)/, 'Students must not edit unrelated session fields');
console.log('Access approval security regression checks passed (14 checks).');

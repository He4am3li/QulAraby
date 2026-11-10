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
const deleteApi = read('api/admin-delete-user.ts');
assert.match(deleteApi, /auth\.verifyIdToken\(match\[1\], true\)/, 'Owner ID token must be verified and revocation checked server-side');
assert.match(deleteApi, /decoded\.email\?\.toLowerCase\(\) !== OWNER_EMAIL/, 'Only the owner's verified email may delete accounts');
assert.match(deleteApi, /decoded\.email_verified !== true/, 'Owner must use a verified identity');
assert.match(deleteApi, /decoded\.auth_time\) < 300/, 'Deletion requires recent reauthentication');
assert.match(deleteApi, /uid === decoded\.uid/, 'Account deletion must exclude the owner');
assert.match(deleteApi, /getFirestore\(app, FIRESTORE_DATABASE_ID\)/, 'Cleanup must target the named production database');
assert.match(deleteApi, /auth\.deleteUser\(uid\)/, 'Firebase Auth identity must be deleted on the server');
assert.match(deleteApi, /db\.recursiveDelete\(profileRef\)/, 'Profile and nested user documents must be cleaned up');
assert.match(deleteApi, /FIREBASE_SERVICE_ACCOUNT_JSON/, 'Server credentials must come from a private environment variable');
assert.match(admin, /reauthenticateWithPopup\(currentUser, googleProvider\)/, 'Deletion must prompt owner reauthentication');
assert.match(admin, /confirmAccountDeletion/, 'Deletion must require explicit confirmation');
assert.match(admin, /deleteConfirmation\.trim\(\)\.toLowerCase\(\) !== target\.email/, 'Typed email must match the targeted account');
assert.match(admin, /activeAccountMenu === userRecord\.uid/, 'Actions must remain inside the existing compact account menu');
assert.match(admin, /openDeleteConfirmation\(userRecord\)/, 'Delete action must be hidden in the account action menu');
console.log('Access, owner deletion and UI regression checks passed (28 checks).');

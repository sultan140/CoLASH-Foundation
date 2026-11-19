/**
 * Firestore Security Rules Verification Matrix (Phase 0 Security TDD Spec)
 * Maps each of the "Dirty Dozen" adversarial payloads to its expected enforcement gate
 * in `firestore.rules`.
 */

export interface AdversarialTestCase {
  id: string;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  actor: 'anonymous' | 'unverified_email' | 'member_uid_a' | 'member_uid_b';
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
  enforcedByGate: string;
}

export const DIRTY_DOZEN_SECURITY_TESTS: AdversarialTestCase[] = [
  {
    id: 'DD-01',
    name: 'Unauthenticated Write to Public Content',
    collectionPath: '/public_content/projects',
    operation: 'create',
    actor: 'anonymous',
    payload: { sectionId: 'projects', visibility: 'public', payload: {} },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'isAdmin() requires request.auth != null && email_verified == true',
  },
  {
    id: 'DD-02',
    name: 'Unverified Email Spoofing Super Admin',
    collectionPath: '/public_content/websiteCustomConfig',
    operation: 'update',
    actor: 'unverified_email',
    payload: { sectionId: 'websiteCustomConfig', visibility: 'public', payload: {} },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'isVerifiedUser() enforces request.auth.token.email_verified == true',
  },
  {
    id: 'DD-03',
    name: 'Self-Assigned Super Admin Role Escalation',
    collectionPath: '/users/uid_a',
    operation: 'create',
    actor: 'member_uid_a',
    payload: { uid: 'uid_a', displayName: 'Attacker', role: 'super_admin' },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: "isValidUserAccount() enforces data.role == 'member'",
  },
  {
    id: 'DD-04',
    name: 'Shadow Field Injection on Donation Create',
    collectionPath: '/donations/don_1',
    operation: 'create',
    actor: 'member_uid_a',
    payload: { ownerUid: 'uid_a', amount: 500, isVerified: true, ghostField: 1 },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'isValidDonationSubmission() enforces strict keys().hasOnly([...])',
  },
  {
    id: 'DD-05',
    name: 'Cross-User Private PII Read',
    collectionPath: '/users/uid_b/private/info',
    operation: 'get',
    actor: 'member_uid_a',
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'isOwner(uid) || isAdmin()',
  },
  {
    id: 'DD-06',
    name: 'Unfiltered List Query on Donations',
    collectionPath: '/donations',
    operation: 'list',
    actor: 'member_uid_a',
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'allow list: if isAdmin() || (isVerifiedUser() && existing().ownerUid == request.auth.uid)',
  },
  {
    id: 'DD-07',
    name: 'Identity Spoofing via Foreign ownerUid',
    collectionPath: '/applications/app_1',
    operation: 'create',
    actor: 'member_uid_a',
    payload: { id: 'app_1', ownerUid: 'uid_b', trackingId: 'TRK-1', status: 'pending' },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'isValidApplication() enforces data.ownerUid == request.auth.uid',
  },
  {
    id: 'DD-08',
    name: 'Immutable createdAt Tampering on Update',
    collectionPath: '/donations/don_1',
    operation: 'update',
    actor: 'member_uid_a',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'incoming().createdAt == existing().createdAt && affectedKeys().hasOnly(...)',
  },
  {
    id: 'DD-09',
    name: 'Terminal State Bypass on Verified Donation',
    collectionPath: '/donations/don_1',
    operation: 'update',
    actor: 'member_uid_a',
    payload: { amount: 999999 },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: "existing().status == 'pending' required for non-admin updates",
  },
  {
    id: 'DD-10',
    name: 'ID Poisoning with Oversized or Invalid Characters',
    collectionPath: '/public_content/' + 'x'.repeat(200),
    operation: 'get',
    actor: 'anonymous',
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'isValidId(sectionId) enforces size <= 128 and regex match',
  },
  {
    id: 'DD-11',
    name: 'Client-Provided Timestamp Forgery',
    collectionPath: '/applications/app_2',
    operation: 'create',
    actor: 'member_uid_a',
    payload: { createdAt: '1999-01-01T00:00:00Z', updatedAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'incoming().createdAt == request.time && incoming().updatedAt == request.time',
  },
  {
    id: 'DD-12',
    name: 'Non-Allowlisted Admin Section Access via public_content',
    collectionPath: '/public_content/adminUsers',
    operation: 'get',
    actor: 'anonymous',
    expectedResult: 'PERMISSION_DENIED',
    enforcedByGate: 'isAllowedPublicSection(sectionId) explicitly allowlists non-PII sections only',
  },
];

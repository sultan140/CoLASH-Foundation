# Security Specification & Hardened Rules Audit (Phase 0)

## 1. Data Invariants
1. **Default-Deny Catch-All**: All Firestore paths are denied by default (`match /{document=**} { allow read, write: if false; }`).
2. **PII Isolation**:
   - `public_content/{sectionId}` is restricted strictly to allowlisted non-PII section IDs (`websiteCustomConfig`, `mapConfig`, `paymentChannels`, `aiKnowledgeBase`, `projects`, `notices`, `committeeTerms`, `advisors`, `financialRecords`, `publicMembers`, `publicDonations`, `womensPublic`), and only `get` is permitted for public visitors (never blanket `list`).
   - All PII, credentials, audit logs, AI chat histories, private member documents, full donation records (with donor phone/email/trxId), and admin rosters live in `admin_vault/{sectionId}`, `users/{uid}/private/info`, `donations/{donationId}`, and `applications/{applicationId}`, where reads require `isAdmin()` or `isOwner(ownerUid)`.
3. **Verified Identity & Anti-Spoofing**:
   - Every write operation mandates `request.auth != null && request.auth.token.email_verified == true`.
   - Every user-submitted document (`donations`, `applications`, `users`) verifies `incoming().ownerUid == request.auth.uid` (or `uid == request.auth.uid`), and `ownerUid`/`createdAt` are immutable on updates.
4. **Role Escalation Prevention**:
   - Users creating `/users/{uid}` must only set `role: 'member'`; they cannot self-assign `admin` or `super_admin`.
   - Only the verified Super Admin (`ashraful46475348@gmail.com`) can manage `/admin_invites/{email}` or directly delete `/admins/{uid}`.
5. **Temporal & Structural Integrity**:
   - `createdAt == request.time` on creates and `updatedAt == request.time` on creates/updates.
   - Document IDs match `^[a-zA-Z0-9_\-]+$` (and emails in `admin_invites` are bounded).
   - Every string field enforces strict `.size()` bounds; strict `keys().hasAll(...)` and `keys().hasOnly(...)` block shadow fields.
   - `donations` and `applications` lock terminal states (`verified`, `rejected`, `approved`) against non-admin mutations.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write to `public_content/projects`**: Non-signed-in user attempts `setDoc` -> `PERMISSION_DENIED`.
2. **Unverified Email Admin Spoof**: Signed-in user with `email_verified: false` and spoofed email `ashraful46475348@gmail.com` attempts write -> `PERMISSION_DENIED`.
3. **Privilege Escalation on `/users/{uid}`**: Member attempts `create` with `role: "super_admin"` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on `donations/{donationId}`**: Authenticated user appends `isVerified: true` or `adminOverride: true` -> `PERMISSION_DENIED`.
5. **Cross-User PII Read on `users/{otherUid}/private/info`**: User A reads User B's PII document -> `PERMISSION_DENIED`.
6. **Blanket List Scraping on `admin_vault` / `donations` / `applications`**: Non-admin runs unfiltered `list` query without `where('ownerUid', '==', uid)` -> `PERMISSION_DENIED`.
7. **Identity Spoofing on `donations/{donationId}`**: User A sets `ownerUid: "userB"` on create -> `PERMISSION_DENIED`.
8. **Immutable Field Tampering on `applications/{applicationId}`**: User updates `createdAt` or `ownerUid` -> `PERMISSION_DENIED`.
9. **Terminal State Bypass on `donations/{donationId}`**: Non-admin user tries to modify a donation whose `status` is already `'verified'` -> `PERMISSION_DENIED`.
10. **ID Poisoning / Resource Exhaustion**: Attacker writes to `/public_content/` with a 1,500-char ID or invalid characters (`../hack`) -> `PERMISSION_DENIED`.
11. **Timestamp Forgery**: Client sends past ISO timestamp instead of `request.time` server timestamp -> `PERMISSION_DENIED`.
12. **PII Leak via `public_content` Unknown Section**: Non-admin attempts to write or read `/public_content/adminUsers` (not in public allowlist) -> `PERMISSION_DENIED`.

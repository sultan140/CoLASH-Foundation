import { AdminUser, GeneralMember, WomensTeamMember } from '../types';

export interface IdCardAccessCheckParams {
  targetMembershipId?: string;
  targetMemberId?: string | number;
  currentAdmin?: AdminUser | null;
  loggedInMember?: GeneralMember | null;
  currentWomensUser?: WomensTeamMember | null;
}

/**
 * Returns true if the current user is an active Admin / Co-Admin,
 * or if the logged-in member / women's wing user owns this exact ID card.
 * Public visitors and other members cannot view, print, or download another member's ID card.
 */
export function canAccessMemberIdCard({
  targetMembershipId,
  targetMemberId,
  currentAdmin,
  loggedInMember,
  currentWomensUser,
}: IdCardAccessCheckParams): boolean {
  // 1. Active Admin or Co-Admin (any active admin role in governance)
  if (currentAdmin && currentAdmin.isActive) {
    return true;
  }

  const normMembership = (targetMembershipId || '').trim().toLowerCase();
  const normId = targetMemberId !== undefined && targetMemberId !== null
    ? String(targetMemberId).trim().toLowerCase()
    : '';

  // 2. Logged-in General Member viewing/printing/editing their OWN ID card
  if (loggedInMember) {
    const ownerMembership = (loggedInMember.membershipId || '').trim().toLowerCase();
    const ownerId = (loggedInMember.id || '').trim().toLowerCase();
    if (
      (normMembership && ownerMembership && normMembership === ownerMembership) ||
      (normId && ownerId && normId === ownerId) ||
      (normMembership && ownerId && normMembership === ownerId) ||
      (normId && ownerMembership && normId === ownerMembership)
    ) {
      return true;
    }
  }

  // 3. Logged-in Women's Team Member viewing/printing their OWN ID card
  if (currentWomensUser) {
    const ownerMembership = (currentWomensUser.membershipId || '').trim().toLowerCase();
    const ownerId = (currentWomensUser.id || '').trim().toLowerCase();
    if (
      (normMembership && ownerMembership && normMembership === ownerMembership) ||
      (normId && ownerId && normId === ownerId)
    ) {
      return true;
    }
  }

  return false;
}

export function isMemberCardOwner({
  targetMembershipId,
  targetMemberId,
  loggedInMember,
  currentWomensUser,
}: Omit<IdCardAccessCheckParams, 'currentAdmin'>): boolean {
  return canAccessMemberIdCard({
    targetMembershipId,
    targetMemberId,
    currentAdmin: null,
    loggedInMember,
    currentWomensUser,
  });
}

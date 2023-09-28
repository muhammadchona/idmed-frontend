export function useGroup() {
  function isDesintegrated(group: any) {
    return group.endDate !== null;
  }

  function getActiveMemberRows(groupMembersNew: any) {
    const activeMembers = [];
    groupMembersNew.forEach((groupMember) => {
      if (groupMember.membershipEndDate !== null) {
        activeMembers.push(groupMember);
      }
    });
    return activeMembers;
  }

  return { isDesintegrated, getActiveMemberRows };
}

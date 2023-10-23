export function useGroupMember() {
  function isActive(groupMenber: any) {
    return groupMenber.endDate === null || groupMenber.endDate === '';
  }
  function isActiveView(row: any) {
    return (
      row.membershipEndDate === null ||
      row.membershipEndDate === '' ||
      row.membershipEndDate === undefined
    );
  }

  return { isActive, isActiveView };
}

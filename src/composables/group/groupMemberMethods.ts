export function useGroupMember() {
  function isActive(groupMenber: any) {
    return groupMenber.endDate === null || groupMenber.endDate === '';
  }

  return { isActive };
}

export function useGroupMember() {
  function isActive(groupMenber: any) {
    return groupMenber.endDate === null;
  }

  return { isActive };
}

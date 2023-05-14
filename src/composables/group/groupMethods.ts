export function useGroup() {
  function isDesintegrated(group: any) {
    return group.endDate !== null;
  }

  return { isDesintegrated };
}

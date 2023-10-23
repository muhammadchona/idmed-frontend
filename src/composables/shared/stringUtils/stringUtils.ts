export function useStringUtils() {
  function stringContains(stringToCheck: string, stringText: string) {
    if (stringText === '') return false;
    return String(stringToCheck)
      .toLowerCase()
      .includes(String(stringText).toLowerCase());
  }

  return { stringContains };
}

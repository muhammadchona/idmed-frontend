export function useStringUtils() {
  function stringContains(stringToCheck: string, stringText: string) {
    if (stringText === '') return false;
    return stringToCheck.toLowerCase().includes(stringText.toLowerCase());
  }

  return { stringContains };
}

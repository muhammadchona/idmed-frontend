export default {
  chunkArrayWithOffset(array: [], limit: number, offset: number) {
    const result = [];
    let currentOffset = offset;

    while (currentOffset < array.length) {
      const chunk = array.slice(currentOffset, currentOffset + limit);
      result.push(chunk);
      currentOffset += limit;
    }

    return result;
  },
};

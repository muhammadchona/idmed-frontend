type OrmModel = {
  entity: string;
  baseEntity?: string;
};

/**
 * Pinia ORM uses the model's base entity as its Pinia store id. On mobile,
 * those records are already persisted in Dexie and explicitly hydrated into
 * Pinia, so persisting the same stores in localStorage duplicates the data and
 * synchronously serializes whole tables after every mutation.
 */
export function getOrmStoreIds(models: OrmModel[]) {
  return new Set(models.map((model) => model.baseEntity ?? model.entity));
}

export function shouldSkipOrmLocalStoragePersistence(
  isMobile: boolean,
  storeId: string,
  ormStoreIds: ReadonlySet<string>
) {
  return isMobile && ormStoreIds.has(storeId);
}

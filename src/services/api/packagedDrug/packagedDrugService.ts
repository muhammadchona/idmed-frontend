import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import drugService from '../drugService/drugService';
import packService from '../pack/packService';

const packagedDrug = useRepo(PackagedDrug);
const packagedDrugDexie = db[PackagedDrug.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const toPlainObject = (payload: any) => {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.log(error);
      return payload;
    }
  }
  return payload;
};

let packagedDrugMobileCache: any[] = [];

const setPackagedDrugMobileCache = (rows: any[]) => {
  packagedDrugMobileCache = rows.map((row) => clone(row));
};

const getPackagedDrugMobileCache = () =>
  packagedDrugMobileCache.map((row) => clone(row));

const upsertPackagedDrugCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = packagedDrugMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      packagedDrugMobileCache.splice(index, 1, payload);
    } else {
      packagedDrugMobileCache.push(payload);
    }
  });
};

const removePackagedDrugFromCache = (id: string) => {
  packagedDrugMobileCache = packagedDrugMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshPackagedDrugMobileCache = async () => {
  const rows = await packagedDrugDexie.toArray();
  setPackagedDrugMobileCache(rows);
  return getPackagedDrugMobileCache();
};

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(uid, params);
    }
  },
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('packagedDrug', params)
      .then((resp) => {
        if (!isMobile.value) {
          packagedDrug.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          packagedDrugDexie
            .put(payload)
            .then(() => upsertPackagedDrugCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            packagedDrug.save(resp.data);
          }
          if (isMobile.value && !isOnline.value) {
            const payload = Array.isArray(resp.data)
              ? resp.data.map((entry: any) => clone(entry))
              : [clone(resp.data)];
            packagedDrugDexie
              .bulkPut(payload)
              .then(() => upsertPackagedDrugCache(payload))
              .catch((error) => console.log(error));
          }
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('packagedDrug/' + uuid, params)
      .then((resp) => {
        if (!isMobile.value) {
          packagedDrug.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          packagedDrugDexie
            .put(payload)
            .then(() => upsertPackagedDrugCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('packagedDrug/' + uuid)
      .then(() => {
        if (!isMobile.value) {
          packagedDrug.destroy(uuid);
        }
        if (isMobile.value && !isOnline.value) {
          packagedDrugDexie
            .delete(uuid)
            .then(() => removePackagedDrugFromCache(uuid))
            .catch((error) => console.log(error));
        }
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return packagedDrugDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertPackagedDrugCache(payload);
        return payload;
      }
      // packagedDrug.save(payload);
      return payload;
    });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return packagedDrugDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertPackagedDrugCache(payload);
        return payload;
      }
      packagedDrug.save(payload);
      return payload;
    });
  },
  getMobile() {
    return packagedDrugDexie
      .toArray()
      .then((rows: any) => {
        if (isMobile.value && !isOnline.value) {
          setPackagedDrugMobileCache(rows);
          return getPackagedDrugMobileCache();
        }
        packagedDrug.save(rows);
        return rows;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  addBulkMobile() {
    const packagedDrugFromPinia = this.getAllFromStorageForDexie();

    return packagedDrugDexie
      .bulkPut(packagedDrugFromPinia)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          upsertPackagedDrugCache(packagedDrugFromPinia);
        } else {
          packagedDrug.save(packagedDrugFromPinia);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async getAllByPackIdMobile(packId: any) {
    const packagedDrugs = await packagedDrugDexie
      .where('pack_id')
      .equals(packId)
      .toArray();

    const drugsId = packagedDrugs.map(
      (packagedDrug: any) => packagedDrug.drug_id
    );
    const [drugs] = await Promise.all([
      drugService.getAllByIDsFromDexie(drugsId),
    ]);

    if (isMobile.value && !isOnline.value) {
      upsertPackagedDrugCache(packagedDrugs);
    } else {
      packagedDrug.save(packagedDrugs);
    }

    packagedDrugs.map((packagedDrug: any) => {
      packagedDrug.drug = drugs.find(
        (drug: any) => drug.id === packagedDrug.drug_id
      );
    });

    return packagedDrugs.map((entry: any) => clone(entry));
  },

  deleteMobile(paramsId: string) {
    return packagedDrugDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          removePackagedDrugFromCache(paramsId);
        } else {
          packagedDrug.destroy(paramsId);
        }
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  async apiGetAllByPackId(packId: string) {
    return await api()
      .get('/packagedDrug/pack/' + packId)
      .then((resp) => {
        if (!isMobile.value) {
          packagedDrug.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = Array.isArray(resp.data)
            ? resp.data.map((entry: any) => clone(entry))
            : [clone(resp.data)];
          packagedDrugDexie
            .bulkPut(payload)
            .then(() => upsertPackagedDrugCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },

  async apiGetAll() {
    return await api()
      .get('/packagedDrug?offset=' + 0 + '&max=' + 200)
      .then((resp) => {
        if (!isMobile.value) {
          packagedDrug.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = Array.isArray(resp.data)
            ? resp.data.map((entry: any) => clone(entry))
            : [clone(resp.data)];
          packagedDrugDexie
            .bulkPut(payload)
            .then(() => upsertPackagedDrugCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getPackagedDrugMobileCache();
    }
    return packagedDrug.all();
  },
  getAllFromStorageForDexie() {
    if (isMobile.value && !isOnline.value) {
      return getPackagedDrugMobileCache();
    }
    return packagedDrug
      .makeHidden(['pack', 'drug', 'packagedDrugStocks'])
      .all();
  },
  deleteAllFromStorage() {
    packagedDrug.flush();
  },

  async getAllByIDsFromDexie(ids: string[]) {
    const collection = packagedDrugDexie
      .orderBy('nextPickUpDate')
      .filter(
        (packagedDrug: PackagedDrug) =>
          ids.includes(packagedDrug.pack_id) ||
          ids.includes(packagedDrug?.pack?.id ?? '')
      );
    const packagedDrugs = await collection.toArray();

    const drugsId = packagedDrugs.map((packagedDrug: any) =>
      packagedDrug?.drug?.id ? packagedDrug.drug.id : ''
    );
    const [drugs] = await Promise.all([
      drugService.getAllByIDsFromDexie(drugsId),
    ]);

    packagedDrugs.map((packagedDrug: any) => {
      packagedDrug.drug = drugs.find(
        (drug: any) => drug.id === packagedDrug.drug.id
      );
    });
    if (isMobile.value && !isOnline.value) {
      upsertPackagedDrugCache(packagedDrugs);
      return packagedDrugs.map((entry: any) => clone(entry));
    }
    packagedDrug.save(packagedDrugs);
    return packagedDrugs;
  },
  async getAllPackagedDrugByIDsFromDexie(ids: []) {
    const packagedDrugs = await packagedDrugDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();

    const packIds = packagedDrugs.map((packagedDrug: any) =>
      packagedDrug?.pack?.id ? packagedDrug.pack.id : ''
    );

    const [packList] = await Promise.all([
      packService.getPacksByIDsFromDexie(packIds),
    ]);

    packagedDrugs.map((packagedDrug: any) => {
      packagedDrug.pack = packList.find(
        (pack: any) => pack.id === packagedDrug.pack.id
      );
    });
    if (isMobile.value && !isOnline.value) {
      upsertPackagedDrugCache(packagedDrugs);
      return packagedDrugs.map((entry: any) => clone(entry));
    }
    packagedDrug.save(packagedDrugs);
    return packagedDrugs;
  },
  deleteAllFromDexie() {
    packagedDrugMobileCache = [];
    packagedDrugDexie.clear();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshPackagedDrugMobileCache();
  },
};

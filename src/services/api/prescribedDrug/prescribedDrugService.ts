import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import drugService from '../drugService/drugService';

const prescribedDrug = useRepo(PrescribedDrug);
const prescribedDrugDexie = db[PrescribedDrug.entity];

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

let prescribedDrugMobileCache: any[] = [];

const setPrescribedDrugMobileCache = (rows: any[]) => {
  prescribedDrugMobileCache = rows.map((row) => clone(row));
};

const getPrescribedDrugMobileCache = () =>
  prescribedDrugMobileCache.map((row) => clone(row));

const upsertPrescribedDrugCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = prescribedDrugMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      prescribedDrugMobileCache.splice(index, 1, payload);
    } else {
      prescribedDrugMobileCache.push(payload);
    }
  });
};

const removePrescribedDrugFromCache = (id: string) => {
  prescribedDrugMobileCache = prescribedDrugMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshPrescribedDrugMobileCache = async () => {
  const rows = await prescribedDrugDexie.toArray();
  setPrescribedDrugMobileCache(rows);
  return getPrescribedDrugMobileCache();
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
      .post('prescribedDrug', params)
      .then((resp) => {
        if (!isMobile.value) {
          prescribedDrug.save(resp.data);
        }
        if (isMobile.value) {
          const payload = clone(resp.data);
          prescribedDrugDexie
            .put(payload)
            .then(() => upsertPrescribedDrugCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescribedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            prescribedDrug.save(resp.data);
          }
          if (isMobile.value) {
            const payload = Array.isArray(resp.data)
              ? resp.data.map((entry: any) => clone(entry))
              : [clone(resp.data)];
            prescribedDrugDexie
              .bulkPut(payload)
              .then(() => upsertPrescribedDrugCache(payload))
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
      .patch('prescribedDrug/' + uuid, params)
      .then((resp) => {
        if (!isMobile.value) {
          prescribedDrug.save(resp.data);
        }
        if (isMobile.value) {
          const payload = clone(resp.data);
          prescribedDrugDexie
            .put(payload)
            .then(() => upsertPrescribedDrugCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('prescribedDrug/' + uuid)
      .then(() => {
        prescribedDrug.destroy(uuid);
        if (isMobile.value) {
          prescribedDrugDexie
            .delete(uuid)
            .then(() => removePrescribedDrugFromCache(uuid))
            .catch((error) => console.log(error));
        }
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return prescribedDrugDexie.put(payload).then(() => {
      if (isMobile.value) {
        upsertPrescribedDrugCache(payload);
        return payload;
      }
      //  prescribedDrug.save(payload);
      return payload;
    });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return prescribedDrugDexie.put(payload).then(() => {
      if (isMobile.value) {
        upsertPrescribedDrugCache(payload);
        return payload;
      }
      prescribedDrug.save(payload);
      return payload;
    });
  },
  getMobile() {
    return prescribedDrugDexie
      .toArray()
      .then((rows: any) => {
        if (isMobile.value) {
          setPrescribedDrugMobileCache(rows);
          return getPrescribedDrugMobileCache();
        }
        prescribedDrug.save(rows);
        return rows;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    return prescribedDrugDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value) {
          removePrescribedDrugFromCache(paramsId);
        } else {
          prescribedDrug.destroy(paramsId);
        }
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  addBulkMobile() {
    const prescribedDrugFromPinia = this.getAllFromStorageForDexie();

    return prescribedDrugDexie
      .bulkPut(prescribedDrugFromPinia)
      .then(() => {
        if (isMobile.value) {
          upsertPrescribedDrugCache(prescribedDrugFromPinia);
        } else {
          prescribedDrug.save(prescribedDrugFromPinia);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async getLastByPrescriprionIdFromDexie(prescriptionId: string) {
    const collection = prescribedDrugDexie.filter(
      (prescribedDrug: PrescribedDrug) =>
        prescribedDrug?.prescription.id === prescriptionId
    );
    return await collection.toArray().then((prescribedDrugs: any) => {
      if (isMobile.value) {
        upsertPrescribedDrugCache(prescribedDrugs);
      } else {
        prescribedDrug.save(prescribedDrugs);
      }
      return prescribedDrugs.map((entry: any) => clone(entry));
    });
  },
  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api()
      .get('/prescribedDrug/prescription/' + prescriptionId)
      .then((resp) => {
        prescribedDrug.save(resp.data);
        if (isMobile.value) {
          const payload = Array.isArray(resp.data)
            ? resp.data.map((entry: any) => clone(entry))
            : [clone(resp.data)];
          prescribedDrugDexie
            .bulkPut(payload)
            .then(() => upsertPrescribedDrugCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },

  async apiGetAll() {
    return this.get(0);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescribedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value) {
      return getPrescribedDrugMobileCache();
    }
    return prescribedDrug.all();
  },
  getAllFromStorageForDexie() {
    if (isMobile.value) {
      return getPrescribedDrugMobileCache();
    }
    return prescribedDrug.makeHidden(['prescription', 'drug']).all();
  },
  deleteAllFromStorage() {
    prescribedDrug.flush();
  },
  getLastByPrescriprionId(prescriptionId: string) {
    if (isMobile.value) {
      return getPrescribedDrugMobileCache().find(
        (entry) => entry.prescription_id === prescriptionId
      );
    }
    return prescribedDrug.where('prescription_id', prescriptionId).first();
  },
  async getAllByPrescriprionIdListFromDexie(prescriptionIds: string[]) {
    const collection = prescribedDrugDexie.filter(
      (prescribedDrug: PrescribedDrug) =>
        prescriptionIds.includes(prescribedDrug?.prescription?.id)
    );
    const prescribedDrugs = await collection
      .toArray()
      .then((prescribedDrugs: any) => {
        if (isMobile.value) {
          upsertPrescribedDrugCache(prescribedDrugs);
        } else {
          prescribedDrug.save(prescribedDrugs);
        }
        return prescribedDrugs;
      });

    const drugIds = prescribedDrugs.map((prescribedDrug: any) =>
      prescribedDrug?.drug?.id ? prescribedDrug.drug.id : ''
    );

    const [drugs] = await Promise.all([
      drugService.getAllByIDsFromDexie(drugIds),
    ]);

    prescribedDrugs.map((prescribedDrug: any) => {
      prescribedDrug.drug = drugs.find(
        (drug: any) => drug.id === prescribedDrug.drug.id
      );
    });
    return prescribedDrugs.map((entry: any) => clone(entry));
  },
  deleteAllFromDexie() {
    prescribedDrugMobileCache = [];
    prescribedDrugDexie.clear();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshPrescribedDrugMobileCache();
  },
};

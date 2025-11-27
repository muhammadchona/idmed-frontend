import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescriptionDetails from 'src/stores/models/prescriptionDetails/PrescriptionDetail';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { S } from 'app/src-cordova/platforms/android/app/build/intermediates/assets/release/mergeReleaseAssets/www/assets/systemConfigsService.c9aa92d0';
import therapeuticLineService from '../therapeuticLineService/therapeuticLineService';
import therapeuticalRegimenService from '../therapeuticalRegimenService/therapeuticalRegimenService';
import dispenseTypeService from '../dispenseType/dispenseTypeService';
import spetialPrescriptionMotiveService from '../spetialPrescriptionMotive/spetialPrescriptionMotiveService';
import PrescriptionDetail from 'src/stores/models/prescriptionDetails/PrescriptionDetail';

const prescriptionDetails = useRepo(PrescriptionDetails);
const prescriptionDetailsDexie = db[PrescriptionDetails.entity];

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

let prescriptionDetailsMobileCache: any[] = [];

const setPrescriptionDetailsMobileCache = (rows: any[]) => {
  prescriptionDetailsMobileCache = rows.map((row) => clone(row));
};

const getPrescriptionDetailsMobileCache = () =>
  prescriptionDetailsMobileCache.map((row) => clone(row));

const upsertPrescriptionDetailsCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = prescriptionDetailsMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      prescriptionDetailsMobileCache.splice(index, 1, payload);
    } else {
      prescriptionDetailsMobileCache.push(payload);
    }
  });
};

const removePrescriptionDetailFromCache = (id: string) => {
  prescriptionDetailsMobileCache = prescriptionDetailsMobileCache.filter(
    (entry) => entry.id !== id
  );
};

const refreshPrescriptionDetailsMobileCache = async () => {
  const rows = await prescriptionDetailsDexie.toArray();
  setPrescriptionDetailsMobileCache(rows);
  return getPrescriptionDetailsMobileCache();
};

const findPrescriptionDetailInCache = (predicate: (entry: any) => boolean) =>
  getPrescriptionDetailsMobileCache().find(predicate) ?? null;

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
      .post('prescriptionDetails', params)
      .then((resp) => {
        if (!isMobile.value) {
          prescriptionDetails.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          prescriptionDetailsDexie
            .put(payload)
            .then(() => {
              upsertPrescriptionDetailsCache(payload);
            })
            .catch((error) => console.log(error));
        }
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescriptionDetails?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            prescriptionDetails.save(resp.data);
          }
          if (isMobile.value && !isOnline.value) {
            const payload = Array.isArray(resp.data)
              ? resp.data.map((entry: any) => clone(entry))
              : [clone(resp.data)];
            prescriptionDetailsDexie
              .bulkPut(payload)
              .then(() => {
                upsertPrescriptionDetailsCache(payload);
              })
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
      .patch('prescriptionDetails/' + uuid, params)
      .then((resp) => {
        if (!isMobile.value) {
          prescriptionDetails.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          prescriptionDetailsDexie
            .put(payload)
            .then(() => {
              upsertPrescriptionDetailsCache(payload);
            })
            .catch((error) => console.log(error));
        }
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('prescriptionDetails/' + uuid)
      .then(() => {
        prescriptionDetails.destroy(uuid);
        if (isMobile.value && !isOnline.value) {
          prescriptionDetailsDexie
            .delete(uuid)
            .then(() => {
              removePrescriptionDetailFromCache(uuid);
            })
            .catch((error) => console.log(error));
        }
      });
  },
  // Mobile
  addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return prescriptionDetailsDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertPrescriptionDetailsCache(payload);
        return payload;
      }
      // prescriptionDetails.save(payload);
      return payload;
    });
  },
  putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    return prescriptionDetailsDexie.put(payload).then(() => {
      if (isMobile.value && !isOnline.value) {
        upsertPrescriptionDetailsCache(payload);
        return payload;
      }
      prescriptionDetails.save(payload);
      return payload;
    });
  },

  getMobile() {
    return prescriptionDetailsDexie
      .toArray()
      .then((rows: any) => {
        if (isMobile.value && !isOnline.value) {
          setPrescriptionDetailsMobileCache(rows);
          return getPrescriptionDetailsMobileCache();
        }
        prescriptionDetails.save(rows);
        return rows;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    return prescriptionDetailsDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          removePrescriptionDetailFromCache(paramsId);
        } else {
          prescriptionDetails.destroy(paramsId);
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
    const prescriptionDetailsFromPinia = this.getAllFromStorageForDexie();

    return prescriptionDetailsDexie
      .bulkPut(prescriptionDetailsFromPinia)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          upsertPrescriptionDetailsCache(prescriptionDetailsFromPinia);
        } else {
          prescriptionDetails.save(prescriptionDetailsFromPinia);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api()
      .get('/prescriptionDetail/prescription/' + prescriptionId)
      .then((resp) => {
        if (!isMobile.value) {
          prescriptionDetails.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = Array.isArray(resp.data)
            ? resp.data.map((entry: any) => clone(entry))
            : [clone(resp.data)];
          prescriptionDetailsDexie
            .bulkPut(payload)
            .then(() => {
              upsertPrescriptionDetailsCache(payload);
            })
            .catch((error) => console.log(error));
        }
      });
  },

  async apiGetAll() {
    return this.get(0);
  },

  async apiFetchById(id: string) {
    return await api().get(`/prescriptionDetail/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return prescriptionDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getPrescriptionDetailsMobileCache();
    }
    return prescriptionDetails.all();
  },
  getAllFromStorageForDexie() {
    if (isMobile.value && !isOnline.value) {
      return getPrescriptionDetailsMobileCache();
    }
    return prescriptionDetails
      .makeHidden([
        'prescription',
        'therapeuticLine',
        'therapeuticRegimen',
        'dispenseType',
        'spetialPrescriptionMotive',
      ])
      .all();
  },
  deleteAllFromStorage() {
    prescriptionDetails.flush();
  },
  getPrescriptionDetailByPrescriptionID(prescriptionID: string) {
    if (isMobile.value && !isOnline.value) {
      return getPrescriptionDetailsMobileCache().filter(
        (entry) => entry.prescription_id === prescriptionID
      );
    }
    return prescriptionDetails.withAll().where((prescriptionDetails: any) => {
      return prescriptionDetails.prescription_id === prescriptionID;
    });
  },

  getPrescriptionDetailByID(Id: string) {
    if (isMobile.value && !isOnline.value) {
      return findPrescriptionDetailInCache((entry) => entry.id === Id);
    }
    return prescriptionDetails
      .withAll()
      .with('therapeuticRegimen', (query: any) => {
        query.withAllRecursive(2);
      })
      .where((prescriptionDetails: any) => {
        return prescriptionDetails.id === Id;
      })
      .first();
  },

  getLastByPrescriprionId(prescriptionId: string) {
    if (isMobile.value && !isOnline.value) {
      return getPrescriptionDetailsMobileCache().find(
        (entry) => entry.prescription_id === prescriptionId
      );
    }
    return prescriptionDetails
      .withAllRecursive(1)
      .where('prescription_id', prescriptionId)
      .first();
  },

  // Dexie Block
  async getLastByPrescriprionIdFromDexie(prescriptionId: string) {
    const collection = prescriptionDetailsDexie.filter(
      (prescriptionDetail: PrescriptionDetail) =>
        prescriptionId === prescriptionDetail?.prescription?.id
    );
    return await collection.toArray().then((prescriptionDetailsObject: any) => {
      if (isMobile.value && !isOnline.value) {
        upsertPrescriptionDetailsCache(prescriptionDetailsObject);
      } else {
        prescriptionDetails.save(prescriptionDetailsObject);
      }
      return prescriptionDetailsObject.map((entry: any) => clone(entry));
    });
  },

  async getLastByPrescriprionIdListFromDexie(prescriptionIds: string[]) {
    const collection = prescriptionDetailsDexie.filter(
      (prescriptionDetail: PrescriptionDetail) =>
        prescriptionIds.includes(prescriptionDetail.prescription_id) ||
        prescriptionIds.includes(prescriptionDetail?.prescription?.id)
    );
    const prescriptionsDetails = await collection.toArray();

    const therapeuticLineIds = prescriptionsDetails.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.therapeuticLine?.id
          ? prescriptionsDetail.therapeuticLine.id
          : ''
    );
    const therapeuticRegimenIds = prescriptionsDetails.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.therapeuticRegimen?.id
          ? prescriptionsDetail.therapeuticRegimen.id
          : ''
    );
    const dispenseTypeIds = prescriptionsDetails.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.dispenseType?.id
          ? prescriptionsDetail.dispenseType.id
          : ''
    );
    const spetialPrescriptionMotiveIds = prescriptionsDetails.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.spetialPrescriptionMotive?.id
          ? prescriptionsDetail.spetialPrescriptionMotive.id
          : ''
    );

    const [
      therapeuticLines,
      therapeuticRegimens,
      dispenseTypes,
      spetialPrescriptionMotives,
    ] = await Promise.all([
      therapeuticLineService.getAllByIDsFromDexie(therapeuticLineIds),
      therapeuticalRegimenService.getAllByIDsFromDexie(therapeuticRegimenIds),
      dispenseTypeService.getAllByIDsFromDexie(dispenseTypeIds),
      spetialPrescriptionMotiveService.getAllByIDsFromDexie(
        spetialPrescriptionMotiveIds
      ),
    ]);
    prescriptionsDetails.map((prescriptionsDetail: any) => {
      prescriptionsDetail.therapeuticLine = therapeuticLines.find(
        (therapeuticLine: any) =>
          therapeuticLine.id === prescriptionsDetail?.therapeuticLine?.id
      );
      prescriptionsDetail.therapeuticRegimen = therapeuticRegimens.find(
        (therapeuticRegimen: any) =>
          therapeuticRegimen.id === prescriptionsDetail?.therapeuticRegimen?.id
      );
      prescriptionsDetail.dispenseType = dispenseTypes.find(
        (dispenseType: any) =>
          dispenseType.id === prescriptionsDetail?.dispenseType?.id
      );
      prescriptionsDetail.spetialPrescriptionMotive =
        spetialPrescriptionMotives.find(
          (spetialPrescriptionMotive: any) =>
            spetialPrescriptionMotive.id ===
            prescriptionsDetail?.spetialPrescriptionMotive?.id
        );
    });

    if (isMobile.value && !isOnline.value) {
      upsertPrescriptionDetailsCache(prescriptionsDetails);
      return prescriptionsDetails.map((entry: any) => clone(entry));
    }
    prescriptionDetails.save(prescriptionsDetails);
    return prescriptionsDetails;
  },

  async getAllByIDsFromDexie(ids: []) {
    const results = await prescriptionDetailsDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
    if (isMobile.value && !isOnline.value) {
      upsertPrescriptionDetailsCache(results);
      return results.map((entry: any) => clone(entry));
    }
    prescriptionDetails.save(results);
    return results;
  },
  deleteAllFromDexie() {
    prescriptionDetailsDexie.clear();
    prescriptionDetailsMobileCache = [];
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshPrescriptionDetailsMobileCache();
  },
};

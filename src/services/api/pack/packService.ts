import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Pack from 'src/stores/models/packaging/Pack';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import ChunkArray from 'src/utils/ChunkArray';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import dispenseModeService from '../dispenseMode/dispenseModeService';
import clinicService from '../clinicService/clinicService';
import packagedDrugService from '../packagedDrug/packagedDrugService';
import moment from 'moment';
import patientVisitService from '../patientVisit/patientVisitService';
import patientService from '../patientService/patientService';
import drugService from '../drugService/drugService';

const pack = useRepo(Pack);
const packDexie = db[Pack.entity];

const { closeLoading } = useLoading();
const { getMonthsDateOfTheYear, addDays } = useDateUtils();
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

let packMobileCache: any[] = [];

const setPackMobileCache = (rows: any[]) => {
  packMobileCache = rows.map((row) => clone(row));
};

const getPackMobileCache = () => packMobileCache.map((row) => clone(row));

const findPackInCache = (predicate: (entry: any) => boolean) =>
  getPackMobileCache().find(predicate) ?? null;

const upsertPackCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = packMobileCache.findIndex((item) => item.id === payload.id);
    if (index >= 0) {
      packMobileCache.splice(index, 1, payload);
    } else {
      packMobileCache.push(payload);
    }
  });
};

const removePackFromCache = (id: string) => {
  packMobileCache = packMobileCache.filter((entry) => entry.id !== id);
};

const refreshPackMobileCache = async () => {
  const rows = await packDexie.toArray();
  const hydratedRows = await Promise.all(
    rows.map((entry: any) => hydratePack(entry))
  );
  setPackMobileCache(hydratedRows);
  return getPackMobileCache();
};

const hydratePack = async (packRow: any) => {
  const payload = clone(packRow);
  if (!isMobile.value || !payload?.id) {
    return payload;
  }

  let packagedDrugs = Array.isArray(payload.packagedDrugs)
    ? payload.packagedDrugs.map((drug: any) => clone(drug))
    : [];

  const requireHydration =
    packagedDrugs.length === 0 ||
    packagedDrugs.some((entry: any) => !entry?.drug || !entry.drug.id);

  if (requireHydration) {
    packagedDrugs = await packagedDrugService.getAllByPackIdMobile(payload.id);
  } else {
    // lazily hydrate the drug object for entries that only have drug_id
    packagedDrugs = await Promise.all(
      packagedDrugs.map(async (packagedDrug: any) => {
        if (packagedDrug?.drug?.id) {
          return packagedDrug;
        }
        const drugId = packagedDrug?.drug_id ?? packagedDrug?.drug?.id ?? null;
        if (!drugId) {
          return packagedDrug;
        }
        const drugRow = await drugService.getMobileDrugById(drugId);
        return {
          ...packagedDrug,
          drug: drugRow ? clone(drugRow) : packagedDrug.drug,
        };
      })
    );
  }

  payload.packagedDrugs = packagedDrugs;
  return payload;
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
      .post('pack', params)
      .then((resp) => {
        if (!isMobile.value) {
          pack.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          packDexie
            .put(payload)
            .then(() => upsertPackCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pack?offset=' + offset + '&max=100')
        .then((resp) => {
          if (!isMobile.value) {
            pack.save(resp.data);
          }
          if (isMobile.value && !isOnline.value) {
            const payload = Array.isArray(resp.data)
              ? resp.data.map((entry: any) => clone(entry))
              : [clone(resp.data)];
            packDexie
              .bulkPut(payload)
              .then(() => upsertPackCache(payload))
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
      .patch('pack/' + uuid, params)
      .then((resp) => {
        if (!isMobile.value) {
          pack.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          packDexie
            .put(payload)
            .then(() => upsertPackCache(payload))
            .catch((error) => console.log(error));
        }
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('pack/' + uuid)
      .then(() => {
        if (!isMobile.value) {
          pack.destroy(uuid);
        }
        if (isMobile.value && !isOnline.value) {
          packDexie
            .delete(uuid)
            .then(() => removePackFromCache(uuid))
            .catch((error) => console.log(error));
        }
      });
  },
  // Mobile
  async addMobile(params: string) {
    const payload = clone(toPlainObject(params));
    await packDexie.put(payload);
    const hydratedPack = await hydratePack(payload);
    if (isMobile.value && !isOnline.value) {
      upsertPackCache(hydratedPack);
      return hydratedPack;
    }
    pack.save(payload);
    return payload;
  },
  async putMobile(params: string) {
    const payload = clone(toPlainObject(params));
    await packDexie.put(payload);
    const hydratedPack = await hydratePack(payload);
    if (isMobile.value && !isOnline.value) {
      upsertPackCache(hydratedPack);
      return hydratedPack;
    }
    pack.save(payload);
    return payload;
  },
  async getMobile() {
    try {
      const rows = await packDexie.toArray();
      if (isMobile.value && !isOnline.value) {
        const hydratedRows = await Promise.all(
          rows.map((entry: any) => hydratePack(entry))
        );
        setPackMobileCache(hydratedRows);
        return getPackMobileCache();
      }
      pack.save(rows);
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  deleteMobile(paramsId: string) {
    return packDexie
      .delete(paramsId)
      .then(() => {
        if (isMobile.value && !isOnline.value) {
          removePackFromCache(paramsId);
        } else {
          pack.destroy(paramsId);
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
    const packsFromPinia = this.getAllFromStorageForDexie();
    return packDexie
      .bulkPut(packsFromPinia)
      .then(async () => {
        if (isMobile.value && !isOnline.value) {
          await refreshPackMobileCache();
        } else {
          pack.save(packsFromPinia);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiSave(pack: any) {
    return await api().post('/pack', pack);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/pack/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/pack/AllLastOfClinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        this.addBulkMobile(resp.data);
        if (!isMobile.value) {
          pack.save(resp.data);
        }
      });
  },
  async apiGetByPatientId(patientid: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api()
        .get('pack/patient/' + patientid)
        .then((resp) => {
          if (!isMobile.value) {
            pack.save(resp.data);
          }
          if (isMobile.value && !isOnline.value) {
            const payload = Array.isArray(resp.data)
              ? resp.data.map((entry: any) => clone(entry))
              : [clone(resp.data)];
            packDexie
              .bulkPut(payload)
              .then(() => upsertPackCache(payload))
              .catch((error) => console.log(error));
          }
        });
    }
  },
  async apiGetAllByPatientId(patientid: string, serviceCode: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api().get(
        'pack/getAllByPatient/' + patientid + '/' + serviceCode
      );
    }
  },
  async apiGetAllByPatientVisitDetailsId(
    patientVisitDetailsId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/pack/patientVisitDetails/' +
        patientVisitDetailsId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api().get('/pack/prescription/' + prescriptionId);
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/pack/${id}`)
      .then((resp) => {
        if (!isMobile.value) {
          pack.save(resp.data);
        }
        if (isMobile.value && !isOnline.value) {
          const payload = clone(resp.data);
          packDexie
            .put(payload)
            .then(() => upsertPackCache(payload))
            .catch((error) => console.log(error));
        }
        return resp;
      });
  },

  async getPackMobileById(id: string) {
    const resp = await packDexie.where('id').equalsIgnoreCase(id).first();
    return resp ? clone(resp) : null;
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return pack.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getPackMobileCache();
    }
    return pack.all();
  },
  getAllFromStorageForDexie() {
    if (isMobile.value && !isOnline.value) {
      return getPackMobileCache();
    }
    return pack
      .makeHidden([
        'clinic',
        'patientVisitDetails',
        'dispenseMode',
        'packagedDrugs',
        'groupPack',
        'syncStatus',
      ])
      .all();
  },
  deleteAllFromStorage() {
    pack.flush();
  },
  removeFromStorage(id: string) {
    if (isMobile.value && !isOnline.value) {
      removePackFromCache(id);
      return packDexie.delete(id);
    }
    return pack.destroy(id);
  },

  getPackByID(Id: string) {
    if (isMobile.value && !isOnline.value) {
      return findPackInCache((entry) => entry.id === Id);
    }
    return pack.query().whereId(Id).first();
  },

  async getPackWithsByID(Id: string) {
    if (!isMobile.value) {
      return pack
        .query()
        .with('dispenseMode')
        .with('packagedDrugs')
        .whereId(Id)
        .first();
    }

    const cached = findPackInCache((entry) => entry.id === Id);

    if (
      cached &&
      Array.isArray(cached.packagedDrugs) &&
      cached.packagedDrugs.length
    ) {
      return clone(cached);
    }

    const dexieRow = await packDexie.get(Id);
    if (!dexieRow) {
      return null;
    }

    const hydrated = await hydratePack(dexieRow);
    upsertPackCache(hydrated);
    return clone(hydrated);
  },

  getLastPackFromPatientVisitAndPrescription(prescriptionId: string) {
    if (isMobile.value && !isOnline.value) {
      console.log(getPackMobileCache());
      const packs = getPackMobileCache()
        .filter((entry) =>
          (entry.patientVisitDetails || []).some(
            (detail: any) => detail.prescription_id === prescriptionId
          )
        )
        .filter((entry: any) => entry !== null)
        .sort((a, b) =>
          String(b.pickupDate || '').localeCompare(String(a.pickupDate || ''))
        );

      return packs.length > 0 ? packs[0] : null;
    }
    const packreturn = pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('prescription_id', prescriptionId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
    return packreturn;
  },
  getLastPackFromEpisode(episodeId: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getPackMobileCache()
          .filter((entry) =>
            (entry.patientVisitDetails || []).some(
              (detail: any) => detail.episode_id === episodeId
            )
          )
          .sort((a, b) =>
            String(b.pickupDate || '').localeCompare(String(a.pickupDate || ''))
          )[0] ?? null
      );
    }
    return pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('episode_id', episodeId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },

  getPacksFromPatientId(patientServiceIdentifierid: string) {
    if (isMobile.value && !isOnline.value) {
      return getPackMobileCache()
        .filter((entry) =>
          (entry.patientVisitDetails || []).some((detail: any) => {
            const episode = detail.episode || {};
            return (
              episode.patientServiceIdentifier_id === patientServiceIdentifierid
            );
          })
        )
        .sort((a, b) =>
          String(b.pickupDate || '').localeCompare(String(a.pickupDate || ''))
        );
    }
    return pack
      .withAllRecursive(2)
      .whereHas('patientVisitDetails', (query) => {
        query.whereHas('episode', (query) => {
          query.where(
            'patientServiceIdentifier_id',
            patientServiceIdentifierid
          );
        });
      })
      .orderBy('pickupDate', 'desc')
      .get();
  },

  getLastPackFromPatientId(patientServiceIdentifierid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.getPacksFromPatientId(patientServiceIdentifierid)[0] ?? null;
    }
    return pack
      .withAllRecursive(2)
      .whereHas('patientVisitDetails', (query) => {
        query.whereHas('episode', (query) => {
          query.where(
            'patientServiceIdentifier_id',
            patientServiceIdentifierid
          );
        });
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },

  getLastPackFromPatientAndDrug(patient: string, drug: string) {
    if (isMobile.value && !isOnline.value) {
      const list = getPackMobileCache()
        .filter((entry) =>
          (entry.packagedDrugs || []).some(
            (packagedDrug: any) => packagedDrug.drug?.id === drug.id
          )
        )
        .sort((a, b) =>
          String(b.pickupDate || '').localeCompare(String(a.pickupDate || ''))
        )[0];
      if (list) {
        return (list.packagedDrugs || []).find(
          (packagedDrug: any) => packagedDrug.drug?.id === drug.id
        );
      }
      return null;
    }
    const list = pack
      .withAllRecursive(3)
      .whereHas('packagedDrugs', (query) => {
        query.where('drug_id', drug.id);
      })
      .orderBy('pickupDate', 'desc')
      .first();
    if (list != null) {
      const foundPackagedDrug = list.packagedDrugs.find((packagedDrug) => {
        return packagedDrug.drug.id === drug.id;
      });
      return foundPackagedDrug;
    }
  },

  checkIfExistsAnyQuanityRemainForDispense(packagedDrugs: any) {
    let counter = 0;
    for (const pd of packagedDrugs) {
      if (pd.quantityRemain > 0) {
        counter += pd.quantityRemain;
      }
    }
    return counter > 0;
  },

  async getAllMobileByIds(packIds: any) {
    const resp = await packDexie.where('id').anyOf(packIds).toArray();

    if (isMobile.value && !isOnline.value) {
      upsertPackCache(resp);
      return resp.map((entry) => clone(entry));
    }
    pack.save(resp);
    return resp;
  },

  async getPacksByIds(packIds: any) {
    const limit = 100; // Define your limit
    const offset = 0;

    const chunks = ChunkArray.chunkArrayWithOffset(packIds, limit, offset);

    const allPacks = [];

    for (const chunk of chunks) {
      const packs = await api().post('/pack/getAllByPackIds/', chunk);

      allPacks.push(...packs.data);
    }
    // this.addBulkMobile(allPacks);
  },

  async getAllPacksByStartDateAndEndDateFromDexie(
    startDate: any,
    endDate: any
  ) {
    const packs = (
      await packDexie
        .where('pickupDate')
        .between(startDate, endDate, true, true)
        .reverse()
        .sortBy('pickupDate')
    ).filter((p) => p.syncStatus === 'R');

    const packIds = packs.map((pack: any) => pack.id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    if (isMobile.value && !isOnline.value) {
      upsertPackCache(packs);
      return packs.map((entry: any) => clone(entry));
    }
    return packs;
  },

  async getTotalPacksInYear(year: number) {
    const periods = getMonthsDateOfTheYear(year);
    // Map each period to a promise to get packs from Dexie
    return await Promise.all(
      periods.map((period) =>
        this.getAllPacksByStartDateAndEndDateFromDexie(
          period.startDate,
          period.endDate
        )
      )
    );
  },
  // //

  async getAllActivePacksInYear(year: number) {
    const periods = getMonthsDateOfTheYear(year);
    // Map each period to a promise to get packs from Dexie
    const currDate = new Date();
    let endDate = '';
    const startDate = periods[0].startDate;
    periods.map((period) => {
      if (period.month === 12) {
        if (currDate < new Date(period.endDate)) {
          endDate = moment(currDate).format('YYYY-MM-DD');
        } else {
          endDate = period.endDate;
        }
      }
    });

    return await Promise.all([
      this.getAllActivePatientByEndDateFromDexie(startDate, endDate),
    ]);
  },

  async getAllByIDsFromDexie(ids: []) {
    const packs = await packDexie
      .where('id')
      .anyOf(ids)
      .reverse()
      .sortBy('pickupDate');

    const packsId = packs.map((pack: any) => (pack?.id ? pack.id : ''));
    const dispenseModeIds = packs.map((pack: any) =>
      pack?.dispenseMode?.id ? pack.dispenseMode.id : ''
    );
    const clinicIds = packs.map((pack: any) =>
      pack?.clinic?.id ? pack.clinic.id : ''
    );

    const [dispenseModes, packagedDrugsList, clinics] = await Promise.all([
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      packagedDrugService.getAllByIDsFromDexie(packsId),
      clinicService.getAllByIDsFromDexie(clinicIds),
    ]);
    packs.map((pack: any) => {
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode.id
      );
      pack.packagedDrugs = packagedDrugsList.filter(
        (packagedDrugs: any) =>
          packagedDrugs?.pack?.id === pack.id ||
          packagedDrugs.pack_id === pack.id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic.id);
    });
    return packs;
  },

  async getAllActivePatientByEndDateFromDexie(startDate: any, endDate: any) {
    const packs = await packDexie
      .where('pickupDate')
      .belowOrEqual(endDate)
      .and((item: any) => item.nextPickUpDate >= endDate)
      .reverse()
      .sortBy('pickupDate');

    const packIds = packs.map((pack: any) => pack.id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    if (isMobile.value && !isOnline.value) {
      upsertPackCache(packs);
      return packs.map((entry: any) => clone(entry));
    }
    return packs;
  },
  async getAllExpectedPacksByStartDateAndEndDateFromDexie(
    startDate: any,
    endDate: any
  ) {
    const packs = await packDexie
      .where('nextPickUpDate')
      .between(startDate, endDate, true, true)
      .reverse()
      .sortBy('pickupDate');

    const packIds = packs.map((pack: any) => (pack?.id ? pack.id : ''));
    const clinicIds = packs.map((pack: any) =>
      pack?.clinic?.id ? pack.clinic.id : ''
    );
    const dispenseModeIds = packs.map((pack: any) =>
      pack?.dispenseMode?.id ? pack.dispenseMode.id : ''
    );

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode.id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic.id);
    });
    return packs;
  },
  async getPacksByIDsFromDexie(ids: []) {
    const results = await packDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .reverse()
      .sortBy('pickupDate');
    if (isMobile.value && !isOnline.value) {
      upsertPackCache(results);
      return results.map((entry: any) => clone(entry));
    }
    pack.save(results);
    return results;
  },
  async getAllAbsentPacksByStartDateAndEndDateFromDexie(
    startDate: any,
    endDate: any,
    listPatientLastPack: []
  ) {
    const packs = await packDexie
      .where('nextPickUpDate')
      .belowOrEqual(
        moment(startDate, 'YYYY-MM-DD').add(3, 'days').format('YYYY-MM-DD')
      )
      .and(
        (item: any) =>
          moment(endDate).diff(moment(item.nextPickUpDate), 'days') > 3 &&
          moment(endDate).diff(moment(item.nextPickUpDate), 'days') < 60 &&
          listPatientLastPack.find((pack: any) => pack.id === item.id)
      )
      .reverse()
      .sortBy('pickupDate');

    const packIds = packs.map((pack: any) => pack.id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    return packs;
  },
  async getAllPatientsLastPackForTARVFromDexie() {
    const packList: any[] = [];
    const [patients] = await Promise.all([
      patientService.getAllPatientstWithAllFromDexie(),
    ]);
    patients.map((patient: any) => {
      const identifierList = patient.identifiers;
      const lastPack = [];
      let episodeList = [];
      let lastPatinetVisitDetailsPacks: any[] = [];

      if (identifierList.length > 0) {
        for (const identifier of identifierList) {
          if (identifier.service.code === 'TARV') {
            episodeList = identifier.episodes;
          }
        }
      }

      if (episodeList.length > 0) {
        for (const episode of episodeList) {
          if (episode.patientVisitDetails.length > 0) {
            lastPatinetVisitDetailsPacks = episode.patientVisitDetails;
            break;
          }
        }
      }

      for (const patientVisitdetails of lastPatinetVisitDetailsPacks) {
        if (lastPack.length > 0) {
          if (lastPack[0].pickupDate < patientVisitdetails?.pack?.pickupDate) {
            lastPack.pop();
            lastPack.push(patientVisitdetails?.pack);
          }
        } else {
          lastPack.push(patientVisitdetails?.pack);
        }
      }
      packList.push(lastPack[0].id);
    });

    const rows = await packDexie
      .where('id')
      .anyOfIgnoreCase(packList)
      .toArray();
    if (isMobile.value && !isOnline.value) {
      upsertPackCache(rows);
      return rows.map((entry: any) => clone(entry));
    }
    return rows;
  },
  deleteAllFromDexie() {
    packMobileCache = [];
    packDexie.clear();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshPackMobileCache();
  },
};

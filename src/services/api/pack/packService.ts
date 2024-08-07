import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Pack from 'src/stores/models/packaging/Pack';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import ChunkArray from 'src/utils/ChunkArray';

const pack = useRepo(Pack);
const packDexie = Pack.entity;

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

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
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('pack', params)
      .then((resp) => {
        pack.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pack?offset=' + offset + '&max=100')
        .then((resp) => {
          pack.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
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
        pack.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('pack/' + uuid)
      .then(() => {
        pack.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[packDexie].add(JSON.parse(JSON.stringify(params))).then(() => {
      pack.save(JSON.parse(JSON.stringify(params)));
    });
  },
  putMobile(params: string) {
    return db[packDexie].put(JSON.parse(JSON.stringify(params))).then(() => {
      pack.save(JSON.parse(JSON.stringify(params)));
    });
  },
  getMobile() {
    return db[packDexie]
      .toArray()
      .then((rows: any) => {
        pack.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[packDexie]
      .delete(paramsId)
      .then(() => {
        pack.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[packDexie]
      .bulkPut(params)
      .then(() => {
        pack.save(params);
      })
      .catch((error: any) => {
        console.log(error);
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
        this.addMobile(resp.data);
        pack.save(resp.data);
      });
  },
  async apiGetByPatientId(patientid: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api()
        .get('pack/patient/' + patientid)
        .then((resp) => {
          pack.save(resp.data);
        });
    }
  },
  async apiGetAllByPatientId(patientid: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api()
        .get('pack/getAllByPatient/' + patientid)
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
        pack.save(resp.data);
        return resp;
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return pack.getModel().$newInstance();
  },
  getAllFromStorage() {
    return pack.all();
  },
  deleteAllFromStorage() {
    pack.flush();
  },
  removeFromStorage(id: string) {
    return pack.destroy(id);
  },

  getPackByID(Id: string) {
    return pack.query().whereId(Id).first();
  },

  getPackWithsByID(Id: string) {
    return pack
      .query()
      .with('dispenseMode')
      .with('packagedDrugs')
      .whereId(Id)
      .first();
  },

  getLastPackFromPatientVisitAndPrescription(prescriptionId: string) {
    return pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('prescription_id', prescriptionId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },
  getLastPackFromEpisode(episodeId: string) {
    return pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('episode_id', episodeId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },

  getPacksFromPatientId(patientServiceIdentifierid: string) {
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

  getLastPackFromPatientAndDrug(patient: string, drug: string) {
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
    const resp = await db[packDexie].where('id').anyOf(packIds).toArray();

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
    this.addBulkMobile(allPacks);
  },
};

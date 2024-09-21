import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import TherapeuticRegimen from 'src/stores/models/therapeuticRegimen/TherapeuticRegimen';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const therapeuticRegimen = useRepo(TherapeuticRegimen);
const therapeuticRegimenDexie = TherapeuticRegimen.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.addMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('therapeuticRegimen', params);
      therapeuticRegimen.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('therapeuticRegimen?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticRegimen.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  getFromProvincial(offset: number) {
    if (offset >= 0) {
      return api()
        .get('therapeuticRegimen/therapeuticRegimenFromProvicnial/' + offset)
        .then((resp) => {
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromProvincial(offset);
          } else {
            this.get(0);
            alertSucess('Lista actualizada com sucesso');
          }
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('therapeuticRegimen/' + uuid, params);
      therapeuticRegimen.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('therapeuticRegimen/' + uuid);
      therapeuticRegimen.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[therapeuticRegimenDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        therapeuticRegimen.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[therapeuticRegimenDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        therapeuticRegimen.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return db[therapeuticRegimenDexie]
      .toArray()
      .then((rows: any) => {
        therapeuticRegimen.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[therapeuticRegimenDexie]
      .delete(paramsId)
      .then(() => {
        therapeuticRegimen.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[therapeuticRegimenDexie]
      .bulkPut(params)
      .then(() => {
        therapeuticRegimen.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async getInMobileById(id: String) {
    const resp = await db[therapeuticRegimenDexie]
      .where('id')
      .equalsIgnoreCase(id)
      .first();

    ///  patientVisitDetails.save(resp);
    return resp;
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return therapeuticRegimen.getModel().$newInstance();
  },

  getAllTherapeuticalRegimens() {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .with('clinicalService')
      .with('prescriptionDetails')
      .get();
  },

  getAllActiveTherapeuticalRegimens() {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where('active', true)
      .get();
  },

  getActiveTherapeuticalRegimens() {
    return therapeuticRegimen.query().where('active', true).get();
  },

  getAllActiveTherapeuticalRegimensByclinicalService(clinicalServiceId: any) {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where((therapeuticRegimen) => {
        return (
          (therapeuticRegimen.clinical_service_id === clinicalServiceId ||
            therapeuticRegimen.clinicalServiceId === '') &&
          therapeuticRegimen.active === true
        );
      })
      .get();
  },

  getAllTherapeuticalRegimensByclinicalService(clinicalServiceId: any) {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where('clinical_service_id', clinicalServiceId)
      .get();
  },

  getAllTherapeuticalByclinicalService(clinicalServiceId: any) {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
          query.where('clinical_service_id', clinicalServiceId);
        });
      })
      .where('active', true)
      .get();
  },
  getAllActiveTherapeuticalHasNoClinicalService() {
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
      })
      .where((therapeuticRegimen) => {
        return (
          therapeuticRegimen.active &&
          (therapeuticRegimen.clinical_service_id === null ||
            therapeuticRegimen.clinical_service_id === '')
        );
      })
      .get();
  },
  getById(id: string) {
    return therapeuticRegimen
      .query()
      .where((therapeuticRegimen) => {
        return therapeuticRegimen.id === id;
      })
      .first();
  },
};

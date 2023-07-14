import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const patientServiceIdentifier = useRepo(PatientServiceIdentifier);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
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
      this.putMobile(params);
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
      .post('patientServiceIdentifier', params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientServiceIdentifier?offset=' + offset + '&max=100')
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
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
      .patch('patientServiceIdentifier/' + uuid, params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientServiceIdentifier/' + uuid)
      .then(() => {
        patientServiceIdentifier.destroy(uuid);
      });
  },
  // Mobile
  async putMobile(params: string) {
    try {
      await nSQL(PatientServiceIdentifier.entity)
        .query('upsert', params)
        .exec();
      // patientServiceIdentifier.save(JSON.parse(params));
      patientServiceIdentifier.save(params);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getMobile() {
    try {
      const rows = await nSQL(PatientServiceIdentifier.entity)
        .query('select')
        .exec();
      patientServiceIdentifier.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await nSQL(PatientServiceIdentifier.entity)
        .query('delete')
        .where(['id', '=', paramsId])
        .exec();
      patientServiceIdentifier.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async apiSave(identifier: any, isNew: boolean) {
    if (isNew) {
      return await this.post(identifier);
    } else {
      return await this.patch(identifier.id, identifier);
    }
  },

  async apiUpdate(identifier: any) {
    return await this.patch(identifier.id, identifier);
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientServiceIdentifier/${id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/patientServiceIdentifier/clinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },

  async apiGetAllByPatientId(patientId: string, offset: number, max: number) {
    if (isMobile.value && !isOnline.value) {
      return nSQL(PatientServiceIdentifier.value)
        .query('select')
        .where(['patient_id', '=', patientId])
        .exec()
        .then((rows) => {
          patientServiceIdentifier.save(rows);
          return rows
        });
    } else {
      return await api()
        .get(
          '/patientServiceIdentifier/patient/' +
            patientId +
            '?offset=' +
            offset +
            '&max=' +
            max
        )
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
        });
    }
  },
  async syncPatientServiceIdentifier(identifier: any) {
    if (identifier.syncStatus === 'R') await this.apiSave(identifier, true);
    if (identifier.syncStatus === 'U') await this.apiUpdate(identifier);
  },
  async getLocalDbPatientServiceIdentifierToSync() {
    return nSQL(PatientServiceIdentifier.entity)
      .query('select')
      .where([['syncStatus', '=', 'R'], 'OR', ['syncStatus', '=', 'U']])
      .exec()
      .then((result) => {
        return result;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientServiceIdentifier.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientServiceIdentifier.all();
  },
  identifierCurr(id: string, serviceId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .where('id', id)
      .where('service_id', serviceId)
      .first();
  },
  getAllEpisodesByIdentifierId(id: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('episodeType', (query) => {
          query.where('code', 'INICIO');
        });
      })
      .where('id', id)
      .get();
  },

  getAllIdentifierWithInicialEpisodeByPatient(patientId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('episodeType', (query) => {
          query.where('code', 'INICIO');
        });
      })
      .where('patient_id', patientId)
      .get();
  },
  curIdentifierById(id: string) {
    return patientServiceIdentifier.withAllRecursive(2).where('id', id).first();
  },
  localDbGetById (id: string) {
    return nSQL(PatientServiceIdentifier.entity).query('select').where(['id', '=', id]).exec().then(result => {
      return result
    })
   }
};

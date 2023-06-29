import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const patientVisit = useRepo(PatientVisit);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
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
      const resp = await api().post('patientVisit', params);
      patientVisit.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientVisit?offset=' + offset + '&max=100')
        .then((resp) => {
          patientVisit.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('patientVisit/' + uuid, params);
      patientVisit.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('patientVisit/' + uuid);
      patientVisit.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(PatientVisit.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        patientVisit.save(params);
        alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(PatientVisit.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        if (rows.length === 0) {
          api()
            .get('patientVisit?offset=0&max=700')
            .then((resp) => {
              this.putMobile(resp.data);
            });
        } else {
          patientVisit.save(rows);
        }
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(PatientVisit.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        patientVisit.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async apiFetchById(id: string) {
    return await api().get(`/patientVisit/${id}`);
  },

  async apiSave(patientVisit: any) {
    return await this.post(patientVisit);
  },

  async apiUpdate(patientVisit: any) {
    return await this.patch(patientVisit.id, patientVisit);
  },

  async apiRemove(id: string) {
    return await this.delete(id);
  },

  async apiGetAllByPatientId(patientId: string) {
    const resp = await api().get('/patientVisit/patient/' + patientId);
    patientVisit.save(resp.data);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patientVisit/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastWithScreeningOfClinic(
    clinicId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/patientVisit/AllLastWithScreeningOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetLastVisitOfPatient(patientId: string) {
    return await api().get('/patientVisit/getLastVisitOfPatient/' + patientId);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return patientVisit.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientVisit.all();
  },
  saveInStorage(patientVisitParam: any) {
    return patientVisit.save(patientVisitParam);
  },

  getLastFourWithVitalSignByPatientId(patientId: string) {
    return patientVisit
      .withAllRecursive(2)
      .where('patient_id', patientId)
      .limit(4)
      .has('vitalSignsScreenings')
      .orderBy('visitDate', 'desc')
      .get();
  },
  getAllWithVitalSignByPatientId(patientId: string) {
    return patientVisit
      .withAllRecursive(3)
      .where('patient_id', patientId)
      .limit(4)
      .has('vitalSignsScreenings')
      .orderBy('visitDate', 'desc')
      .get();
  },
  getLastFromEpisode(episodeId: string) {
    return patientVisit
      .withAllRecursive(2)
      .whereHas('patientVisitDetails', (query) => {
        query.has('prescription');
        query.where('episode_id', episodeId);
      })
      .orderBy('visitDate', 'desc')
      .first();
  },
  getAllFromPatient(patientId: string) {
    return patientVisit
      .withAll()
      .whereHas('patientVisitDetails', (query) => {
        query.has('prescription');
      })
      .where('patient_id', patientId)
      .orderBy('visitDate', 'desc')
      .get();
  },
};

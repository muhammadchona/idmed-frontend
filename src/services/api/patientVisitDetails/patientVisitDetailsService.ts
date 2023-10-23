import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisitDetails from 'src/stores/models/patientVisitDetails/PatientVisitDetails';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';
import clinicalServiceService from '../clinicalServiceService/clinicalServiceService';

const patientVisitDetails = useRepo(PatientVisitDetails);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
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
      .post('patientVisitDetails', params)
      .then((resp) => {
        patientVisitDetails.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientVisitDetails?offset=' + offset + '&max=100')
        .then((resp) => {
          patientVisitDetails.save(resp.data);
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
      .patch('patientVisitDetails/' + uuid, params)
      .then((resp) => {
        patientVisitDetails.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientVisitDetails/' + uuid)
      .then(() => {
        patientVisitDetails.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(PatientVisitDetails.entity)
      .query('upsert', params)
      .exec()
      .then((resp) => {
        patientVisitDetails.save(resp[0].affectedRows);
      });
  },
  async getMobile() {
    try {
      const rows = await nSQL(PatientVisitDetails.entity)
        .query('select')
        .exec();
      patientVisitDetails.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await nSQL(PatientVisitDetails.entity)
        .query('delete')
        .where(['id', '=', paramsId])
        .exec();
      patientVisitDetails.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async apiFetchById(id: string) {
    return await api().get(`/patientVisitDetails/${id}`);
  },

  async apiSave(patientVisitDetail: any) {
    return await api().post('/patientVisitDetails', patientVisitDetail);
  },

  async apiDelete(patientVisitDetail: any) {
    return await api().delete(`/patientVisitDetails/${patientVisitDetail.id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patientVisitDetails/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/patientVisitDetails/AllLastOfClinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        nSQL(PatientVisitDetails.entity).query('upsert', resp.data).exec();
        patientVisitDetails.save(resp.data);
      });
  },

  async apiGetAllByEpisodeId(episodeId: string, offset: number, max: number) {
    return await api()
      .get(
        '/patientVisitDetails/episode/' +
          episodeId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        patientVisitDetails.save(resp.data);
      });
  },

  async apiGetLastByEpisodeId(episodeId: string) {
    return await api()
      .get('/patientVisitDetails/getLastByEpisodeId/' + episodeId)
      .then((resp) => {
        patientVisitDetails.save(resp.data);
        return resp;
      });
  },

  async apiGetPatientVisitDetailsByPatientId(patientId: string) {
    if (isMobile && !isOnline) {
      this.get(0);
    } else {
      return await api()
        .get('patientVisitDetails/patientId/' + patientId)
        .then((resp) => {
          patientVisitDetails.save(resp.data);
        });
    }
  },

  async apiGetAllofPrecription(prescriptionId: string) {
    return await api()
      .get('/patientVisitDetails/getAllofPrecription/' + prescriptionId)
      .then((resp) => {
        patientVisitDetails.save(resp.data);
        return resp;
      });
  },

  async apiGetAllPatientVisitDetailsByPatientId(patientId: string) {
    return await api()
      .get('/patientVisitDetails/getAllByPatient/' + patientId)
      .then((resp) => {
        console.log(resp.data);
        patientVisitDetails.save(resp.data);
        return resp;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientVisitDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientVisitDetails.all();
  },
  deleteAllFromStorage() {
    patientVisitDetails.flush();
  },
  getLastPatientVisitDetailFromPatientVisit(patientVisitId: string) {
    return patientVisitDetails
      .withAllRecursive(2)
      .has('prescription')
      .where('patient_visit_id', patientVisitId)
      .first();
  },

  getLastPatientVisitDetailFromPatientVisitAndEpisode(
    patientVisitId: string,
    episodeId: string
  ) {
    return patientVisitDetails
      .withAllRecursive(2)
      .has('prescription')
      .where('patient_visit_id', patientVisitId)
      .where('episode_id', episodeId)
      .first();
  },

  getAllPatientVisitDetailsFromEpisode(episodeId: string) {
    return patientVisitDetails
      .has('pack')
      .has('prescription')
      .where('episode_id', episodeId)
      .get();
  },

  getLastPatientVisitDetailsFromEpisode(episodeId: string) {
    return patientVisitDetails
      .withAllRecursive(2)
      .has('pack')
      .has('prescription')
      .where('episode_id', episodeId)
      .first();
  },

  getAllPatientVisitByPrescriptioId(prescriptionId: string) {
    return patientVisitDetails.where('prescription_id', prescriptionId).get();
  },
  getAllPatientVisitByPackId(packId: string) {
    return patientVisitDetails.where('pack_id', packId).get();
  },

  getPatientVisitDetailsByPackId(packId: string) {
    return patientVisitDetails.query().where('pack_id', packId).first();
  },

  getPatientVisitDetailsByPrescriptionId(prescriptionId: string) {
    return patientVisitDetails
      .query()
      .withAll()
      .where('prescription_id', prescriptionId)
      .first();
  },
  getAllWithAllRecursiveFromPatientAndClinicService(
    patientId: string,
    clinicalServiceId: string
  ) {
    return patientVisitDetails
      .query()
      .withAllRecursive(2)
      .whereHas('patientVisit', (query) => {
        query.where('patient_id', patientId);
      })
      .whereHas('episode', (query) => {
        query.whereHas('patientServiceIdentifier', (query) => {
          query.where('service_id', clinicalServiceId);
        });
      })
      .get();
  },
};

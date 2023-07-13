import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Prescription from 'src/stores/models/prescription/Prescription';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { nSQL } from 'nano-sql';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const prescription = useRepo(Prescription);

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
      .post('prescription', params)
      .then((resp) => {
        prescription.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescription?offset=' + offset + '&max=100')
        .then((resp) => {
          prescription.save(resp.data);
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
      .patch('prescription/' + uuid, params)
      .then((resp) => {
        prescription.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('prescription/' + uuid)
      .then(() => {
        prescription.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(Prescription.entity)
      .query('upsert', params)
      .exec()
      .then((resp) => {
        prescription.save(resp[0].affectedRows);
      });
  },
  async getMobile() {
    try {
      const rows = await nSQL(Prescription.entity).query('select').exec();
      prescription.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await nSQL(Prescription.entity)
        .query('delete')
        .where(['id', '=', paramsId])
        .exec();
      prescription.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async apiSave(prescriptionObject: any) {
    return await this.post(prescriptionObject);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/prescription/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/prescription/AllLastOfClinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        nSQL(Prescription.entity).query('upsert', resp.data).exec();
        prescription.save(resp.data);
      });
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/prescription/${id}`)
      .then((resp) => {
        prescription.save(resp.data);
        console.log(resp.data);
        return resp;
      });
  },

  async apiFetchLastByIdentifierId(id: string) {
    return await api().get(`/prescription/identifier/${id}`);
  },
  async apiGetByPatientId(patientid: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api()
        .get('prescription/patient/' + patientid)
        .then((resp) => {
          prescription.save(resp.data);
        });
    }
  },
  async apiFetchByPatientVisitDetailsId(
    pvdsId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/prescription/visits/' + pvdsId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetByClinicId(clinicId: string) {
    return await api().get('/prescription/clinic/' + clinicId);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return prescription.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescription.all();
  },

  getPrescriptionByID(Id: string) {
    return prescription
      .query()
      .with('doctor')
      .with('duration')
      .with('prescriptionDetails')
      .whereId(Id)
      .first();
  },

  getLastPrescriptionFromPatientVisit(patientVisitId: string) {
    return prescription
      .withAllRecursive(2)
      .where('id', patientVisitId)
      .orderBy('prescriptionDate', 'desc')
      .first();
  },

  getLastPrescriptionFromPatientVisitDetails(prescriptionId: string) {
    return prescription
      .withAllRecursive(2)
      .where('id', prescriptionId)
      .orderBy('prescriptionDate', 'desc')
      .first();
  },

  removeFromStorage(prescriptionId: string) {
    return prescription.destroy(prescriptionId);
  },
};

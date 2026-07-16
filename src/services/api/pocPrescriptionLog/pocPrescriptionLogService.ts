import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import PocPrescriptionLog from '../../../stores/models/pocPrescriptionLog/PocPrescriptionLog';

const pocPrescriptionLog = useRepo(PocPrescriptionLog);
const pocPrescriptionLogDexie = db[PocPrescriptionLog.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('pocPrescriptionLog', params);
      pocPrescriptionLog.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pocPrescriptionLog?offset=' + offset + '&max=100')
        .then((resp) => {
          pocPrescriptionLog.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
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
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('pocPrescriptionLog/' + uuid, params);
      pocPrescriptionLog.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('pocPrescriptionLog/' + uuid);
      pocPrescriptionLog.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return pocPrescriptionLogDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        pocPrescriptionLog.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return pocPrescriptionLogDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        pocPrescriptionLog.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return pocPrescriptionLogDexie
      .toArray()
      .then((rows: any) => {
        pocPrescriptionLog.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return pocPrescriptionLogDexie
      .delete(paramsId)
      .then(() => {
        pocPrescriptionLog.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return pocPrescriptionLogDexie
      .bulkPut(params)
      .then(() => {
        pocPrescriptionLog.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiFetchById(id: string) {
    return await api().get(`/pocPrescriptionLog/${id}`);
  },

  async apiGetAllPrescriptionFromPocByPatientId(patientId: string) {
    return await api()
      .get('/prescription/getAllPrescriptionFromPoc/' + patientId)
      .then((resp) => {
        console.log(resp.data);
        pocPrescriptionLog.save(resp.data);
      });
  },

  // Pinia LocalBase
  getLastPrescriptionLogByPatientIdAndClinicalServiceId(
    patientId: string,
    clinicalServiceId: string
  ) {
    return pocPrescriptionLog
      .withAllRecursive(3)
      .where('patient_id', patientId)
      .where('clinical_service_id', clinicalServiceId)
      .orderBy('prescriptionDate', 'desc')
      .first();
  },
  getLastForMobilePrescriptionDisplay(
    patientId: string,
    clinicalServiceId: string
  ) {
    return pocPrescriptionLog
      .query()
      .with('prescription', (prescriptionQuery: any) => {
        prescriptionQuery
          .with('clinic')
          .with('doctor')
          .with('duration')
          .with('prescriptionDetails', (detailsQuery: any) => {
            detailsQuery
              .with('therapeuticRegimen')
              .with('therapeuticLine')
              .with('dispenseType');
          })
          .with('prescribedDrugs', (drugQuery: any) => {
            drugQuery.with('drug');
          });
      })
      .where('patient_id', patientId)
      .where('clinical_service_id', clinicalServiceId)
      .orderBy('prescriptionDate', 'desc')
      .first();
  },
};

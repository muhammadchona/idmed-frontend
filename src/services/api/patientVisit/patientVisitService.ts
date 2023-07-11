import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';
import moment from 'moment';
import dispenseTypeService from '../dispenseType/dispenseTypeService';


const patientVisit = useRepo(PatientVisit);

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
      .post('patientVisit', params)
      .then((resp) => {
        patientVisit.save(resp.data);
      });
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
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('patientVisit/' + uuid, params)
      .then((resp) => {
        patientVisit.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientVisit/' + uuid)
      .then(() => {
        patientVisit.destroy(uuid);
      });
  },
  // Mobile
  async putMobile(params: string) {
    try {
      await nSQL(PatientVisit.entity).query('upsert', params).exec();
      // patientVisit.save(JSON.parse(params));
      params.patientVisitDetails.forEach((rowDetails) => {
        // rowDetails.episode = null;
        // rowDetails.pack = null;
        // rowDetails.prescription = null;
        // rowDetails.clinic = null;
        rowDetails.patientVisit = null;
      });
      patientVisit.save(params);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getMobile() {
    try {
      const rows = await nSQL(PatientVisit.entity).query('select').exec();
      if (rows.length === 0) {
        api()
          .get('patientVisit?offset=0&max=700')
          .then((resp) => {
            this.putMobile(resp.data);
          });
      } else {
        rows.forEach((row) => {
          //   console.log(row);
          //   row.patientVisitDetails = [];
          row.patientVisitDetails.forEach((rowDetails) => {
            // rowDetails.episode = null;
            // rowDetails.pack = null;
            // rowDetails.prescription = null;
            // rowDetails.clinic = null;
            rowDetails.patientVisit = null;
          });
          console.log(row);
          patientVisit.save(row);
        });
        //  patientVisit.save(rows);
      }
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await nSQL(PatientVisit.entity)
        .query('delete')
        .where(['id', '=', paramsId])
        .exec();
      patientVisit.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
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

  async getLocalDbPatientVisitsToSync() {
    return nSQL(PatientVisit.entity)
      .query('select')
      .where([['syncStatus', '=', 'R'], 'OR', ['syncStatus', '=', 'U']])
      .exec()
      .then((result) => {
        return result;
      });
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
  getLastFromPatientVisitList(patientvisitids: any) {
    return patientVisit
      .query()
      .withAllRecursive(2)
      .whereIn('id', patientvisitids)
      .orderBy('visitDate', 'desc')
      .first();
  },
  getPatientVisitById(patientVisitId: string) {
    return patientVisit
      .withAllRecursive(2)
      .where('id', patientVisitId)
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

  // Reports


async getPatientNSql () {
  return nSQL(PatientVisit.entity).query('select').exec().then(result => {
    console.log(result)
    //  return result
    })
 },
 
 async getPatientVIsitNSqlByPatient (patient: any) {
  return nSQL(PatientVisit.entity).query('select').where(['patient[id]', '=', patient.id]).exec().then(result => {
    console.log(result)
    result[0].patientVisitDetails.forEach((pvd) => {
     if (pvd.prescription !== undefined) Prescription.insertOrUpdate({ data: pvd.prescription })
  if (pvd.pack !== undefined) Pack.insertOrUpdate({ data: pvd.pack })
 })
    })
 },
 
 async getVisits () {
 nSQL().onConnected(() => {
   nSQL(PatientVisit.entity).query('select', ['JSON_EXTRACT(patientVisitDetails, "$[*].pack") as pack']).exec().then(result => {
     console.log(result)
   })
  })
 },
 
  async localDbGetPacks () {
 const packList = []
 return nSQL('patientVisits').query('select', ['patientVisitDetails']).exec().then(result => {
   for (const pvd of result) {
      for (const pvdObj of pvd.patientVisitDetails) {
       packList.push(pvdObj.pack)
   }
 }
 return packList
  })
 },
 
  async localDbGetAllPatientVisit () {
   return nSQL('patientVisits').query('select').exec().then(result => {
    console.log('PATIENTVISIT: ', result)
     return result 
    })
   },
 
    async countPacksByDispenseTypeAndServiceOnPeriod (dispenseType: any, service: any, startDate: any, endDate: any) {
     let counter = 0
       return nSQL('patientVisits').query('select').exec().then(result => {
         for (const pv of result) {
           for (const pvd of pv.patientVisitDetails) {
             if (pvd.pack !== undefined) {
             const pickupDate = moment(pvd.pack.pickupDate)
             const dispenseTypeId =  pvd.prescription.prescriptionDetails[0].dispenseType.identifierType
             const codeDispenseType = dispenseTypeService.getById(dispenseTypeId)
             if (pickupDate >= startDate && pickupDate <= endDate && pvd.episode.patientServiceIdentifier.service.id === service && codeDispenseType.code === dispenseType) {
               counter++
             }
           }
           }
       }
       return counter
        })
     }
};

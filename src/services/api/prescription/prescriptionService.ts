import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Prescription from 'src/stores/models/prescription/Prescription';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import db from '../../../stores/dexie';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import ChunkArray from 'src/utils/ChunkArray';
import durationService from '../duration/durationService';
import doctorService from '../doctorService/doctorService';
import clinicService from '../clinicService/clinicService';
import prescriptionDetailsService from '../prescriptionDetails/prescriptionDetailsService';
import prescribedDrugService from '../prescribedDrug/prescribedDrugService';

const prescription = useRepo(Prescription);
const prescriptionDexie = db[Prescription.entity];

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
      return this.deleteMobile(uuid);
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
  addMobile(params: string) {
    return prescriptionDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        prescription.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return prescriptionDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        prescription.save(JSON.parse(JSON.stringify(params)));
      });
  },
  async getMobile() {
    try {
      const rows = await prescriptionDexie.toArray();
      prescription.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await prescriptionDexie.delete(paramsId);
      prescription.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile() {
    const prescriptionFromPinia = this.getAllFromStorageForDexie();

    return prescriptionDexie
      .bulkPut(prescriptionFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
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
        this.addBulkMobile(resp.data);
      });
  },

  async apiGetLastPrecriptionFromPoc(
    patientId: string,
    clinicalServiceId: string
  ) {
    return await api().get(
      '/prescription/lastPrescriptionFromPoc/' +
        patientId +
        '/' +
        clinicalServiceId
    );
  },

  async apiGetAllPrescriptionFromPocByPatientId(patientId: string) {
    return await api().get(
      '/prescription/getAllPrescriptionFromPoc/' + patientId
    );
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/prescription/${id}`)
      .then((resp) => {
        prescription.save(resp.data);
        return resp;
      });
  },

  async getPrescriptionMobileById(id: string) {
    const resp = await prescriptionDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first();
    return resp;
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
  getAllFromStorageForDexie() {
    return prescription
      .makeHidden([
        'clinic',
        'doctor',
        'patientVisitDetails',
        'prescriptionDetails',
        'duration',
        'prescribedDrugs',
        'groupMemberPrescription',
      ])
      .all();
  },
  deleteAllFromStorage() {
    prescription.flush();
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
  getLocalPrescriptionById(Id: string) {
    return prescription.withAllRecursive(2).where('id', Id).first();
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

  async getAllMobileByIds(prescriptionIds: any) {
    const resp = await prescriptionDexie
      .where('id')
      .anyOf(prescriptionIds)
      .toArray();

    prescription.save(resp);
    return resp;
  },

  async getPrescriptionsByIds(prescriptionIds: any) {
    const limit = 100; // Define your limit
    const offset = 0;

    const chunks = ChunkArray.chunkArrayWithOffset(
      prescriptionIds,
      limit,
      offset
    );

    const allPrescriptions = [];

    for (const chunk of chunks) {
      const prescriptions = await api().post(
        '/prescription/getAllByPrescriptionIds/',
        chunk
      );
      allPrescriptions.push(...prescriptions.data);
    }
    this.addBulkMobile(allPrescriptions);
  },

  // Dexie Block
  async getByIdFromDexie(id: string) {
    return prescriptionDexie.get(id);
  },
  async getAllByIDsFromDexie(ids: []) {
    const prescriptions = await prescriptionDexie
      .where('id')
      .anyOf(ids)
      .reverse()
      .sortBy('prescriptionDate');
    const prescriptionsIds = prescriptions.map(
      (prescription: any) => prescription.id
    );
    const durationIds = prescriptions.map(
      (prescription: any) => prescription.duration_id
    );
    const doctorIds = prescriptions.map(
      (prescription: any) => prescription.doctor_id
    );
    const clinicIds = prescriptions.map(
      (prescription: any) => prescription.clinic_id
    );
    const [clinics, durations, doctors, prescriptionDetails, prescribedDrugs] =
      await Promise.all([
        clinicService.getAllByIDsFromDexie(clinicIds),
        durationService.getAllByIDsFromDexie(durationIds),
        doctorService.getAllByIDsFromDexie(doctorIds),
        prescriptionDetailsService.getLastByPrescriprionIdListFromDexie(
          prescriptionsIds
        ),
        prescribedDrugService.getAllByPrescriprionIdListFromDexie(
          prescriptionsIds
        ),
      ]);

    prescriptions.map((prescription: any) => {
      prescription.clinic = clinics.find(
        (clinic: any) => clinic.id === prescription.clinic_id
      );
      prescription.duration = durations.find(
        (duration: any) => duration.id === prescription.duration_id
      );
      prescription.doctor = doctors.find(
        (doctor: any) => doctor.id === prescription.doctor_id
      );
      prescription.prescriptionDetails = prescriptionDetails.filter(
        (prescriptionDetail: any) =>
          prescriptionDetail.prescription_id === prescription.id
      );
      prescription.prescribedDrugs = prescribedDrugs.filter(
        (prescribedDrug: any) =>
          prescribedDrug.prescription_id === prescription.id
      );
    });

    return prescriptions;
  },
  deleteAllFromDexie() {
    prescriptionDexie.clear();
  },
};

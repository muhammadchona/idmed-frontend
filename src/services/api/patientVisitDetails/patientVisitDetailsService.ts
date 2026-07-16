import { patientTransReferenceTypeService } from 'src/services/api/patientTransReferenceServiceType/PatientTransReferenceTypeService';
import PrescriptionDetails from 'src/stores/models/prescriptionDetails/PrescriptionDetail';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisitDetails from 'src/stores/models/patientVisitDetails/PatientVisitDetails';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import dispenseTypeService from '../dispenseType/dispenseTypeService';
import moment from 'moment';
import prescriptionService from '../prescription/prescriptionService';
import clinicService from '../clinicService/clinicService';
import patientService from '../patientService/patientService';
import ChunkArray from 'src/utils/ChunkArray';
import useNotify from 'src/composables/shared/notify/UseNotify';
import episodeService from '../episode/episodeService';
import patientVisitService from '../patientVisit/patientVisitService';
import packService from '../pack/packService';
import { Notify } from 'quasar';
import Episode from 'src/stores/models/episode/Episode';
import Pack from 'src/stores/models/packaging/Pack';
import Prescription from 'src/stores/models/prescription/Prescription';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';

const patientVisitDetails = useRepo(PatientVisitDetails);
const patientVisitDetailsDexie = db[PatientVisitDetails.entity];
const episodeDexie = db[Episode.entity];
const packDexie = db[Pack.entity];
const packagedDrugDexie = db[PackagedDrug.entity];
const prescriptionDexie = db[Prescription.entity];
const prescribedDrugDexie = db[PrescribedDrug.entity];
const prescriptionDetailsDexie = db[PrescriptionDetails.entity];
const patientVisitDexie = db[PatientVisit.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { notifySuccess, notifyInfo, notifyError } = useNotify();
const { isMobile, isOnline } = useSystemUtils();

const prescriptionContextQuery = () =>
  patientVisitDetails
    .query()
    .with('clinic')
    .with('episode', (episodeQuery: any) => {
      episodeQuery
        .with('episodeType')
        .with('startStopReason')
        .with('clinicSector')
        .with('patientServiceIdentifier', (identifierQuery: any) => {
          identifierQuery.with('service');
        });
    })
    .with('prescription', (prescriptionQuery: any) => {
      prescriptionQuery
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
    .with('pack', (packQuery: any) => {
      packQuery.with('dispenseMode').with('packagedDrugs', (drugQuery: any) => {
        drugQuery.with('drug');
      });
    });

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
  async addMobile(params: string) {
    try {
      const patientVisitDetail = await patientVisitDetailsDexie.add(
        JSON.parse(JSON.stringify(params))
      );
      patientVisitDetails.save(params);

      return patientVisitDetail;
    } catch (error) {
      console.error(error);
    }
  },
  putMobile(params: string) {
    return patientVisitDetailsDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientVisitDetails.save(params);
      });
  },
  async getMobile() {
    try {
      const rows = await patientVisitDetailsDexie.toArray();
      patientVisitDetails.save(rows);
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await patientVisitDetailsDexie.delete(paramsId);
      patientVisitDetails.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async addBulkMobile() {
    const patientVisitDetailsFromPinia = this.getAllFromStorageForDexie();
    return patientVisitDetailsDexie
      .bulkPut(patientVisitDetailsFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },

  async getAllMobileByVisitId(visitIds: string[]) {
    try {
      const collection = patientVisitDetailsDexie
        .orderBy('id')
        .reverse()
        .filter(
          (pvd: any) =>
            visitIds.includes(pvd?.patient_visit_id) ||
            visitIds.includes(pvd?.patientVisit?.id)
        );
      const resp = await collection.toArray();
      patientVisitDetails.save(resp);
      return resp;
    } catch (error) {
      console.log(error);
    }
  },

  async getAllMobileByDetailsId(id: string) {
    const resp = await patientVisitDetailsDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first();

    ///  patientVisitDetails.save(resp);
    return resp;
  },

  async countPacksByDispenseTypeAndServiceOnPeriod(
    dispenseType: any,
    service: any,
    startDate: any,
    endDate: any
  ) {
    let counter = 0;
    return patientVisitDetailsDexie
      .toArray()
      .then(async (result: PatientVisitDetails) => {
        for (const pvd of result) {
          if (pvd.pack !== undefined) {
            const pickupDate = moment(pvd.pack.pickupDate).format('YYYY-MM-DD');
            let prescription = pvd.prescription;
            if (prescription !== undefined) {
              if (
                prescription.prescriptionDetails[0].dispenseType === null ||
                prescription.prescriptionDetails[0].dispenseType === undefined
              ) {
                prescription =
                  await prescriptionService.getPrescriptionMobileById(
                    prescription.id
                  );
              }
            }
            const dispenseTypeId =
              prescription.prescriptionDetails.length > 0
                ? prescription.prescriptionDetails[0].dispenseType.id
                : '';
            const codeDispenseType =
              dispenseTypeService.getById(dispenseTypeId);
            if (
              pickupDate >= startDate &&
              pickupDate <= endDate &&
              pvd.episode.patientServiceIdentifier.service.id === service &&
              codeDispenseType.code === dispenseType
            ) {
              counter++;
            }
          }
        }
        return counter;
      });
  },

  async doPatientVisitServiceBySectorGet() {
    try {
      notifyInfo('Carregamento de Dispensas Iniciado');
      showloading();
      const patients = await patientService.getMobile();
      const ids = patients.map((pat: any) => pat.id);
      const clinicSector = clinicService.currClinic();

      const limit = 100; // Define your limit
      const offset = 0; // Define your offset
      let percentage = 0;

      const notif = Notify.create({
        group: false, // required to be updatable
        timeout: 0, // we want to be in control when it gets dismissed
        spinner: true,
        message: 'Carregando dispensas ...',
        caption: '2%',
        color: 'white',
        textColor: 'primary',
      });

      const chunks = ChunkArray.chunkArrayWithOffset(ids, limit, offset);
      // const allVisits = [];
      //const allVisitDetailsIds = [];

      for (const chunk of chunks) {
        percentage = Math.min(100, percentage + Math.floor(Math.random() * 20));
        const episodes: Episode = [];
        const packs: Pack = [];
        const packagedDrugs: PackagedDrug = [];
        const prescriptions: Prescription = [];
        const prescribedDrugs: PrescribedDrug = [];
        const prescriptionDetailsList: PrescriptionDetails = [];
        const patientVisits: PatientVisit = [];

        const listParams = {
          ids: chunk,
          clinicSector: clinicSector,
        };

        await api()
          .post('/patientVisitDetails/getLastAllByPatientIds/', listParams)
          .then(async (resp) => {
            const patientVisitDetailsList: PatientVisitDetails = resp.data;

            if (patientVisitDetailsList.length > 0) {
              await patientVisitDetailsDexie.bulkPut(patientVisitDetailsList);

              patientVisitDetailsList.forEach((pvd: PatientVisitDetails) => {
                episodes.push(pvd.episode);
                packs.push(pvd.pack);
                prescriptions.push(pvd.prescription);
                patientVisits.push(pvd.patientVisit);
              });
            }

            if (packs.length > 0) {
              packs.forEach((pack: Pack) => {
                pack.packagedDrugs.forEach((packagedDrug: PackagedDrug) => {
                  packagedDrugs.push(packagedDrug);
                });
              });
            }

            if (prescriptions.length > 0) {
              prescriptions.forEach((prescription: Prescription) => {
                prescription.prescribedDrugs.forEach(
                  (prescribedDrug: PrescribedDrug) => {
                    prescribedDrugs.push(prescribedDrug);
                  }
                );
                prescription.prescriptionDetails.forEach(
                  (prescriptionDetail: PrescriptionDetails) => {
                    prescriptionDetailsList.push(prescriptionDetail);
                  }
                );
              });
            }

            // patientVisitDetails.save(resp.data);
            notif({
              caption: `${percentage}%`,
            });
          })
          .catch((error) => {
            notif({
              type: 'negative',
              spinner: false,
              message: 'Ocorreu um erro durante o carregamento de dispensas!',
              timeout: 2500, // we will timeout it in 2.5s
              caption: `${percentage}%`,
              color: 'red',
              textColor: 'white',
            });
            throw error;
          });

        await Promise.all([
          episodeDexie.bulkPut(episodes),
          packDexie.bulkPut(packs),
          prescriptionDexie.bulkPut(prescriptions),
          patientVisitDexie.bulkPut(patientVisits),
          packagedDrugDexie.bulkPut(packagedDrugs),
          prescribedDrugDexie.bulkPut(prescribedDrugs),
          prescriptionDetailsDexie.bulkPut(prescriptionDetailsList),
        ]);
      }
      // if we are done...
      percentage = 100;
      notif({
        icon: 'done', // we add an icon
        spinner: false, // we reset the spinner setting so the icon can be displayed
        message: 'Terminado!',
        caption: `${percentage}%`,
        timeout: 2500, // we will timeout it in 2.5s
      });
      closeLoading();
      notifySuccess('Carregamento de Dispensas Terminado');
      return true;
    } catch (error) {
      // Handle any error that occurs during the async operations
      console.error('An error occurred:', error);
      closeLoading();
      notifyError('Ocorreu um erro durante o carregamento de dispensas');
      return false;
    }
  },

  async getLocalDbPatientVisitsPickedUpAtUs(
    service: any,
    startDate: any,
    endDate: any
  ) {
    const patientVisitDetails: PatientVisitDetails = [];
    return patientVisitDetailsDexie.toArray().then(async (result) => {
      for (const pvd of result) {
        if (pvd.pack !== undefined) {
          const pickupDate = moment(pvd.pack.pickupDate).format('YYYY-MM-DD');
          if (
            pickupDate >= startDate &&
            pickupDate <= endDate &&
            pvd.pack.origin !== clinicService.currClinic().id
          ) {
            patientVisitDetails.push(pvd);
          }
        }
      }
      return patientVisitDetails;
    });
  },
  async getLocalDbPatientVisitsExpectedOnDay(
    service: any,
    startDate: any,
    endDate: any
  ) {
    const patientVisitDetails: PatientVisitDetails = [];
    return patientVisitDetailsDexie.toArray().then(async (result) => {
      for (const pvd of result) {
        if (pvd.pack !== undefined) {
          const nexPickUpDate = moment(pvd.pack.nextPickUpDate).format(
            'YYYY-MM-DD'
          );
          if (nexPickUpDate >= startDate && nexPickUpDate <= endDate) {
            patientVisitDetails.push(pvd);
          }
        }
      }
      return patientVisitDetails;
    });
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
        patientVisitDetailsDexie.add(JSON.parse(JSON.stringify(resp.data)));
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
    return await api()
      .get('patientVisitDetails/patientId/' + patientId)
      .then((resp) => {
        patientVisitDetails.save(resp.data);
      });
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

  async getMobileByPatientVisitIds(patientVisitIds: string) {
    const rows = await patientVisitDetailsDexie
      .where('patient_visit_id')
      .anyOf(patientVisitIds);
    patientVisitDetails.save(rows);
    return rows;
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientVisitDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientVisitDetails.all();
  },
  getAllFromStorageForDexie() {
    return patientVisitDetails
      .makeHidden(['pack', 'episode', 'clinic', 'patientVisit', 'prescription'])
      .all();
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

  getPrescriptionContextFromPatientVisitAndEpisode(
    patientVisitId: string,
    episodeId: string
  ) {
    return prescriptionContextQuery()
      .has('prescription')
      .where('patient_visit_id', patientVisitId)
      .where('episode_id', episodeId)
      .first();
  },

  getPrescriptionContextFromPatientVisit(patientVisitId: string) {
    return prescriptionContextQuery()
      .has('prescription')
      .where('patient_visit_id', patientVisitId)
      .first();
  },

  getAllPatientVisitDetailsFromEpisode(episodeId: string) {
    return patientVisitDetails
      .has('pack')
      .has('prescription')
      .where('episode_id', episodeId)
      .get();
  },

  getMobilePrescriptionReferencesFromEpisode(episodeId: string) {
    return patientVisitDetails
      .query()
      .where('episode_id', episodeId)
      .get()
      .filter((details: any) => details.pack_id && details.prescription_id);
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

  hasFromPatientAndClinicService(patientId: string, clinicalServiceId: string) {
    return patientVisitDetails
      .query()
      .whereHas('patientVisit', (query) => {
        query.where('patient_id', patientId);
      })
      .whereHas('episode', (query) => {
        query.whereHas('patientServiceIdentifier', (query) => {
          query.where('service_id', clinicalServiceId);
        });
      })
      .first();
  },

  getLastWithAllRecursiveFromPatientAndClinicService(
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
      .first();
  },

  // Dexie Block
  async getPatientVisitDetailsByPackIdFromDexie(packIds: string[]) {
    const validPackIds = [...new Set(packIds ?? [])].filter(
      (id: any) => typeof id === 'string' && id.length > 0
    );
    const packIdSet = new Set(validPackIds);
    return await patientVisitDetailsDexie
      .filter((detail: any) =>
        packIdSet.has(
          detail?.pack_id ?? detail?.packId ?? detail?.pack?.id ?? ''
        )
      )
      .toArray();
  },
  async getByIdFromDexie(id: string) {
    return patientVisitDetailsDexie.get(id);
  },
  async getAllByIDsFromDexie(ids: []) {
    const validIds = [...new Set(ids ?? [])].filter(
      (id: any) => typeof id === 'string' && id.length > 0
    );
    const patientVisitDetails = await patientVisitDetailsDexie
      .where('id')
      .anyOf(validIds)
      .toArray();

    const getPatientVisitId = (detail: any) =>
      detail?.patient_visit_id ??
      detail?.patientVisitId ??
      detail?.patientVisit?.id;
    const getEpisodeId = (detail: any) =>
      detail?.episode_id ?? detail?.episodeId ?? detail?.episode?.id;
    const getClinicId = (detail: any) =>
      detail?.clinic_id ?? detail?.clinicId ?? detail?.clinic?.id;
    const getPrescriptionId = (detail: any) =>
      detail?.prescription_id ??
      detail?.prescriptionId ??
      detail?.prescription?.id;

    const patientVisitIds = patientVisitDetails.map(getPatientVisitId);
    const episodeIds = patientVisitDetails.map(getEpisodeId);
    const clinicIds = patientVisitDetails.map(getClinicId);
    const prescriptionIds = patientVisitDetails.map(getPrescriptionId);

    const [clinics, episodes, patientVisits, prescriptions] = await Promise.all(
      [
        clinicService.getAllByIDsFromDexie(clinicIds),
        episodeService.getAllByIDsFromDexie(episodeIds),
        patientVisitService.getAllByIDsFromDexie(patientVisitIds),
        prescriptionService.getAllByIDsFromDexie(prescriptionIds),
      ]
    );

    patientVisitDetails.map((patientVisitDetail: any) => {
      patientVisitDetail.clinic =
        clinics.find(
          (clinic: any) => clinic?.id === getClinicId(patientVisitDetail)
        ) ?? patientVisitDetail.clinic;
      patientVisitDetail.episode =
        episodes.find(
          (episode: any) => episode?.id === getEpisodeId(patientVisitDetail)
        ) ?? patientVisitDetail.episode;
      patientVisitDetail.patientVisit =
        patientVisits.find(
          (patientVisit: any) =>
            patientVisit?.id === getPatientVisitId(patientVisitDetail)
        ) ?? patientVisitDetail.patientVisit;
      patientVisitDetail.prescription =
        prescriptions.find(
          (prescription: any) =>
            prescription?.id === getPrescriptionId(patientVisitDetail)
        ) ?? patientVisitDetail.prescription;
    });

    return patientVisitDetails;
  },
  async getAllByIDFullFromDexie(ids: []) {
    const patientVisitDetails = await patientVisitDetailsDexie
      .where('id')
      .anyOf(ids)
      .toArray();

    // const patientVisitIds = patientVisitDetails.map(
    //   (patientVisitDetail: any) => patientVisitDetail.patient_visit_id
    // );

    const episodeIds = patientVisitDetails.map((patientVisitDetail: any) =>
      patientVisitDetail?.episode?.id ? patientVisitDetail.episode.id : ''
    );

    const clinicIds = patientVisitDetails.map((patientVisitDetail: any) =>
      patientVisitDetail?.clinic?.id ? patientVisitDetail.clinic.id : ''
    );

    const prescriptionIds = patientVisitDetails.map((patientVisitDetail: any) =>
      patientVisitDetail?.prescription?.id
        ? patientVisitDetail.prescription.id
        : ''
    );

    const packIds = patientVisitDetails.map((patientVisitDetail: any) =>
      patientVisitDetail?.pack?.id ? patientVisitDetail.pack.id : ''
    );

    const [clinics, episodes, prescriptions, packs] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      episodeService.getAllByIDsFromDexie(episodeIds),
      prescriptionService.getAllByIDsFromDexie(prescriptionIds),
      packService.getAllByIDsFromDexie(packIds),
    ]);

    patientVisitDetails.map((patientVisitDetail: any) => {
      patientVisitDetail.clinic = clinics.find(
        (clinic: any) => clinic?.id === patientVisitDetail?.clinic?.id
      );
      patientVisitDetail.episode = episodes.find(
        (episode: any) => episode?.id === patientVisitDetail?.episode?.id
      );
      patientVisitDetail.prescription = prescriptions.find(
        (prescription: any) =>
          prescription?.id === patientVisitDetail?.prescription?.id
      );
      patientVisitDetail.pack = packs.find(
        (pack: any) => pack?.id === patientVisitDetail?.pack?.id
      );
    });

    return patientVisitDetails;
  },

  async getAllByPatientVisitIdsFromDexie(ids: string[]) {
    try {
      const collection = patientVisitDetailsDexie.filter(
        (pvd: any) =>
          ids.includes(pvd?.patient_visit_id) ||
          ids.includes(pvd?.patientVisit?.id)
      );
      const patientVisitDetailsItems = await collection.toArray();

      const episodeIds = patientVisitDetailsItems.map(
        (patientVisitDetail: any) =>
          patientVisitDetail?.episode?.id
            ? patientVisitDetail.episode.id
            : patientVisitDetail?.episode_id
            ? patientVisitDetail.episode_id
            : ''
      );

      const clinicIds = patientVisitDetailsItems.map(
        (patientVisitDetail: any) =>
          patientVisitDetail?.clinic?.id
            ? patientVisitDetail.clinic.id
            : patientVisitDetail?.clinic_id
            ? patientVisitDetail.clinic_id
            : ''
      );

      const prescriptionIds = patientVisitDetailsItems.map(
        (patientVisitDetail: any) =>
          patientVisitDetail?.prescription?.id
            ? patientVisitDetail.prescription.id
            : patientVisitDetail?.prescription_id
            ? patientVisitDetail.prescription_id
            : ''
      );

      const packIds = patientVisitDetailsItems.map((patientVisitDetail: any) =>
        patientVisitDetail?.pack?.id
          ? patientVisitDetail.pack.id
          : patientVisitDetail?.pack_id
          ? patientVisitDetail.pack_id
          : ''
      );

      const [clinics, episodes, prescriptions, packs] = await Promise.all([
        clinicService.getAllByIDsFromDexie(clinicIds),
        episodeService.getAllByIDsFromDexie(episodeIds),
        prescriptionService.getAllByIDsFromDexie(prescriptionIds),
        packService.getAllByIDsFromDexie(packIds),
      ]);
      patientVisitDetailsItems.map((patientVisitDetail: any) => {
        patientVisitDetail.clinic = clinics.find(
          (clinic: any) =>
            clinic?.id === patientVisitDetail?.clinic_id ||
            clinic?.id === patientVisitDetail?.clinic?.id
        );
        patientVisitDetail.episode = episodes.find(
          (episode: any) =>
            episode?.id === patientVisitDetail?.episode_id ||
            episode?.id === patientVisitDetail?.episode?.id
        );
        patientVisitDetail.prescription = prescriptions.find(
          (prescription: any) =>
            prescription?.id === patientVisitDetail?.prescription_id ||
            prescription?.id === patientVisitDetail?.prescription?.id
        );
        patientVisitDetail.pack = packs.find(
          (pack: any) =>
            pack?.id === patientVisitDetail?.pack_id ||
            pack?.id === patientVisitDetail?.pack?.id
        );
      });
      patientVisitDetails.save(patientVisitDetailsItems);

      return patientVisitDetailsItems;
    } catch (error) {
      console.log(error);
    }
  },
  async getAllByEpisodeIDsFromDexie(ids: string[]) {
    const collection = patientVisitDetailsDexie.filter(
      (patientVisitDetails: PatientVisitDetails) =>
        ids.includes(patientVisitDetails?.episode?.id)
    );
    const patientVisitDetailsItem = await collection.toArray();

    const patientVisitIds = patientVisitDetailsItem.map(
      (patientVisitDetail: any) =>
        patientVisitDetail?.patientVisit?.id
          ? patientVisitDetail.patientVisit.id
          : ''
    );

    const packIds = patientVisitDetailsItem.map((patientVisitDetail: any) =>
      patientVisitDetail?.pack?.id ? patientVisitDetail.pack.id : ''
    );

    const clinicIds = patientVisitDetailsItem.map((patientVisitDetail: any) =>
      patientVisitDetail?.clinic?.id ? patientVisitDetail.clinic.id : ''
    );

    const prescriptionIds = patientVisitDetailsItem.map(
      (patientVisitDetail: any) =>
        patientVisitDetail?.prescription?.id
          ? patientVisitDetail.prescription.id
          : ''
    );

    const [clinics, packs, patientVisits, prescriptions] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      packService.getAllByIDsFromDexie(packIds),
      patientVisitService.getAllByIDsNoRelationsFromDexie(patientVisitIds),
      prescriptionService.getAllByIDsFromDexie(prescriptionIds),
    ]);

    patientVisitDetailsItem.map((patientVisitDetail: any) => {
      patientVisitDetail.clinic = clinics.find(
        (clinic: any) => clinic?.id === patientVisitDetail?.clinic?.id
      );
      patientVisitDetail.pack = packs.find(
        (pack: any) => pack?.id === patientVisitDetail?.pack?.id
      );
      patientVisitDetail.patientVisit = patientVisits.find(
        (patientVisit: any) =>
          patientVisit?.id === patientVisitDetail?.patientVisit?.id
      );
      patientVisitDetail.prescription = prescriptions.find(
        (prescription: any) =>
          prescription?.id === patientVisitDetail?.prescription?.id
      );
    });

    return patientVisitDetailsItem;
  },
  deleteAllFromDexie() {
    patientVisitDetailsDexie.clear();
  },
};

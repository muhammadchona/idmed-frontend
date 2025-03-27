import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import moment from 'moment';
import dispenseTypeService from '../dispenseType/dispenseTypeService';
import patientService from '../patientService/patientService';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import clinicService from '../clinicService/clinicService';
import ChunkArray from 'src/utils/ChunkArray';
import useNotify from 'src/composables/shared/notify/UseNotify';
import StockService from '../stockService/StockService';
import packService from '../pack/packService';
import packagedDrugService from '../packagedDrug/packagedDrugService';
import packagedDrugStockService from '../packagedDrugStock/packagedDrugStockService';
import vitalSignsScreeningService from '../vitalSignsScreening/vitalSignsScreeningService';
import pregnancyScreeningService from '../pregnancyScreening/pregnancyScreeningService';
import rAMScreeningService from '../rAMScreening/rAMScreeningService';
import tBScreeningService from '../tBScreening/tBScreeningService';
import adherenceScreeningService from '../adherenceScreening/adherenceScreeningService';
import prescribedDrugService from '../prescribedDrug/prescribedDrugService';
import prescriptionService from '../prescription/prescriptionService';
import prescriptionDetailsService from '../prescriptionDetails/prescriptionDetailsService';
import { Notify } from 'quasar';
const patientVisit = useRepo(PatientVisit);
const patientVisitDexie = db[PatientVisit.entity];

const { showloading, closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { notifySuccess, notifyInfo, notifyError } = useNotify();

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
      return this.deleteMobile(uuid);
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
  addMobile(params: any) {
    params.syncStatus = 'R';
    return patientVisitDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        params.patientVisitDetails.forEach((pvd: any) => {
          pvd.pack.packagedDrugs.forEach((pcd: any) => {
            pcd.packagedDrugStocks.forEach((pcs: any) => {
              const stock = StockService.getStockById(pcs.stock.id);
              stock.stockMoviment -= pcd.quantitySupplied;
              StockService.patch(stock.id, stock);
              pcs.stock_id = pcs.stock.id;
              pcs.drug_id = pcs.drug.id;
              // pcs.packagedDrug = pcd;
              pcs.packagedDrug_id = pcd.id;
              packagedDrugStockService.addMobile(pcs);
            });
            pvd.pack.dispenseMode_id = pvd.pack.dispenseMode.id;
            packService.addMobile(pvd.pack);
            pcd.pack_id = pvd.pack.id;
            pcd.drug_id = pcd.drug.id;
            packagedDrugService.addMobile(pcd);
          });
          pvd.prescription.prescribedDrugs.forEach((pd: any) => {
            pd.prescription_id = pvd.prescription.id;
            pd.drug_id = pd.drug.id;
            prescribedDrugService.addMobile(pd);
          });

          pvd.prescription.prescriptionDetails.forEach((pds: any) => {
            pds.prescription_id = pvd.prescription.id;
            prescriptionDetailsService.addMobile(pds);
          });

          prescriptionService.addMobile(pvd.prescription);
          patientVisitDetailsService.addMobile(pvd);
        });
        params.vitalSignsScreenings.forEach((vitalSignsScreening: any) => {
          vitalSignsScreening.patient_visit_id = params.id;
          vitalSignsScreeningService.addMobile(vitalSignsScreening);
        });
        params.tbScreenings.forEach((tbScreening: any) => {
          tbScreening.patient_visit_id = params.id;
          tBScreeningService.addMobile(tbScreening);
        });
        params.pregnancyScreenings.forEach((pregnancyScreening: any) => {
          pregnancyScreening.patient_visit_id = params.id;
          pregnancyScreeningService.addMobile(pregnancyScreening);
        });
        params.adherenceScreenings.forEach((adherenceScreening: any) => {
          adherenceScreening.patient_visit_id = params.id;
          adherenceScreeningService.addMobile(adherenceScreening);
        });
        params.ramScreenings.forEach((ramScreening: any) => {
          ramScreening.patient_visit_id = params.id;
          rAMScreeningService.addMobile(ramScreening);
        });
        patientVisit.save(params);
      });
  },
  putMobile(params: any) {
    return patientVisitDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        params.vitalSignsScreenings.forEach((vitalSignsScreening: any) => {
          vitalSignsScreeningService.addMobile(vitalSignsScreening);
        });
        params.tbScreenings.forEach((tbScreening: any) => {
          tBScreeningService.addMobile(tbScreening);
        });
        params.pregnancyScreenings.forEach((pregnancyScreening: any) => {
          pregnancyScreeningService.addMobile(pregnancyScreening);
        });
        params.adherenceScreenings.forEach((adherenceScreening: any) => {
          adherenceScreeningService.addMobile(adherenceScreening);
        });
        params.ramScreenings.forEach((ramScreening: any) => {
          rAMScreeningService.addMobile(ramScreening);
        });
        patientVisit.save(JSON.parse(JSON.stringify(params)));
      });
  },
  async getMobile() {
    const rows = await patientVisitDexie.toArray();
    patientVisit.save(rows);
    return rows;
  },

  async getPatientVisitMobile() {
    const rows = await patientVisitDexie.toArray();
    const records = rows.filter(
      (row: any) =>
        row.syncStatus !== undefined &&
        row.syncStatus !== null &&
        row.syncStatus !== ''
    );

    return records;
  },

  async deleteMobile(paramsId: string) {
    try {
      await patientVisitDexie.delete(paramsId);
      patientVisit.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile() {
    const patientVisitFromPinia = this.getAllFromStorage();
    return patientVisitDexie
      .bulkPut(patientVisitFromPinia)
      .catch((error: any) => {
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
    if (isMobile.value && !isOnline.value) {
      const resp = await patientVisitDexie
        .where('patientId')
        .equalsIgnoreCase(patientId)
        .or('patient_id')
        .equalsIgnoreCase(patientId)
        .toArray();
      patientVisit.save(resp);
      return resp;
    } else {
      const resp = await api().get('/patientVisit/patient/' + patientId);
      patientVisit.save(resp.data);
      return resp.data;
    }
  },

  async apiGetAllPacksByPatientId(patientId: string, serviceCode: string) {
    if (isMobile.value && !isOnline.value) {
      const patientVisits = await patientVisitDexie
        .where('patientId')
        .equalsIgnoreCase(patientId)
        .or('patient_id')
        .equalsIgnoreCase(patientId)
        .toArray();
      patientVisit.save(patientVisits);
      const packs: any[] = [];

      const patientVisitIds = patientVisits.map(
        (patientVisit: any) => patientVisit.id
      );

      const [patientVisitDetails] = await Promise.all([
        patientVisitDetailsService.getAllByPatientVisitIdsFromDexie(
          patientVisitIds
        ),
      ]);

      patientVisitDetails.map((patientVisitDetail: any) => {
        if (
          patientVisitDetail.episode.patientServiceIdentifier.service.code ===
          serviceCode
        ) {
          packs.push(patientVisitDetail.pack);
        }
      });
      return packs;
    }
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
    const patientVisits = await patientVisitDexie
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .toArray();

    const patientVisitIds = patientVisits.map(
      (patientVisit: any) => patientVisit.id
    );

    const patientIds = patientVisits.map(
      (patientVisit: any) => patientVisit.patient_id
    );

    const clinicIds = patientVisits.map(
      (patientVisit: any) => patientVisit.clinic_id
    );

    const [
      clinics,
      patients,
      patientVisitDetails,
      vitalSignsScreenings,
      pregnancyScreenings,
      ramScreenings,
      tbScreenings,
      adherenceScreenings,
    ] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      patientService.getAllByIDsFromDexie(patientIds),
      patientVisitDetailsService.getAllByPatientVisitIdsFromDexie(
        patientVisitIds
      ),
      vitalSignsScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      pregnancyScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      rAMScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      tBScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      adherenceScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
    ]);

    patientVisits.map((patientVisit: any) => {
      patientVisit.clinic = clinics.find(
        (clinic: any) => clinic.id === patientVisit.clinic_id
      );
      patientVisit.patient = patients.find(
        (patient: any) => patient.id === patientVisit.patient_id
      );
      patientVisit.patientVisitDetails = patientVisitDetails.filter(
        (patientVisitDetail: any) =>
          patientVisitDetail.patient_visit_id === patientVisit.id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          vitalSignsScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          pregnancyScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) => ramScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) => tbScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          adherenceScreening.patient_visit_id === patientVisit.id
      );
    });

    return patientVisits;
  },

  async getLocalDbPatientVisitsNotSynced(startDate: any, endDate: any) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .and((item: any) => item.syncStatus === 'R')
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsBetweenDates(startDate: any, endDate: any) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .filter(
        (visit: any) =>
          visit.syncStatus !== null &&
          visit.syncStatus !== undefined &&
          visit.syncStatus !== ''
      )
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsBetweenDatesWithPregnancyScreening(
    startDate: any,
    endDate: any
  ) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .filter((visit: any) => visit.pregnancyScreenings.length > 0)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsBetweenDatesMonitoredForAdherence(
    startDate: any,
    endDate: any
  ) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .filter((visit: any) => visit.tbScreenings.length > 0)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsBetweenDatesWithTBScreening(
    startDate: any,
    endDate: any
  ) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .filter((visit: any) => visit.tbScreenings.length > 0)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },
  async getLocalDbPatientVisitsBetweenDatesWithRAMScreening(
    startDate: any,
    endDate: any
  ) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .filter((visit: any) => visit.ramScreenings.length > 0)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsSyncedAndWithSyncStatusNull() {
    return patientVisitDexie
      .orderBy('visitDate')
      .filter(
        (visit: any) =>
          (visit.syncStatus !== null &&
            visit.syncStatus !== undefined &&
            visit.syncStatus !== '') ||
          visit.syncStatus !== 'S'
      )
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalPatientVisitsBetweenDates(startDate: any, endDate: any) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalOnlyPatientVisitsBetweenDates(startDate: any, endDate: any) {
    return patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .filter(
        (visit: any) =>
          visit.syncStatus !== null &&
          visit.syncStatus !== undefined &&
          visit.syncStatus !== '' &&
          visit.syncStatus !== 'S'
      )
      .toArray()
      .then((result: any) => {
        return result;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientVisit.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientVisit
      .makeHidden([
        'vitalSignsScreenings',
        'pregnancyScreenings',
        'adherenceScreenings',
        'ramScreenings',
        'tbScreenings',
      ])
      .all();
  },
  deleteAllFromStorage() {
    patientVisit.flush();
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

  async getPatientNSql() {
    return patientVisitDexie.toArray().then((result: any) => {
      console.log(result);
      //  return result
    });
  },

  async getPatientVIsitNSqlByPatient(patient: any) {
    return patientVisitDexie
      .where('id')
      .equalsIgnoreCase(patient.id)
      .first()
      .then((result: any) => {
        console.log(result);
        result.patientVisitDetails.forEach((pvd: any) => {
          if (pvd.prescription !== undefined)
            Prescription.insertOrUpdate({ data: pvd.prescription });
          if (pvd.pack !== undefined) Pack.insertOrUpdate({ data: pvd.pack });
        });
      });
  },

  async localDbGetPacks() {
    const packList = [];
    const patientVisitDetails = await patientVisitDexie.toArray();

    const patientVisitDetailIds = patientVisitDetails.map(
      (patientVisitDetail: any) => patientVisitDetail.id
    );

    const [patientVisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getAllByIDFullFromDexie(patientVisitDetailIds),
    ]);

    for (const pvdObj of patientVisitDetailsList) {
      packList.push(pvdObj.pack);
    }
    return packList;
  },

  async localDbGetAllPatientVisit() {
    return patientVisitDexie.toArray().then((result: any) => {
      return result;
    });
  },

  async getAllMobileById(id: string) {
    const resp = await patientVisitDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first();
    return resp;
  },

  async countPacksByDispenseTypeAndServiceOnPeriod(
    dispenseType: any,
    service: any,
    startDate: any,
    endDate: any
  ) {
    let counter = 0;
    return patientVisitDexie.toArray().then((result) => {
      for (const pv of result) {
        for (const pvd of pv.patientVisitDetails) {
          if (pvd.pack !== undefined) {
            const pickupDate = moment(pvd.pack.pickupDate);
            const dispenseTypeId =
              pvd.prescription.prescriptionDetails.length > 0
                ? pvd.prescription.prescriptionDetails[0].dispenseType
                    .identifierType
                : '';
            const codeDispenseType =
              dispenseTypeService.getById(dispenseTypeId);
            if (
              pickupDate >= startDate &&
              pickupDate <= endDate &&
              pvd.episode.patientVisit.service.id === service &&
              codeDispenseType.code === dispenseType
            ) {
              counter++;
            }
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
      console.log(ids);

      const limit = 100; // Define your limit
      const offset = 0; // Define your offset

      const chunks = ChunkArray.chunkArrayWithOffset(ids, limit, offset);
      // const allVisits = [];
      //const allVisitDetailsIds = [];
      for (const chunk of chunks) {
        const listParams = {
          ids: chunk,
          clinicSector: clinicSector,
        };
        // let visitDetails;

        await api()
          .post('/patientVisitDetails/getLastAllByPatientIds/', listParams)
          .then((resp) => {
            patientVisit.save(resp.data);
          });
        // allVisits.push(...visitDetails.data);
      }

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

  removeExistingIds(pvs: any, patientVisits: any) {
    // Create a Set of IDs from patientVisits for faster lookup
    const patientVisitIds = new Set(patientVisits.map((pv) => pv.id));

    // Filter the pvs array to remove objects with IDs present in patientVisitIds
    const filteredPvs = pvs.filter((pv) => !patientVisitIds.has(pv.id));

    return filteredPvs;
  },

  async getPatientVisitWithScreeningByPatientIds(patientIds: any) {
    const limit = 100; // Define your limit
    const offset = 0;

    const chunks = ChunkArray.chunkArrayWithOffset(patientIds, limit, offset);

    const allVisits = [];

    for (const chunk of chunks) {
      await api()
        .post('/patientVisit/getAllLastWithScreeningByPatientIds/', chunk)
        .then((resp) => {
          patientVisit.save(resp.data);
        });

      // allVisits.push(...visitWithScreening.data);
    }

    // this.addBulkMobile(allVisits);
  },
  async getAllLast3VisitsWithScreeningByPatientIds() {
    try {
      notifyInfo('Carregamento de Atencao Farmaceutica Iniciado');
      showloading();
      const patients = await patientService.getMobile();
      const ids = patients.map((pat: any) => pat.id);
      const limit = 100; // Define your limit
      const offset = 0;
      let percentage = 0;

      const notif = Notify.create({
        group: false, // required to be updatable
        timeout: 0, // we want to be in control when it gets dismissed
        spinner: true,
        message: 'Carregando Atenção Farmaceutica ...',
        caption: '2%',
        color: 'white',
        textColor: 'primary',
      });
      const chunks = ChunkArray.chunkArrayWithOffset(ids, limit, offset);

      const allVisits = [];

      for (const chunk of chunks) {
        percentage = Math.min(100, percentage + Math.floor(Math.random() * 20));

        await api()
          .post(
            '/patientVisit/getAllLast3VisitsWithScreeningByPatientIds/',
            chunk
          )
          .then((resp) => {
            patientVisit.save(resp.data);
            notif({
              caption: `${percentage}%`,
            });
          })
          .catch((error) => {
            notif({
              type: 'negative',
              spinner: false,
              message:
                'Ocorreu um erro durante o carregamento de Atenção Farmaceutica!',
              timeout: 2500, // we will timeout it in 2.5s
              caption: `${percentage}%`,
              color: 'red',
              textColor: 'white',
            });
          });

        // allVisits.push(...visitWithScreening.data);
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
      notifySuccess('Carregamento de Atencao Farmaceutica Terminado');
      return true;
      //this.addBulkMobile();
    } catch (error) {
      // Handle any error that occurs during the async operations
      console.error('An error occurred:', error);
      closeLoading();
      notifyError('Ocorreu um erro durante a Atenção Farmaceutica');
      return false;
    }
  },

  setPackagedDrugStockNullToSend(patientVis: any) {
    patientVis.patientVisitDetails.forEach((patientVisitDetail: any) => {
      patientVisitDetail.clinic = {};
      patientVisitDetail.clinic.id = patientVis.clinic_id;
      patientVisitDetail.patientVisit = {};
      patientVisitDetail.patientVisit.id = patientVis.id;
      patientVisitDetail.pack.clinic = {};
      patientVisitDetail.pack.clinic.id = patientVis.clinic_id;

      patientVisitDetail.pack.packagedDrugs.forEach((packagedDrug: any) => {
        const drugID = packagedDrug.drug.id;
        packagedDrug.drug = {};
        packagedDrug.drug.id = drugID;
        packagedDrug.packagedDrugStocks = null;
      });
      patientVisitDetail.prescription.clinic = {};
      patientVisitDetail.prescription.clinic.id = patientVis.clinic_id;

      patientVisitDetail.prescription.prescribedDrugs.forEach(
        (prescribedDrug: any) => {
          const drugID = prescribedDrug.drug.id;
          prescribedDrug.drug = {};
          prescribedDrug.drug.id = drugID;
        }
      );
    });

    return patientVis;
  },

  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    const patientVisits = await patientVisitDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();

    const patientVisitIds = patientVisits.map(
      (patientVisit: any) => patientVisit.id
    );
    const patientIds = patientVisits.map(
      (patientVisit: any) => patientVisit.patient_id
    );

    const clinicIds = patientVisits.map(
      (patientVisit: any) => patientVisit.clinic_id
    );

    const [
      clinics,
      patients,
      vitalSignsScreenings,
      pregnancyScreenings,
      ramScreenings,
      tbScreenings,
      adherenceScreenings,
    ] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      patientService.getAllByIDsFromDexie(patientIds),
      vitalSignsScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      pregnancyScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      rAMScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      tBScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      adherenceScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
    ]);

    patientVisits.map((patientVisit: any) => {
      patientVisit.clinic = clinics.find(
        (clinic: any) => clinic.id === patientVisit.clinic_id
      );
      patientVisit.patient = patients.find(
        (patient: any) => patient.id === patientVisit.patient_id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          vitalSignsScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          pregnancyScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) => ramScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) => tbScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          adherenceScreening.patient_visit_id === patientVisit.id
      );
    });

    return patientVisits;
  },

  async getAllByStartDateAndEndDateFromDexie(startDate: any, endDate: any) {
    const patientVisits = await patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .toArray();

    const patientVisitIds = patientVisits.map(
      (patientVisit: any) => patientVisit.id
    );
    const patientIds = patientVisits.map(
      (patientVisit: any) => patientVisit.patient_id
    );

    const clinicIds = patientVisits.map(
      (patientVisit: any) => patientVisit.clinic_id
    );

    const [
      clinics,
      patients,
      vitalSignsScreenings,
      pregnancyScreenings,
      ramScreenings,
      tbScreenings,
      adherenceScreenings,
    ] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      patientService.getAllByIDsFromDexie(patientIds),
      vitalSignsScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      pregnancyScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      rAMScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      tBScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      adherenceScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
    ]);

    patientVisits.map((patientVisit: any) => {
      patientVisit.clinic = clinics.find(
        (clinic: any) => clinic.id === patientVisit.clinic_id
      );
      patientVisit.patient = patients.find(
        (patient: any) => patient.id === patientVisit.patient_id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          vitalSignsScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          pregnancyScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) => ramScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) => tbScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          adherenceScreening.patient_visit_id === patientVisit.id
      );
    });

    return patientVisits;
  },
  async getAllByPatientIDsFromDexie(ids: []) {
    const patientVisits = await patientVisitDexie
      .where('patient_id')
      .anyOfIgnoreCase(ids)
      .reverse()
      .sortBy('visitDate');

    const patientVisitIds = patientVisits.map(
      (patientVisit: any) => patientVisit.id
    );

    const clinicIds = patientVisits.map(
      (patientVisit: any) => patientVisit.clinic_id
    );

    const [
      clinics,
      vitalSignsScreenings,
      pregnancyScreenings,
      ramScreenings,
      tbScreenings,
      adherenceScreenings,
      patientVisitDetailList,
    ] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      vitalSignsScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      pregnancyScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      rAMScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      tBScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      adherenceScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      patientVisitDetailsService.getAllByPatientVisitIdsFromDexie(
        patientVisitIds
      ),
    ]);

    patientVisits.map((patientVisit: any) => {
      patientVisit.clinic = clinics.find(
        (clinic: any) => clinic.id === patientVisit.clinic_id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          vitalSignsScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          pregnancyScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) => ramScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) => tbScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          adherenceScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.patientVisitDetails = patientVisitDetailList.filter(
        (patientVisitDetail: any) =>
          patientVisitDetail.patient_visit_id === patientVisit.id
      );
    });

    return patientVisits;
  },

  async getAll3LastDataByPatientIDsFromDexie(ids: []) {
    const patientVisits = await patientVisitDexie
      .where('patient_id')
      .anyOfIgnoreCase(ids)
      .reverse()
      .limit(3)
      .sortBy('visitDate');

    const patientVisitIds = patientVisits.map(
      (patientVisit: any) => patientVisit.id
    );

    const clinicIds = patientVisits.map(
      (patientVisit: any) => patientVisit.clinic_id
    );

    const [
      clinics,
      vitalSignsScreenings,
      pregnancyScreenings,
      ramScreenings,
      tbScreenings,
      adherenceScreenings,
      patientVisitDetailList,
    ] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      vitalSignsScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      pregnancyScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      rAMScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      tBScreeningService.getAllByPatientVisitIDsFromDexie(patientVisitIds),
      adherenceScreeningService.getAllByPatientVisitIDsFromDexie(
        patientVisitIds
      ),
      patientVisitDetailsService.getAllByPatientVisitIdsFromDexie(
        patientVisitIds
      ),
    ]);

    patientVisits.map((patientVisit: any) => {
      patientVisit.clinic = clinics.find(
        (clinic: any) => clinic.id === patientVisit.clinic_id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          vitalSignsScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          pregnancyScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) => ramScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) => tbScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          adherenceScreening.patient_visit_id === patientVisit.id
      );
      patientVisit.patientVisitDetails = patientVisitDetailList.filter(
        (patientVisitDetail: any) =>
          patientVisitDetail.patient_visit_id === patientVisit.id
      );
    });

    return patientVisits;
  },

  async getAllByIDsNoRelationsFromDexie(ids: []) {
    return await patientVisitDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  deleteAllFromDexie() {
    patientVisitDexie.clear();
  },
};

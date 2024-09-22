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
import prescriptionService from '../prescription/prescriptionService';
import packService from '../pack/packService';
import patientServiceIdentifierService from '../patientServiceIdentifier/patientServiceIdentifierService';
import episodeService from '../episode/episodeService';
import ChunkArray from 'src/utils/ChunkArray';
import useNotify from 'src/composables/shared/notify/UseNotify';
import StockService from '../stockService/StockService';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import drugService from '../drugService/drugService';
import formService from '../formService/formService';
import clinicalServiceService from '../clinicalServiceService/clinicalServiceService';

const patientVisit = useRepo(PatientVisit);
const patientVisitDexie = PatientVisit.entity;

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

    // params.syncStatus = 'R';
    //return this.addMobile(params);
    // return this.postWeb(params);
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
  addMobile(params: any) {
    params.syncStatus = 'R';
    return db[patientVisitDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        params.patientVisitDetails.forEach((pvd) => {
          pvd.pack.packagedDrugs.forEach((pcd) => {
            pcd.packagedDrugStocks.forEach((pcs) => {
              const stock = StockService.getStockById(pcs.stock.id);
              stock.stockMoviment -= pcd.quantitySupplied;
              //  pcd.packagedDrugStocks.for
              StockService.patch(stock.id, stock);
            });
          });
          patientVisitDetailsService.addMobile(pvd);
        });
        patientVisit.save(params);
      });
  },
  putMobile(params: string) {
    return db[patientVisitDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientVisit.save(JSON.parse(JSON.stringify(params)));
      });
  },
  async getMobile() {
    const rows = await db[patientVisitDexie].toArray();
    patientVisit.save(rows);
    return rows;
  },

  async getPatientVisitMobile() {
    const rows = await db[patientVisitDexie].toArray();
    const records = rows.filter(
      (row) =>
        row.syncStatus !== undefined &&
        row.syncStatus !== null &&
        row.syncStatus !== ''
    );

    return records;
  },

  async deleteMobile(paramsId: string) {
    try {
      await db[patientVisitDexie].delete(paramsId);
      patientVisit.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile(params: any) {
    return db[patientVisitDexie]
      .bulkPut(params)
      .then(() => {
        patientVisit.save(params);
      })
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
      const resp = await db[patientVisitDexie]
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

    //  const resp = await api().get('/patientVisit/patient/' + patientId);
    // patientVisit.save(resp.data);
  },

  async apiGetAllPacksByPatientId(patientId: string, serviceCode: string) {
    if (isMobile.value && !isOnline.value) {
      const resp = await db[patientVisitDexie]
        .where('patientId')
        .equalsIgnoreCase(patientId)
        .or('patient_id')
        .equalsIgnoreCase(patientId)
        .toArray();
      patientVisit.save(resp);
      const packs = [];
      console.log(resp);

      for (const pv of resp) {
        if (pv.patientVisitDetails.length > 0) {
          for (const pvd of pv.patientVisitDetails) {
            const patientVisitDetailsLocal =
              await patientVisitDetailsService.getAllMobileByDetailsId(pvd.id);
            const episode = await episodeService.apiFetchById(
              patientVisitDetailsLocal.episode.id
            );
            const clinicalService =
              clinicalServiceService.getClinicalServicePersonalizedById(
                episode.patientServiceIdentifier.service.id
              );
            if (
              clinicalService !== null &&
              clinicalService.code === serviceCode
            ) {
              for (const pcd of patientVisitDetailsLocal.pack.packagedDrugs) {
                const drugLocal = await drugService.getMobileDrugById(
                  pcd.drug.id
                );
                const formLocal = formService.getFormById(drugLocal.form.id);
                drugLocal.form = formLocal;
                pcd.drug = drugLocal;
                console.log(pcd);
              }
              packs.push(patientVisitDetailsLocal.pack);
            }
          }
        }
      }
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
    return db[patientVisitDexie]
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsNotSynced(startDate: any, endDate: any) {
    return db[patientVisitDexie]
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .and((item: any) => item.syncStatus === 'R')
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsBetweenDates(startDate: any, endDate: any) {
    return db[patientVisitDexie]
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
    return db[patientVisitDexie]
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
    return db[patientVisitDexie]
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
    return db[patientVisitDexie]
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
    return db[patientVisitDexie]
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .filter((visit: any) => visit.ramScreenings.length > 0)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalDbPatientVisitsSyncedAndWithSyncStatusNull() {
    return db[patientVisitDexie]
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
    return db[patientVisitDexie]
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  async getLocalOnlyPatientVisitsBetweenDates(startDate: any, endDate: any) {
    return db[patientVisitDexie]
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
    return patientVisit.all();
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
    return db[patientVisitDexie].toArray().then((result: any) => {
      console.log(result);
      //  return result
    });
  },

  async getPatientVIsitNSqlByPatient(patient: any) {
    return db[patientVisitDexie]
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

  // to check How to do it with Dexie
  /*
  async getVisits() {
    nSQL().onConnected(() => {
      nSQL(PatientVisit.entity)
        .query('select', [
          'JSON_EXTRACT(patientVisitDetails, "$[*].pack") as pack',
        ])
        .exec()
        .then((result) => {
          console.log(result);
        });
    });
  },
*/

  async localDbGetPacks() {
    const packList = [];
    return db[patientVisitDexie].toArray().then((result: any) => {
      for (const pvd of result) {
        for (const pvdObj of pvd.patientVisitDetails) {
          packList.push(pvdObj.pack);
        }
      }
      return packList;
    });
  },

  async localDbGetAllPatientVisit() {
    return db[patientVisitDexie].toArray().then((result: any) => {
      return result;
    });
  },

  async getAllMobileById(id: String) {
    const resp = await db[patientVisitDexie]
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
    return db[patientVisitDexie].toArray().then((result) => {
      for (const pv of result) {
        for (const pvd of pv.patientVisitDetails) {
          if (pvd.pack !== undefined) {
            const pickupDate = moment(pvd.pack.pickupDate);
            const dispenseTypeId =
              pvd.prescription.prescriptionDetails[0].dispenseType
                .identifierType;
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
      const allVisits = [];
      //const allVisitDetailsIds = [];
      for (const chunk of chunks) {
        const listParams = {
          ids: chunk,
          clinicSector: clinicSector,
        };
        let visitDetails;

        visitDetails = await api().post(
          '/patientVisitDetails/getLastAllByPatientIds/',
          listParams
        );
        allVisits.push(...visitDetails.data);
      }

      patientVisitDetailsService.addBulkMobile(allVisits);

      const pvs = allVisits.map((pat: any) => pat.patientVisit);

      const patientVisitOfMobile = await this.getPatientVisitMobile();

      const newPvs = this.removeExistingIds(pvs, patientVisitOfMobile);

      this.addBulkMobile(newPvs);

      const episodeIds = patients.flatMap((data: any) =>
        data.identifiers.flatMap((data1: any) =>
          data1.episodes.map((episode: any) => episode.id)
        )
      );

      const episodes = await episodeService.getEpisodeByIds(episodeIds);
      console.log(episodes);

      /*
      const visitScreening =
        await this.getAllLast3VisitsWithScreeningByPatientIds(ids);
        */

      //  this.addBulkMobile(resp.data);
      closeLoading();
      notifySuccess('Carregamento de Dispensas Terminado');
    } catch (error) {
      // Handle any error that occurs during the async operations
      console.error('An error occurred:', error);
      closeLoading();
      notifyError('Ocorreu um erro durante o carregamento de dispensas');
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
      const visitWithScreening = await api().post(
        '/patientVisit/getAllLastWithScreeningByPatientIds/',
        chunk
      );

      allVisits.push(...visitWithScreening.data);
    }

    this.addBulkMobile(allVisits);
  },

  async getAllLast3VisitsWithScreeningByPatientIds(patientIds: any) {
    const limit = 100; // Define your limit
    const offset = 0;

    const chunks = ChunkArray.chunkArrayWithOffset(patientIds, limit, offset);

    const allVisits = [];

    for (const chunk of chunks) {
      const visitWithScreening = await api().post(
        '/patientVisit/getAllLast3VisitsWithScreeningByPatientIds/',
        chunk
      );

      allVisits.push(...visitWithScreening.data);
    }

    this.addBulkMobile(allVisits);
  },

  setPackagedDrugStockNullToSend(patientVis: any) {
    patientVis.patientVisitDetails.forEach((pvd) => {
      pvd.pack.packagedDrugs.forEach((pcd) => {
        pcd.packagedDrugStocks = null;
      });
    });
    return patientVis;
  },
};

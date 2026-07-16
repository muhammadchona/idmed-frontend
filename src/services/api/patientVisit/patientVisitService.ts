// import { adherenceScreeningService } from 'src/services/api/adherenceScreening/adherenceScreeningService';
// import { patientVisitService } from 'src/services/api/patientVisit/patientVisitService';
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
import PregnancyScreening from 'src/stores/models/screening/PregnancyScreening';
import RAMScreening from 'src/stores/models/screening/RAMScreening';
import TBScreening from 'src/stores/models/screening/TBScreening';
import VitalSignsScreening from 'src/stores/models/screening/VitalSignsScreening';
import AdherenceScreening from 'src/stores/models/screening/AdherenceScreening';
import PatientVisitDetailsModel from 'src/stores/models/patientVisitDetails/PatientVisitDetails';
import Pack from 'src/stores/models/packaging/Pack';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import PackagedDrugStock from 'src/stores/models/packagedDrug/PackagedDrugStock';
import Prescription from 'src/stores/models/prescription/Prescription';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import PrescriptionDetail from 'src/stores/models/prescriptionDetails/PrescriptionDetail';
import Stock from 'src/stores/models/stock/Stock';
const patientVisit = useRepo(PatientVisit);
const stock = useRepo(Stock);
const patientVisitDexie = db[PatientVisit.entity];

const pregnancyScreeningDexie = db[PregnancyScreening.entity];
const rAMScreeningDexie = db[RAMScreening.entity];
const tBScreeningDexie = db[TBScreening.entity];
const vitalSignsScreeningtDexie = db[VitalSignsScreening.entity];
const adherenceScreeningDexie = db[AdherenceScreening.entity];
const patientVisitDetailsDexie = db[PatientVisitDetailsModel.entity];
const packDexie = db[Pack.entity];
const packagedDrugDexie = db[PackagedDrug.entity];
const packagedDrugStockDexie = db[PackagedDrugStock.entity];
const prescriptionDexie = db[Prescription.entity];
const prescribedDrugDexie = db[PrescribedDrug.entity];
const prescriptionDetailsDexie = db[PrescriptionDetail.entity];
const stockDexie = db[Stock.entity];

const { showloading, closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { notifySuccess, notifyInfo, notifyError } = useNotify();

const getScreeningPatientVisitId = (screening: any) =>
  screening?.patient_visit_id ??
  screening?.patientVisitId ??
  screening?.patientVisit?.id ??
  screening?.visit?.id;

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
  async addMobile(params: any) {
    try {
      console.log('Inicia gravacao da Dispensa');
      params.syncStatus = 'R';
      const visitDetails = params.patientVisitDetails ?? [];
      const stockUpdates = new Map<string, any>();

      for (const pvd of visitDetails) {
        const pack = pvd.pack;
        const prescription = pvd.prescription;

        for (const pcd of pack.packagedDrugs ?? []) {
          for (const pcs of pcd.packagedDrugStocks ?? []) {
            const currentStock =
              stockUpdates.get(pcs.stock.id) ??
              StockService.getStockById(pcs.stock.id);
            currentStock.stockMoviment -= pcd.quantitySupplied;
            stockUpdates.set(currentStock.id, currentStock);

            pcs.stock_id = pcs.stock.id;
            pcs.drug_id = pcs.drug.id;
            pcs.packagedDrug_id = pcd.id;
          }
          pcd.pack_id = pack.id;
          pcd.drug_id = pcd.drug.id;
        }

        pack.dispenseMode_id = pack.dispenseMode.id;

        for (const pd of prescription.prescribedDrugs ?? []) {
          pd.prescription_id = prescription.id;
          pd.drug_id = pd.drug.id;
        }
        for (const detail of prescription.prescriptionDetails ?? []) {
          detail.prescription_id = prescription.id;
        }
        prescription.groupMemberPrescription = [];

        pvd.prescription_id = prescription.id;
        pvd.pack_id = pack.id;
      }

      const screeningGroups = [
        params.vitalSignsScreenings ?? [],
        params.tbScreenings ?? [],
        params.pregnancyScreenings ?? [],
        params.adherenceScreenings ?? [],
        params.ramScreenings ?? [],
      ];
      screeningGroups.flat().forEach((screening) => {
        screening.patient_visit_id = params.id;
      });

      const serialized = JSON.parse(JSON.stringify(params));
      const storedVisitDetails = serialized.patientVisitDetails ?? [];
      const storedPacks = storedVisitDetails.map((pvd: any) => pvd.pack);
      const storedPackagedDrugs = storedPacks.flatMap(
        (pack: any) => pack.packagedDrugs ?? []
      );
      const storedPackagedDrugStocks = storedPackagedDrugs.flatMap(
        (packagedDrug: any) => packagedDrug.packagedDrugStocks ?? []
      );
      const storedPrescriptions = storedVisitDetails.map(
        (pvd: any) => pvd.prescription
      );
      const storedPrescribedDrugs = storedPrescriptions.flatMap(
        (prescription: any) => prescription.prescribedDrugs ?? []
      );
      const storedPrescriptionDetails = storedPrescriptions.flatMap(
        (prescription: any) => prescription.prescriptionDetails ?? []
      );
      const serializedStockUpdates = JSON.parse(
        JSON.stringify([...stockUpdates.values()])
      );
      const bulkAddIfAny = (table: any, rows: any[]) =>
        rows.length > 0 ? table.bulkAdd(rows) : Promise.resolve();

      await db.transaction(
        'rw',
        [
          patientVisitDexie,
          patientVisitDetailsDexie,
          packDexie,
          packagedDrugDexie,
          packagedDrugStockDexie,
          prescriptionDexie,
          prescribedDrugDexie,
          prescriptionDetailsDexie,
          stockDexie,
          vitalSignsScreeningtDexie,
          tBScreeningDexie,
          pregnancyScreeningDexie,
          adherenceScreeningDexie,
          rAMScreeningDexie,
        ],
        async () => {
          await patientVisitDexie.add(serialized);
          await Promise.all([
            bulkAddIfAny(patientVisitDetailsDexie, storedVisitDetails),
            bulkAddIfAny(packDexie, storedPacks),
            bulkAddIfAny(packagedDrugDexie, storedPackagedDrugs),
            bulkAddIfAny(packagedDrugStockDexie, storedPackagedDrugStocks),
            bulkAddIfAny(prescriptionDexie, storedPrescriptions),
            bulkAddIfAny(prescribedDrugDexie, storedPrescribedDrugs),
            bulkAddIfAny(prescriptionDetailsDexie, storedPrescriptionDetails),
            bulkAddIfAny(
              vitalSignsScreeningtDexie,
              serialized.vitalSignsScreenings ?? []
            ),
            bulkAddIfAny(tBScreeningDexie, serialized.tbScreenings ?? []),
            bulkAddIfAny(
              pregnancyScreeningDexie,
              serialized.pregnancyScreenings ?? []
            ),
            bulkAddIfAny(
              adherenceScreeningDexie,
              serialized.adherenceScreenings ?? []
            ),
            bulkAddIfAny(rAMScreeningDexie, serialized.ramScreenings ?? []),
            serializedStockUpdates.length > 0
              ? stockDexie.bulkPut(serializedStockUpdates)
              : Promise.resolve(),
          ]);
        }
      );

      if (serializedStockUpdates.length > 0) {
        stock.save(serializedStockUpdates);
      }
      patientVisit.save(serialized);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async savePatientVisitDetails(params: any) {
    for (const pvd of params.patientVisitDetails) {
      await this.savePatientVisitDetailMobile(pvd);
    }
  },

  async savePatientVisitDetailMobile(pvd: any) {
    await this.savePackMobile(pvd.pack);
    await this.savePrescriptionMobile(pvd.prescription);
    pvd.prescription_id = pvd.prescription.id;
    pvd.pack_id = pvd.pack.id;
    await patientVisitDetailsService.addMobile(pvd);
  },

  async savePackMobile(pack: any) {
    for (const pcd of pack.packagedDrugs) {
      for (const pcs of pcd.packagedDrugStocks) {
        const stock = StockService.getStockById(pcs.stock.id);
        stock.stockMoviment -= pcd.quantitySupplied;
        StockService.patch(stock.id, stock);
        pcs.stock_id = pcs.stock.id;
        pcs.drug_id = pcs.drug.id;
        pcs.packagedDrug_id = pcd.id;
        await packagedDrugStockService.addMobile(pcs);
      }
      pcd.pack_id = pack.id;
      pcd.drug_id = pcd.drug.id;
      await packagedDrugService.addMobile(pcd);
    }
    pack.dispenseMode_id = pack.dispenseMode.id;
    await packService.addMobile(pack);
  },

  async savePrescriptionMobile(prescription: any) {
    for (const pd of prescription.prescribedDrugs) {
      pd.prescription_id = prescription.id;
      pd.drug_id = pd.drug.id;
      await prescribedDrugService.addMobile(pd);
    }
    for (const pds of prescription.prescriptionDetails) {
      pds.prescription_id = prescription.id;
      await prescriptionDetailsService.addMobile(pds);
    }
    prescription.groupMemberPrescription = [];
    await prescriptionService.addMobile(prescription);
  },

  // Screenings
  async saveScreeningsMobile(params: any) {
    for (const s of params.vitalSignsScreenings) {
      s.patient_visit_id = params.id;
      await vitalSignsScreeningService.addMobile(s);
    }
    for (const s of params.tbScreenings) {
      s.patient_visit_id = params.id;
      await tBScreeningService.addMobile(s);
    }
    for (const s of params.pregnancyScreenings) {
      s.patient_visit_id = params.id;
      await pregnancyScreeningService.addMobile(s);
    }
    for (const s of params.adherenceScreenings) {
      s.patient_visit_id = params.id;
      await adherenceScreeningService.addMobile(s);
    }
    for (const s of params.ramScreenings) {
      s.patient_visit_id = params.id;
      await rAMScreeningService.addMobile(s);
    }
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
      const patientIds = [];
      patientIds.push(patientId);

      const [patientVisitList] = await Promise.all([
        this.getAllByPatientIDsFromDexie(patientIds),
      ]);

      const resp = patientVisitList;
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
      const collection = patientVisitDexie.filter(
        (patientVisit: PatientVisit) => patientId === patientVisit?.patient?.id
      );
      const episodes = await collection.toArray().then((visits) => {
        patientVisit.save(visits);
        return visits;
      });

      const patientVisits = await collection.toArray();

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
          patientVisitDetail?.episode?.patientServiceIdentifier?.service
            ?.code === serviceCode
        ) {
          packs.push(patientVisitDetail?.pack);
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

    const patientIds = patientVisits.map((patientVisit: any) =>
      patientVisit?.patient?.id
        ? patientVisit.patient.id
        : patientVisit?.patient_id
        ? patientVisit.patient_id
        : ''
    );

    const clinicIds = patientVisits.map((patientVisit: any) =>
      patientVisit?.clinic_id
        ? patientVisit.clinic_id
        : patientVisit?.clinic?.id
        ? patientVisit.clinic.id
        : ''
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
        (clinic: any) =>
          clinic.id === patientVisit?.clinic_id ||
          clinic.id === patientVisit?.clinic?.id
      );
      patientVisit.patient = patients.find(
        (patient: any) =>
          patient.id === patientVisit?.patient_id ||
          patient.id === patientVisit?.patient?.id
      );
      patientVisit.patientVisitDetails = patientVisitDetails.filter(
        (patientVisitDetail: any) =>
          patientVisitDetail?.patient_visit_id === patientVisit?.id ||
          patientVisitDetail?.patientVisit?.id === patientVisit?.id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          getScreeningPatientVisitId(vitalSignsScreening) === patientVisit?.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          getScreeningPatientVisitId(pregnancyScreening) === patientVisit?.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) =>
          getScreeningPatientVisitId(ramScreening) === patientVisit?.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) =>
          getScreeningPatientVisitId(tbScreening) === patientVisit?.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          getScreeningPatientVisitId(adherenceScreening) === patientVisit?.id
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
  getLastFromPatientVisitListWithoutRelations(patientvisitids: any) {
    return patientVisit
      .query()
      .whereIn('id', patientvisitids)
      .orderBy('visitDate', 'desc')
      .first();
  },
  getLastForMobilePrescriptionDisplay(patientvisitids: any) {
    return patientVisit
      .query()
      .with('tbScreenings')
      .with('pregnancyScreenings')
      .with('adherenceScreenings')
      .with('ramScreenings')
      .with('vitalSignsScreenings')
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
    return patientVisitDexie.toArray().then((result: any) => {
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
      // const pregnancyScreenings: PregnancyScreening = [];
      // const ramScreenings: RAMScreening = [];
      // const tbScreenings: TBScreening = [];
      // const vitalSignsScreenings: VitalSignsScreening = [];
      // const adherenceScreenings: AdherenceScreening = [];
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
          .then(async (resp) => {
            const patientVisitsList: PatientVisit = resp.data;
            if (patientVisitsList.length > 0) {
              const screeningWrites: Promise<unknown>[] = [
                patientVisitDexie.bulkPut(patientVisitsList),
              ];

              patientVisitsList.forEach((pv: PatientVisit) => {
                screeningWrites.push(
                  adherenceScreeningDexie.bulkPut(pv.adherenceScreenings ?? []),
                  pregnancyScreeningDexie.bulkPut(pv.pregnancyScreenings ?? []),
                  rAMScreeningDexie.bulkPut(pv.ramScreenings ?? []),
                  tBScreeningDexie.bulkPut(pv.tbScreenings ?? []),
                  vitalSignsScreeningtDexie.bulkPut(
                    pv.vitalSignsScreenings ?? []
                  )
                );
              });

              await Promise.all(screeningWrites);
            }

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
            throw error;
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

  setPackagedDrugStockNullToSend(patientVisOriginal: any) {
    // Deep copy so the stripped payload sent to the backend does not
    // corrupt the original visit, which is written back to Dexie after sync
    const patientVis = JSON.parse(JSON.stringify(patientVisOriginal));
    patientVis.patientVisitDetails.forEach((patientVisitDetail: any) => {
      patientVisitDetail.clinic = {};
      patientVisitDetail.clinic.id = patientVis?.clinic_id;
      patientVisitDetail.patientVisit = {};
      patientVisitDetail.patientVisit.id = patientVis?.id;
      patientVisitDetail.pack.clinic = {};
      patientVisitDetail.pack.clinic.id = patientVis?.clinic_id;

      patientVisitDetail.pack.packagedDrugs.forEach((packagedDrug: any) => {
        const drugID = packagedDrug?.drug?.id;
        packagedDrug.drug = {};
        packagedDrug.drug.id = drugID;
        packagedDrug.packagedDrugStocks = null;
      });
      patientVisitDetail.prescription.clinic = {};
      patientVisitDetail.prescription.clinic.id = patientVis?.clinic_id;

      patientVisitDetail.prescription.prescribedDrugs.forEach(
        (prescribedDrug: any) => {
          const drugID = prescribedDrug?.drug?.id;
          prescribedDrug.drug = {};
          prescribedDrug.drug.id = drugID;
        }
      );
    });

    return patientVis;
  },

  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    const validIds = [
      ...new Set(
        (ids ?? []).filter((id: any) => typeof id === 'string' && id.length > 0)
      ),
    ];
    const patientVisits = await patientVisitDexie
      .where('id')
      .anyOfIgnoreCase(validIds)
      .toArray();

    const patientVisitIds = patientVisits
      .map((patientVisit: any) => patientVisit?.id)
      .filter((id: any) => typeof id === 'string' && id.length > 0);
    const patientIds = patientVisits
      .map(
        (patientVisit: any) =>
          patientVisit?.patient_id ??
          patientVisit?.patientId ??
          patientVisit?.patient?.id
      )
      .filter((id: any) => typeof id === 'string' && id.length > 0);

    const clinicIds = patientVisits
      .map(
        (patientVisit: any) =>
          patientVisit?.clinic_id ??
          patientVisit?.clinicId ??
          patientVisit?.clinic?.id
      )
      .filter((id: any) => typeof id === 'string' && id.length > 0);

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
      const clinicId =
        patientVisit?.clinic_id ??
        patientVisit?.clinicId ??
        patientVisit?.clinic?.id;
      const patientId =
        patientVisit?.patient_id ??
        patientVisit?.patientId ??
        patientVisit?.patient?.id;
      patientVisit.clinic =
        clinics.find((clinic: any) => clinic?.id === clinicId) ??
        patientVisit.clinic;
      patientVisit.patient =
        patients.find((patient: any) => patient?.id === patientId) ??
        patientVisit.patient;
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          getScreeningPatientVisitId(vitalSignsScreening) === patientVisit?.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          getScreeningPatientVisitId(pregnancyScreening) === patientVisit?.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) =>
          getScreeningPatientVisitId(ramScreening) === patientVisit?.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) =>
          getScreeningPatientVisitId(tbScreening) === patientVisit?.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          getScreeningPatientVisitId(adherenceScreening) === patientVisit?.id
      );
    });

    return patientVisits;
  },

  async getAllByStartDateAndEndDateFromDexie(startDate: any, endDate: any) {
    const patientVisits = await patientVisitDexie
      .where('visitDate')
      .between(startDate, endDate, true, true)
      .toArray();

    const validStringIds = (values: any[]) => [
      ...new Set(
        values.filter(
          (value: any) => typeof value === 'string' && value.length > 0
        )
      ),
    ];
    const getPatientId = (patientVisit: any) =>
      patientVisit?.patient_id ??
      patientVisit?.patientId ??
      patientVisit?.patient?.id;
    const getClinicId = (patientVisit: any) =>
      patientVisit?.clinic_id ??
      patientVisit?.clinicId ??
      patientVisit?.clinic?.id;

    const patientVisitIds = validStringIds(
      patientVisits.map((patientVisit: any) => patientVisit?.id)
    );
    const patientIds = validStringIds(patientVisits.map(getPatientId));
    const clinicIds = validStringIds(patientVisits.map(getClinicId));

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
      patientVisit.clinic =
        clinics.find(
          (clinic: any) => clinic?.id === getClinicId(patientVisit)
        ) ?? patientVisit.clinic;
      patientVisit.patient =
        patients.find(
          (patient: any) => patient?.id === getPatientId(patientVisit)
        ) ?? patientVisit.patient;
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          getScreeningPatientVisitId(vitalSignsScreening) === patientVisit?.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          getScreeningPatientVisitId(pregnancyScreening) === patientVisit?.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) =>
          getScreeningPatientVisitId(ramScreening) === patientVisit?.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) =>
          getScreeningPatientVisitId(tbScreening) === patientVisit?.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          getScreeningPatientVisitId(adherenceScreening) === patientVisit?.id
      );
    });

    return patientVisits;
  },
  async getAllByPatientIDsFromDexie(ids: string[]) {
    const collection = patientVisitDexie
      .orderBy('visitDate')
      .reverse()
      .filter((patientVisit: PatientVisit) =>
        ids?.includes(patientVisit?.patient?.id)
      );
    const patientVisits = await collection.toArray();

    const patientVisitIds = patientVisits.map(
      (patientVisit: any) => patientVisit?.id
    );

    const clinicIds = patientVisits.map(
      (patientVisit: any) => patientVisit?.clinic?.id
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
        (clinic: any) => clinic?.id === patientVisit?.clinic?.id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          getScreeningPatientVisitId(vitalSignsScreening) === patientVisit?.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          getScreeningPatientVisitId(pregnancyScreening) === patientVisit?.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) =>
          getScreeningPatientVisitId(ramScreening) === patientVisit?.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) =>
          getScreeningPatientVisitId(tbScreening) === patientVisit?.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          getScreeningPatientVisitId(adherenceScreening) === patientVisit?.id
      );
      patientVisit.patientVisitDetails = patientVisitDetailList.filter(
        (patientVisitDetail: any) =>
          patientVisitDetail?.patientVisit?.id === patientVisit?.id
      );
    });

    return patientVisits;
  },

  async getAll3LastDataByPatientIDsFromDexie(ids: string[]) {
    const collection = patientVisitDexie
      .orderBy('visitDate')
      .reverse()
      .filter((patientVisit: PatientVisit) =>
        ids.includes(patientVisit?.patient?.id)
      );
    const patientVisits = await collection.limit(3).toArray();

    const patientVisitIds = patientVisits.map(
      (patientVisit: any) => patientVisit.id
    );

    const clinicIds = patientVisits.map((patientVisit: any) =>
      patientVisit?.clinic?.id ? patientVisit.clinic.id : ''
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
        (clinic: any) => clinic?.id === patientVisit?.clinic?.id
      );
      patientVisit.vitalSignsScreenings = vitalSignsScreenings.filter(
        (vitalSignsScreening: any) =>
          getScreeningPatientVisitId(vitalSignsScreening) === patientVisit?.id
      );
      patientVisit.pregnancyScreenings = pregnancyScreenings.filter(
        (pregnancyScreening: any) =>
          getScreeningPatientVisitId(pregnancyScreening) === patientVisit?.id
      );
      patientVisit.ramScreenings = ramScreenings.filter(
        (ramScreening: any) =>
          getScreeningPatientVisitId(ramScreening) === patientVisit?.id
      );
      patientVisit.tbScreenings = tbScreenings.filter(
        (tbScreening: any) =>
          getScreeningPatientVisitId(tbScreening) === patientVisit?.id
      );
      patientVisit.adherenceScreenings = adherenceScreenings.filter(
        (adherenceScreening: any) =>
          getScreeningPatientVisitId(adherenceScreening) === patientVisit?.id
      );
      patientVisit.patientVisitDetails = patientVisitDetailList.filter(
        (patientVisitDetail: any) =>
          patientVisitDetail?.patientVisit?.id === patientVisit?.id
      );
    });

    return patientVisits;
  },

  async getAllByIDsNoRelationsFromDexie(ids: []) {
    const validIds = [...new Set(ids ?? [])].filter(
      (id: any) => typeof id === 'string' && id.length > 0
    );
    return await patientVisitDexie
      .where('id')
      .anyOfIgnoreCase(validIds)
      .toArray();
  },
  deleteAllFromDexie() {
    patientVisitDexie.clear();
  },
};

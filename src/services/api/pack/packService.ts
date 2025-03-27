import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Pack from 'src/stores/models/packaging/Pack';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import ChunkArray from 'src/utils/ChunkArray';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import dispenseModeService from '../dispenseMode/dispenseModeService';
import clinicService from '../clinicService/clinicService';
import packagedDrugService from '../packagedDrug/packagedDrugService';
import moment from 'moment';
import patientVisitService from '../patientVisit/patientVisitService';
import patientService from '../patientService/patientService';

const pack = useRepo(Pack);
const packDexie = db[Pack.entity];

const { closeLoading } = useLoading();
const { getMonthsDateOfTheYear, addDays } = useDateUtils();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

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
      .post('pack', params)
      .then((resp) => {
        pack.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pack?offset=' + offset + '&max=100')
        .then((resp) => {
          pack.save(resp.data);
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
      .patch('pack/' + uuid, params)
      .then((resp) => {
        pack.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('pack/' + uuid)
      .then(() => {
        pack.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return packDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      pack.save(JSON.parse(JSON.stringify(params)));
    });
  },
  putMobile(params: string) {
    return packDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      pack.save(JSON.parse(JSON.stringify(params)));
    });
  },
  getMobile() {
    return packDexie
      .toArray()
      .then((rows: any) => {
        pack.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return packDexie
      .delete(paramsId)
      .then(() => {
        pack.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile() {
    const packsFromPinia = this.getAllFromStorageForDexie();
    return packDexie.bulkPut(packsFromPinia).catch((error: any) => {
      console.log(error);
    });
  },
  async apiSave(pack: any) {
    return await api().post('/pack', pack);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/pack/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/pack/AllLastOfClinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        this.addMobile(resp.data);
        pack.save(resp.data);
      });
  },
  async apiGetByPatientId(patientid: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api()
        .get('pack/patient/' + patientid)
        .then((resp) => {
          pack.save(resp.data);
        });
    }
  },
  async apiGetAllByPatientId(patientid: string, serviceCode: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api().get(
        'pack/getAllByPatient/' + patientid + '/' + serviceCode
      );
    }
  },
  async apiGetAllByPatientVisitDetailsId(
    patientVisitDetailsId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/pack/patientVisitDetails/' +
        patientVisitDetailsId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api().get('/pack/prescription/' + prescriptionId);
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/pack/${id}`)
      .then((resp) => {
        pack.save(resp.data);
        return resp;
      });
  },

  async getPackMobileById(id: string) {
    const resp = await packDexie.where('id').equalsIgnoreCase(id).first();
    return resp;
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return pack.getModel().$newInstance();
  },
  getAllFromStorage() {
    return pack.all();
  },
  getAllFromStorageForDexie() {
    return pack
      .makeHidden([
        'clinic',
        'patientVisitDetails',
        'dispenseMode',
        'packagedDrugs',
        'groupPack',
        'syncStatus',
      ])
      .all();
  },
  deleteAllFromStorage() {
    pack.flush();
  },
  removeFromStorage(id: string) {
    return pack.destroy(id);
  },

  getPackByID(Id: string) {
    return pack.query().whereId(Id).first();
  },

  getPackWithsByID(Id: string) {
    return pack
      .query()
      .with('dispenseMode')
      .with('packagedDrugs')
      .whereId(Id)
      .first();
  },

  getLastPackFromPatientVisitAndPrescription(prescriptionId: string) {
    return pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('prescription_id', prescriptionId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },
  getLastPackFromEpisode(episodeId: string) {
    return pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('episode_id', episodeId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },

  getPacksFromPatientId(patientServiceIdentifierid: string) {
    return pack
      .withAllRecursive(2)
      .whereHas('patientVisitDetails', (query) => {
        query.whereHas('episode', (query) => {
          query.where(
            'patientServiceIdentifier_id',
            patientServiceIdentifierid
          );
        });
      })
      .orderBy('pickupDate', 'desc')
      .get();
  },

  getLastPackFromPatientId(patientServiceIdentifierid: string) {
    return pack
      .withAllRecursive(2)
      .whereHas('patientVisitDetails', (query) => {
        query.whereHas('episode', (query) => {
          query.where(
            'patientServiceIdentifier_id',
            patientServiceIdentifierid
          );
        });
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },

  getLastPackFromPatientAndDrug(patient: string, drug: string) {
    const list = pack
      .withAllRecursive(3)
      .whereHas('packagedDrugs', (query) => {
        query.where('drug_id', drug.id);
      })
      .orderBy('pickupDate', 'desc')
      .first();
    if (list != null) {
      const foundPackagedDrug = list.packagedDrugs.find((packagedDrug) => {
        return packagedDrug.drug.id === drug.id;
      });
      return foundPackagedDrug;
    }
  },

  checkIfExistsAnyQuanityRemainForDispense(packagedDrugs: any) {
    let counter = 0;
    for (const pd of packagedDrugs) {
      if (pd.quantityRemain > 0) {
        counter += pd.quantityRemain;
      }
    }
    return counter > 0;
  },

  async getAllMobileByIds(packIds: any) {
    const resp = await packDexie.where('id').anyOf(packIds).toArray();

    pack.save(resp);
    return resp;
  },

  async getPacksByIds(packIds: any) {
    const limit = 100; // Define your limit
    const offset = 0;

    const chunks = ChunkArray.chunkArrayWithOffset(packIds, limit, offset);

    const allPacks = [];

    for (const chunk of chunks) {
      const packs = await api().post('/pack/getAllByPackIds/', chunk);

      allPacks.push(...packs.data);
    }
    // this.addBulkMobile(allPacks);
  },

  async getAllPacksByStartDateAndEndDateFromDexie(
    startDate: any,
    endDate: any
  ) {
    const packs = await packDexie
      .where('pickupDate')
      .between(startDate, endDate, true, true)
      .reverse()
      .sortBy('pickupDate');

    const packIds = packs.map((pack: any) => pack.id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    return packs;
  },

  async getTotalPacksInYear(year: number) {
    const periods = getMonthsDateOfTheYear(year);
    // Map each period to a promise to get packs from Dexie
    return await Promise.all(
      periods.map((period) =>
        this.getAllPacksByStartDateAndEndDateFromDexie(
          period.startDate,
          period.endDate
        )
      )
    );
  },
  // //

  async getAllActivePacksInYear(year: number) {
    const periods = getMonthsDateOfTheYear(year);
    // Map each period to a promise to get packs from Dexie
    const currDate = new Date();
    let endDate = '';
    const startDate = periods[0].startDate;
    periods.map((period) => {
      if (period.month === 12) {
        if (currDate < new Date(period.endDate)) {
          endDate = moment(currDate).format('YYYY-MM-DD');
        } else {
          endDate = period.endDate;
        }
      }
    });

    return await Promise.all([
      this.getAllActivePatientByEndDateFromDexie(startDate, endDate),
    ]);
  },

  async getAllByIDsFromDexie(ids: []) {
    const packs = await packDexie
      .where('id')
      .anyOf(ids)
      .reverse()
      .sortBy('pickupDate');

    const packsId = packs.map((pack: any) => pack.id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);

    const [dispenseModes, packagedDrugsList, clinics] = await Promise.all([
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      packagedDrugService.getAllByIDsFromDexie(packsId),
      clinicService.getAllByIDsFromDexie(clinicIds),
    ]);
    packs.map((pack: any) => {
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.packagedDrugs = packagedDrugsList.filter(
        (packagedDrugs: any) => packagedDrugs.pack_id === pack.id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    return packs;
  },

  async getAllActivePatientByEndDateFromDexie(startDate: any, endDate: any) {
    const packs = await packDexie
      .where('pickupDate')
      .belowOrEqual(endDate)
      .and((item: any) => item.nextPickUpDate >= endDate)
      .reverse()
      .sortBy('pickupDate');

    const packIds = packs.map((pack: any) => pack.id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    return packs;
  },
  async getAllExpectedPacksByStartDateAndEndDateFromDexie(
    startDate: any,
    endDate: any
  ) {
    const packs = await packDexie
      .where('nextPickUpDate')
      .between(startDate, endDate, true, true)
      .reverse()
      .sortBy('pickupDate');

    const packIds = packs.map((pack: any) => pack.id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    return packs;
  },
  async getPacksByIDsFromDexie(ids: []) {
    return await packDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .reverse()
      .sortBy('pickupDate');
  },
  async getAllAbsentPacksByStartDateAndEndDateFromDexie(
    startDate: any,
    endDate: any,
    listPatientLastPack: []
  ) {
    const packs = await packDexie
      .where('nextPickUpDate')
      .belowOrEqual(
        moment(startDate, 'YYYY-MM-DD').add(3, 'days').format('YYYY-MM-DD')
      )
      .and(
        (item: any) =>
          moment(endDate).diff(moment(item.nextPickUpDate), 'days') > 3 &&
          moment(endDate).diff(moment(item.nextPickUpDate), 'days') < 60 &&
          listPatientLastPack.find((pack: any) => pack.id === item.id)
      )
      .reverse()
      .sortBy('pickupDate');

    const packIds = packs.map((pack: any) => pack.id);
    const clinicIds = packs.map((pack: any) => pack.clinic_id);
    const dispenseModeIds = packs.map((pack: any) => pack.dispenseMode_id);

    const [patientvisitDetailsList] = await Promise.all([
      patientVisitDetailsService.getPatientVisitDetailsByPackIdFromDexie(
        packIds
      ),
    ]);

    const patientVisitDetailsIds = patientvisitDetailsList.map(
      (patientvisitDetail: any) => patientvisitDetail.id
    );

    const [clinics, dispenseModes, patientVisitDetails] = await Promise.all([
      clinicService.getAllByIDsFromDexie(clinicIds),
      dispenseModeService.getAllByIDsFromDexie(dispenseModeIds),
      patientVisitDetailsService.getAllByIDsFromDexie(patientVisitDetailsIds),
    ]);

    packs.map((pack: any) => {
      pack.patientvisitDetails = patientVisitDetails.find(
        (patientVisitDetail: any) => patientVisitDetail.pack_id === pack.id
      );
      pack.dispenseMode = dispenseModes.find(
        (dispenseMode: any) => dispenseMode.id === pack.dispenseMode_id
      );
      pack.clinic = clinics.find((clinic: any) => clinic.id === pack.clinic_id);
    });
    return packs;
  },
  async getAllPatientsLastPackForTARVFromDexie() {
    const packList: any[] = [];
    const [patients] = await Promise.all([
      patientService.getAllPatientstWithAllFromDexie(),
    ]);
    patients.map((patient: any) => {
      const identifierList = patient.identifiers;
      const lastPack = [];
      let episodeList = [];
      let lastPatinetVisitDetailsPacks: any[] = [];

      if (identifierList.length > 0) {
        for (const identifier of identifierList) {
          if (identifier.service.code === 'TARV') {
            episodeList = identifier.episodes;
          }
        }
      }

      if (episodeList.length > 0) {
        for (const episode of episodeList) {
          if (episode.patientVisitDetails.length > 0) {
            lastPatinetVisitDetailsPacks = episode.patientVisitDetails;
            break;
          }
        }
      }

      for (const patientVisitdetails of lastPatinetVisitDetailsPacks) {
        if (lastPack.length > 0) {
          if (lastPack[0].pickupDate < patientVisitdetails?.pack?.pickupDate) {
            lastPack.pop();
            lastPack.push(patientVisitdetails?.pack);
          }
        } else {
          lastPack.push(patientVisitdetails?.pack);
        }
      }
      packList.push(lastPack[0].id);
    });

    return await packDexie.where('id').anyOfIgnoreCase(packList).toArray();
  },
  deleteAllFromDexie() {
    packDexie.clear();
  },
};

import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PrescriptionDetails from 'src/stores/models/prescriptionDetails/PrescriptionDetail';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { S } from 'app/src-cordova/platforms/android/app/build/intermediates/assets/release/mergeReleaseAssets/www/assets/systemConfigsService.c9aa92d0';
import therapeuticLineService from '../therapeuticLineService/therapeuticLineService';
import therapeuticalRegimenService from '../therapeuticalRegimenService/therapeuticalRegimenService';
import dispenseTypeService from '../dispenseType/dispenseTypeService';
import spetialPrescriptionMotiveService from '../spetialPrescriptionMotive/spetialPrescriptionMotiveService';
import PrescriptionDetail from 'src/stores/models/prescriptionDetails/PrescriptionDetail';

const prescriptionDetails = useRepo(PrescriptionDetails);
const prescriptionDetailsDexie = db[PrescriptionDetails.entity];

const { closeLoading } = useLoading();
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
      .post('prescriptionDetails', params)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('prescriptionDetails?offset=' + offset + '&max=100')
        .then((resp) => {
          prescriptionDetails.save(resp.data);
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
      .patch('prescriptionDetails/' + uuid, params)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('prescriptionDetails/' + uuid)
      .then(() => {
        prescriptionDetails.destroy(uuid);
      });
  },
  // Mobile
  async addMobile(params: string) {
    try {
      const pd = await prescriptionDetailsDexie.add(
        JSON.parse(JSON.stringify(params))
      );
      prescriptionDetails.save(JSON.parse(JSON.stringify(params)));
      return pd;
    } catch (error) {
      console.error(error);
    }
  },
  putMobile(params: string) {
    return prescriptionDetailsDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        prescriptionDetails.save(JSON.parse(JSON.stringify(params)));
      });
  },

  getMobile() {
    return prescriptionDetailsDexie
      .toArray()
      .then((rows: any) => {
        prescriptionDetails.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return prescriptionDetailsDexie
      .delete(paramsId)
      .then(() => {
        prescriptionDetails.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile() {
    const prescriptionDetailsFromPinia = this.getAllFromStorageForDexie();

    return prescriptionDetailsDexie
      .bulkAdd(prescriptionDetailsFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api()
      .get('/prescriptionDetail/prescription/' + prescriptionId)
      .then((resp) => {
        prescriptionDetails.save(resp.data);
      });
  },

  async apiGetAll() {
    return this.get(0);
  },

  async apiFetchById(id: string) {
    return await api().get(`/prescriptionDetail/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return prescriptionDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    return prescriptionDetails.all();
  },
  getAllFromStorageForDexie() {
    return prescriptionDetails
      .makeHidden([
        'prescription',
        'therapeuticLine',
        'therapeuticRegimen',
        'dispenseType',
        'spetialPrescriptionMotive',
      ])
      .all();
  },
  deleteAllFromStorage() {
    prescriptionDetails.flush();
  },
  getPrescriptionDetailByPrescriptionID(prescriptionID: string) {
    return prescriptionDetails.withAll().where((prescriptionDetails: any) => {
      return prescriptionDetails.prescription_id === prescriptionID;
    });
  },

  getPrescriptionDetailByID(Id: string) {
    return prescriptionDetails
      .withAll()
      .with('therapeuticRegimen', (query: any) => {
        query.withAllRecursive(2);
      })
      .where((prescriptionDetails: any) => {
        return prescriptionDetails.id === Id;
      })
      .first();
  },

  getLastByPrescriprionId(prescriptionId: string) {
    return prescriptionDetails
      .withAllRecursive(1)
      .where('prescription_id', prescriptionId)
      .first();
  },

  // Dexie Block
  async getLastByPrescriprionIdFromDexie(prescriptionId: string) {
    try {
      const collection = prescriptionDetailsDexie.filter(
        (prescriptionDetail: PrescriptionDetail) =>
          prescriptionId === prescriptionDetail?.prescription?.id
      );
      return await collection
        .toArray()
        .then((prescriptionDetailsObject: any) => {
          prescriptionDetails.save(prescriptionDetailsObject);
          return prescriptionDetailsObject;
        });
    } catch (error) {
      console.error(error);
    }
  },

  async getLastByPrescriprionIdListFromDexie(prescriptionIds: string[]) {
    const collection = prescriptionDetailsDexie.filter(
      (prescriptionDetail: PrescriptionDetail) =>
        prescriptionIds.includes(prescriptionDetail?.prescription?.id)
    );
    const prescriptionsDetailsItems = await collection.toArray();

    const therapeuticLineIds = prescriptionsDetailsItems.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.therapeuticLine?.id
          ? prescriptionsDetail.therapeuticLine.id
          : ''
    );
    const therapeuticRegimenIds = prescriptionsDetailsItems.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.therapeuticRegimen?.id
          ? prescriptionsDetail.therapeuticRegimen.id
          : ''
    );
    const dispenseTypeIds = prescriptionsDetailsItems.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.dispenseType?.id
          ? prescriptionsDetail.dispenseType.id
          : ''
    );
    const spetialPrescriptionMotiveIds = prescriptionsDetailsItems.map(
      (prescriptionsDetail: any) =>
        prescriptionsDetail?.spetialPrescriptionMotive?.id
          ? prescriptionsDetail.spetialPrescriptionMotive.id
          : ''
    );

    const [
      therapeuticLines,
      therapeuticRegimens,
      dispenseTypes,
      spetialPrescriptionMotives,
    ] = await Promise.all([
      therapeuticLineService.getAllByIDsFromDexie(therapeuticLineIds),
      therapeuticalRegimenService.getAllByIDsFromDexie(therapeuticRegimenIds),
      dispenseTypeService.getAllByIDsFromDexie(dispenseTypeIds),
      spetialPrescriptionMotiveService.getAllByIDsFromDexie(
        spetialPrescriptionMotiveIds
      ),
    ]);
    prescriptionsDetailsItems.map((prescriptionsDetail: any) => {
      prescriptionsDetail.therapeuticLine = therapeuticLines.find(
        (therapeuticLine: any) =>
          therapeuticLine?.id === prescriptionsDetail?.therapeuticLine?.id
      );
      prescriptionsDetail.therapeuticRegimen = therapeuticRegimens.find(
        (therapeuticRegimen: any) =>
          therapeuticRegimen?.id === prescriptionsDetail?.therapeuticRegimen?.id
      );
      prescriptionsDetail.dispenseType = dispenseTypes.find(
        (dispenseType: any) =>
          dispenseType?.id === prescriptionsDetail?.dispenseType?.id
      );
      prescriptionsDetail.spetialPrescriptionMotive =
        spetialPrescriptionMotives.find(
          (spetialPrescriptionMotive: any) =>
            spetialPrescriptionMotive?.id ===
            prescriptionsDetail?.spetialPrescriptionMotive?.id
        );
      prescriptionDetails.save(prescriptionsDetail);
    });

    return prescriptionsDetailsItems;
  },

  async getAllByIDsFromDexie(ids: []) {
    return await prescriptionDetailsDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },
  deleteAllFromDexie() {
    prescriptionDetailsDexie.clear();
  },
};

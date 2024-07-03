import { useRepo } from 'pinia-orm';
import FacilityType from 'src/stores/models/facilityType/FacilityType';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const facilityType = useRepo(FacilityType);
const facilityTypeDexie = FacilityType.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('facilityType', params);
      facilityType.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('facilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          facilityType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
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
      const resp = await api().patch('facilityType/' + uuid, params);
      facilityType.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('facilityType/' + uuid);
      facilityType.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[facilityTypeDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        facilityType.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[facilityTypeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        facilityType.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return db[facilityTypeDexie]
      .toArray()
      .then((rows: any) => {
        facilityType.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[facilityTypeDexie]
      .delete(paramsId)
      .then(() => {
        facilityType.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[facilityTypeDexie]
      .bulkAdd(params)
      .then(() => {
        facilityType.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  /*Pinia Methods*/
  getAllFacilityTypes() {
    return facilityType.query().get();
  },
  getAllFacilityTypesWithoutUS() {
    return facilityType
      .query()
      .where((query) => {
        return query.code != 'US';
      })
      .get();
  },

  getFacilityTypeClinics() {
    return facilityType
      .query()
      .where((query) => {
        return query.type === 'clinic';
      })
      .get();
  },
  getFacilityTypeClinicSector() {
    return facilityType
      .query()
      .where((query) => {
        return query.type === 'clinic_sector';
      })
      .get();
  },
};

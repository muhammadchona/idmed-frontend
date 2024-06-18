import ClinicalServiceAttribute from 'src/stores/models/ClinicalServiceAttribute/ClinicalServiceAttribute';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const clinicalServiceAttribute = useRepo(ClinicalServiceAttribute);
const clinicalServiceAttributeDexie = ClinicalServiceAttribute.entity;

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.addMobile(params);
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
      const resp = await api().post('clinicalServiceAttribute', params);
      clinicalServiceAttribute.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinicalServiceAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalServiceAttribute.save(resp.data);
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
      const resp = await api().patch(
        'clinicalServiceAttribute/' + uuid,
        params
      );
      clinicalServiceAttribute.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('clinicalServiceAttribute/' + uuid);
      clinicalServiceAttribute.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[clinicalServiceAttributeDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        clinicalServiceAttribute.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[clinicalServiceAttributeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        clinicalServiceAttribute.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return db[clinicalServiceAttributeDexie]
      .toArray()
      .then((rows: any) => {
        clinicalServiceAttribute.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[clinicalServiceAttributeDexie]
      .delete(paramsId)
      .then(() => {
        clinicalServiceAttribute.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return clinicalServiceAttribute.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicalServiceAttrByClinicalService(clinicalServiceId: string) {
    return clinicalServiceAttribute
      .query()
      .with('clinicalServiceAttributeType')
      .where('service_id', clinicalServiceId)
      .get();
  },

  getAllClinicalServiceAttributes() {
    return clinicalServiceAttribute
      .query()
      .with('clinicalServiceAttributeType')
      .get();
  },
  checkWeatherAttExist(clinicalServiceId: string, att: string) {
    const csa = clinicalServiceAttribute
      .where('service_id', clinicalServiceId)
      .whereHas('clinicalServiceAttributeType', (query) => {
        query.where('code', att);
      });
    return csa !== null && csa !== undefined;
  },
};

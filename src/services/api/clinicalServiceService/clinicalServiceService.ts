import { useRepo } from 'pinia-orm';
import ClinicalService from 'src/stores/models/ClinicalService/ClinicalService';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const clinicalService = useRepo(ClinicalService);

const { closeLoading } = useLoading();
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
      const resp = await api().post('clinicalService', params);
      clinicalService.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinicalService?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalService.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('clinicalService/' + uuid, params);
      clinicalService.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('clinicalService/' + uuid);
      clinicalService.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(ClinicalService.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        clinicalService.save(params);
        alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(ClinicalService.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        if (rows.length === 0) {
          api()
            .get('clinicalService?offset=0&max=100')
            .then((resp) => {
              console.log(resp);
              this.putMobile(resp.data);
            });
        } else {
          clinicalService.save(rows);
        }
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(ClinicalService.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        clinicalService.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getByIdentifierTypeCode(identifierTypeCode: string) {
    return clinicalService
      .query()
      .with('identifierType')
      .where('code', identifierTypeCode)
      .first();
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return clinicalService.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicalServices() {
    return clinicalService
      .query()
      .withAllRecursive(2)
      .orderBy('code', 'desc')
      .get();
    // .with('attributes', (query) => {
    //   query.with('clinicalServiceAttributeType');
    // })
    // .with('clinicSectors', (query) => {
    //   query.with('clinicSectorType');
    //   query.with('clinic');
    // })
    // .with('identifierType')
    // .get();
  },

  getbyIdWithSectors(clinicalServiceId: string) {
    return clinicalService
      .query()
      .where('id', clinicalServiceId)
      .with('clinicSectors')
      .first();
  },

  getAllClinicalServicesPersonalized() {
    return clinicalService
      .query()
      .with('attributes', (query) => {
        query.with('clinicalServiceAttributeType');
      })
      .with('clinicSectors')
      .with('identifierType')
      .get();
  },

  getClinicalServicePersonalizedById(clinicalServiceId: string) {
    return clinicalService
      .query()
      .with('attributes', (query) => {
        query.with('clinicalServiceAttributeType');
      })
      .with('clinicSectors')
      .with('identifierType')
      .whereId(clinicalServiceId)
      .get();
  },
};

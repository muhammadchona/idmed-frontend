import { useRepo } from 'pinia-orm';
import ClinicalService from 'src/stores/models/ClinicalService/ClinicalService';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import ClinicalServiceAttribute from 'src/stores/models/ClinicalServiceAttribute/ClinicalServiceAttribute';
import ClinicalServiceSector from 'src/stores/models/ClinicalServiceClinicSector/ClinicalServiceSector';

const clinicalService = useRepo(ClinicalService);
const clinicalServiceAttribute = useRepo(ClinicalServiceAttribute);
const clinicalServiceSector = useRepo(ClinicalServiceSector);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  patch(uuid: string, params: string) {
    clinicalServiceAttribute.where('clinical_service_id', uuid).delete();
    clinicalServiceSector.where('clinical_service_id', uuid).delete();
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
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
  async postWeb(params: string) {
    return api()
      .post('clinicalService/', params)
      .then((resp) => {
        clinicalService.save(resp.data);
      });
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
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('clinicalService/' + uuid, params)
      .then((resp) => {
        clinicalService.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('clinicalService/' + uuid)
      .then(() => {
        clinicalService.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(ClinicalService.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        clinicalService.save(params);
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(ClinicalService.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        clinicalService.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
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
        // alertError('Aconteceu um erro inesperado nesta operação.');
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
  },

  getbyIdWithSectors(clinicalServiceId: string) {
    return clinicalService
      .query()
      .where('id', clinicalServiceId)
      .with('clinicSectors')
      .first();
  },

  getAllClinicalServicesPersonalized() {
    return clinicalService.query().withAllRecursive(2).get();
  },

  getClinicalServicePersonalizedById(clinicalServiceId: string) {
    return clinicalService
      .query()
      .with('clinicSectors')
      .with('identifierType')
      .whereId(clinicalServiceId)
      .get();
  },
};

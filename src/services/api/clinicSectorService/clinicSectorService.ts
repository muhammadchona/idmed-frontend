import { useRepo } from 'pinia-orm';
import ClinicSector from 'src/stores/models/clinicSector/ClinicSector';
import api from '../apiService/apiService';
import { useStorage } from '@vueuse/core';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';
import { v4 as uuidv4 } from 'uuid';

const clinicSector = useRepo(ClinicSector);

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {      
    showloading();
    return api()
      .post('clinicSector', params)
      .then((resp) => {
        clinicSector.save(resp.data);        
        closeLoading();
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinicSector?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicSector.save(resp.data);
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
    showloading();
    return api()
      .patch('clinicSector/' + uuid, params)
      .then((resp) => {
        clinicSector.save(resp.data);
        closeLoading();
      });
  },
  async deleteWeb(uuid: string) {
    return api()
      .delete('clinicSector/' + uuid)
      .then(() => {
        clinicSector.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    showloading();
    return nSQL(clinicSector.use?.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        clinicSector.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    showloading();
    return nSQL(clinicSector.use?.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        clinicSector.save(rows);
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(clinicSector.use?.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        clinicSector.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return clinicSector.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicSectors() {
    return clinicSector.withAll().get();
  },

  getClinicSectorsById(clinicSectorId: string) {
    return clinicSector.withAll().where('id', clinicSectorId).first();
  },

  getClinicSectorsByClinicId(clinicId: string) {
    return clinicSector.query().where('clinic_id', clinicId).get();
  },

  getClinicSectorsByClinicIdSectorTypeId(
    clinicId: string,
    sectorTypeId: string
  ) {
    return clinicSector
      .query()
      .where('clinic_id', clinicId)
      .where('clinic_sector_type_id', sectorTypeId)
      .get();
  },

  getActivebyClinicId(clinicId: string) {
    return clinicSector
      .query()
      .with('clinicSectorType')
      .where((clinicSector) => {
        return clinicSector.active && clinicSector.clinic_id === clinicId;
      })
      .get();
  },
  getActiveUSClinicSectorByClinic(clinicId: string) {
    return clinicSector
      .withAllRecursive(1)
      .where('active', true)
      .where((sector) => {
        return sector.clinic_id === clinicId;
      })
      .whereHas('clinicSectorType', (query) => {
        query.where('code', 'PARAGEM_UNICA').orWhere('code', 'NORMAL');
      })
      .orderBy('code', 'asc')
      .get();
  },
  getClinicSectorByCode(code: string) {
    return clinicSector.query().withAllRecursive(1).where('code', code).first();
  },
  getClinicSectorSlimByCode(code: string) {
    return clinicSector.query().where('code', code).first();
  },
};

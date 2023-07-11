import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Doctor from 'src/stores/models/doctor/Doctor';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const doctor = useRepo(Doctor);
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
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
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
  postWeb(params: string) {
    return api()
      .post('doctor', params)
      .then((resp) => {
        doctor.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('doctor?offset=' + offset + '&max=100')
        .then((resp) => {
          doctor.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('doctor/' + uuid, params)
      .then((resp) => {
        doctor.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('doctor/' + uuid)
      .then(() => {
        doctor.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(Doctor.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        doctor.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(Doctor.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        doctor.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(Doctor.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        doctor.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return doctor.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAlldoctors() {
    return doctor
      .with('clinic', (query) => {
        query.with('province');
        query.with('district');
        query.with('facilityType');
      })
      .orderBy('firstnames')
      .get();
  },
};

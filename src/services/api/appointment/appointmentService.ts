import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Appointment from 'src/stores/models/appointment/Appointment';
import { nSQL } from 'nano-sql';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const appointment = useRepo(Appointment);

const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
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
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('appointment', params)
      .then((resp) => {
        appointment.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('appointment?offset=' + offset + '&max=100')
        .then((resp) => {
          appointment.save(resp.data);
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
      .patch('appointment/' + uuid, params)
      .then((resp) => {
        appointment.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('appointment/' + uuid)
      .then(() => {
        appointment.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(Appointment.entity)
      .query('upsert', params)
      .exec()
      .then((resp) => {
        appointment.save(resp[0].affectedRows);
      });
  },
  getMobile() {
    return nSQL(Appointment.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        appointment.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(Appointment.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        appointment.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return appointment.getModel().$newInstance();
  },
  deleteAllFromStorage() {
    appointment.flush();
  },
  getAllFromStorage() {
    return appointment.all();
  },
};

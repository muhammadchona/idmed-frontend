import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PregnancyScreening from 'src/stores/models/screening/PregnancyScreening';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const pregnancyScreening = useRepo(PregnancyScreening);

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
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
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
      .post('pregnancyScreening', params)
      .then((resp) => {
        pregnancyScreening.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pregnancyScreening?offset=' + offset + '&max=100')
        .then((resp) => {
          pregnancyScreening.save(resp.data);
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
      .patch('pregnancyScreening/' + uuid, params)
      .then((resp) => {
        pregnancyScreening.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('pregnancyScreening/' + uuid)
      .then(() => {
        pregnancyScreening.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(PregnancyScreening.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        pregnancyScreening.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(PregnancyScreening.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        pregnancyScreening.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(PregnancyScreening.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        pregnancyScreening.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/pregnancyScreening?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllByPatientVisitId(
    patientVisitId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/pregnancyScreening/patientVisit/' +
        patientVisitId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return pregnancyScreening.getModel().$newInstance();
  },
  getAllFromStorage() {
    return pregnancyScreening.all();
  },
};

import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import SpetialPrescriptionMotive from 'src/stores/models/prescription/SpetialPrescriptionMotive';
import { useLoading } from 'src/composables/shared/loading/loading';
import { nSQL } from 'nano-sql';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const spetialPrescriptionMotive = useRepo(SpetialPrescriptionMotive);

const { closeLoading, showloading } = useLoading();
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
      .post('spetialPrescriptionMotive', params)
      .then((resp) => {
        spetialPrescriptionMotive.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('spetialPrescriptionMotive?offset=' + offset + '&max=100')
        .then((resp) => {
          spetialPrescriptionMotive.save(resp.data);
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
      .patch('spetialPrescriptionMotive/' + uuid, params)
      .then((resp) => {
        spetialPrescriptionMotive.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('spetialPrescriptionMotive/' + uuid)
      .then(() => {
        spetialPrescriptionMotive.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(SpetialPrescriptionMotive.entity)
      .query('upsert', params)
      .exec()
      .then((resp) => {
        spetialPrescriptionMotive.save(resp[0].affectedRows);
      });
  },
  getMobile() {
    return nSQL(spetialPrescriptionMotive.use?.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        spetialPrescriptionMotive.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(spetialPrescriptionMotive.use?.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        spetialPrescriptionMotive.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  async apiFetchById(id: string) {
    return await api().get(`/spetialPrescriptionMotive/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return spetialPrescriptionMotive.getModel().$newInstance();
  },
  getAllFromStorage() {
    return spetialPrescriptionMotive.all();
  },
};

import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReference from 'src/stores/models/transreference/PatientTransReference';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const patientTransReference = useRepo(PatientTransReference);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
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
  async postWeb(params: string) {
    try {
      const resp = await api().post('patientTransReference', params);
      patientTransReference.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientTransReference?offset=' + offset + '&max=100')
        .then((resp) => {
          patientTransReference.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          alertError('Aconteceu um erro inexperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('patientTransReference/' + uuid, params);
      patientTransReference.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('patientTransReference/' + uuid);
      patientTransReference.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(patientTransReference.use?.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        patientTransReference.save(JSON.parse(params));
        alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(patientTransReference.use?.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        patientTransReference.save(rows);
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(patientTransReference.use?.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        patientTransReference.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/patientTransReference?offset=' + offset + '&max=' + max
    );
  },

  async apiSave(transReference: any) {
    return await api().post('/patientTransReference', transReference);
  },

  async apiRemove(transReference: any) {
    return await api().delete(`/patientTransReference/${transReference.id}`);
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientTransReference/${id}`);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReference.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientTransReference.all();
  },
};

import { useRepo } from 'pinia-orm';
import Form from 'src/stores/models/form/Form';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const form = useRepo(Form);
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
      const resp = await api().post('form', params);
      form.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('form?offset=' + offset + '&max=100')
        .then((resp) => {
          form.save(resp.data);
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
      const resp = await api().patch('form/' + uuid, params);
      form.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('form/' + uuid);
      form.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(form.use?.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        form.save(JSON.parse(params));
        alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(form.use?.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        form.save(rows);
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(form.use?.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        form.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  /*Pinia Methods*/
  getAllForms() {
    return form.query().withAll().get();
  },

  getFormById(id: string) {
    return form.query().where('id', id).first();
  },
};

import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Drug from 'src/stores/models/drug/Drug';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const drug = useRepo(Drug);

export default {
  async post(params: string) {
    const resp = await api().post('drug', params);
    drug.save(resp.data);
    alertSucess('O Registo foi efectuado com sucesso');
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug?offset=' + offset + '&max=100')
        .then((resp) => {
          drug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        });
    }
  },
  async patch(id: string, params: string) {
    const resp = await api().patch('drug/' + id, params);
    drug.save(JSON.parse(resp.config.data));
    alertSucess('O Registo foi alterado com sucesso');
  },
  async delete(id: number) {
    await api().delete('drug/' + id);
    drug.destroy(id);
  },
  getActiveDrugs () {
    return drug.query().withAllRecursive(2).where('active', true).get()
  },
  getDrugById (id: string) {
    return drug.query().withAllRecursive(2).where('id',id).first()
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return drug.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllDrugs() {
    return drug.withAll().orderBy('name').get();
  },
};

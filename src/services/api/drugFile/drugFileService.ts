import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import DrugFile from 'src/stores/models/drugFile/DrugFile';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const drugFile = useRepo(DrugFile);

export default {
  async post(params: string) {
    const resp = await api().post('drug', params);
    drugFile.save(resp.data);
    alertSucess('Sucesso!', 'O Registo foi efectuado com sucesso');
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug?offset=' + offset + '&max=100')
        .then((resp) => {
          drugFile.save(resp.data);
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
    const resp = await api().patch('drug?id=eq.' + id, params);
    drugFile.save(JSON.parse(resp.config.data));
    alertSucess('Sucesso!', 'O Registo foi alterado com sucesso');
  },
  async delete(id: number) {
    await api().delete('drug/' + id);
    drugFile.destroy(id);
  },
  async apiGetDrugFileMobile(clinicId: string) {
    return await api().get(`/drugStockFile/drugfilemobile/${clinicId}`);
  },
  async apiGetDrugSummary(clinicId: string, drugId: string) {
    return await api().get(`/drugStockFile/sumary/${clinicId}/${drugId}`)
  },

   async apiGetDrugBatchSummary(clinicId: string, stockId: string) {
    return await api().get(`/drugStockFile/batchsumary/${clinicId}/${stockId}`)
  },


};

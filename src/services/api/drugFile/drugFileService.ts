import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import DrugFile from 'src/stores/models/drugFile/DrugFile';
import { useLoading } from 'src/composables/shared/loading/loading';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import Stock from '../stockService/StockService';
import { useStock } from 'src/composables/stock/StockMethod';

const stockMethod = useStock();

const { isMobile, isOnline } = useSystemUtils();

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const drugFile = useRepo(DrugFile);

export default {
  async post(params: string) {
    const resp = await api().post('drug', params);
    drugFile.save(resp.data);
    alertSucess('O Registo foi efectuado com sucesso');
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
    alertSucess('O Registo foi alterado com sucesso');
  },
  async delete(id: number) {
    await api().delete('drug/' + id);
    drugFile.destroy(id);
  },
  async apiGetDrugFileMobile(clinicId: string) {
    return await api().get(`/drugStockFile/drugfilemobile/${clinicId}`);
  },
  async apiGetDrugSummary(clinicId: string, drugId: string) {
    return await api().get(`/drugStockFile/sumary/${clinicId}/${drugId}`);
  },

  async apiGetDrugBatchSummary(clinicId: string, stockId: string) {
    return await api().get(`/drugStockFile/batchsumary/${clinicId}/${stockId}`);
  },

  // Mobile

  localDbAddOrUpdate(targetCopy: any) {
    return nSQL().onConnected(() => {
      nSQL('drugFiles').query('upsert', targetCopy).exec();
      drugFile.save(targetCopy);
    });
  },

  localDbGetAll() {
    return nSQL('drugFiles')
      .query('select')
      .exec()
      .then((result) => {
        drugFile.save(result);
        return result;
      });
  },

  calculateBalance(records: any) {
    let balance = 0;
    records.forEach((item) => {
      const current =
        Number(item.incomes) -
        Number(item.outcomes) +
        Number(item.posetiveAdjustment) -
        Number(item.negativeAdjustment) -
        Number(item.loses);
      balance = Number(current) + Number(balance);
      item.balance = balance;
    });
    return records;
  },

  async getDrugFileSummary(drug: any) {
    let list = [];
    const entrances = await stockMethod.getEntrancesDrugFile(drug);
    entrances.forEach((item) => {
      list.push(item);
    });
    const packs = await stockMethod.getPacksDrugFile(drug);
    packs.forEach((item) => {
      list.push(item);
    });
    const adjustments = await stockMethod.getAdjustmentsDrugFile(drug);
    adjustments.forEach((item) => {
      list.push(item);
    });

    const destructions = await stockMethod.getDestructionsDrugFile(drug);
    destructions.forEach((item) => {
      list.push(item);
    });

    const inventoryAdjustments =
      await stockMethod.getInventoryAdjustmentsDrugFile(drug);
    inventoryAdjustments.forEach((item) => {
      list.push(item);
    });

    list = list.sort((a, b) => {
      const d1 = new Date(a.eventDate);
      const d2 = new Date(b.eventDate);
      return d2 - d1;
    });
    return this.calculateBalance(list, 0);
  },

  async getDrugFileSummaryBatch(stockId: any) {
    let list = [];
    const entrances = await stockMethod.getEntrancesDrugFileBatch(stockId);
    entrances.forEach((item) => {
      list.push(item);
    });
    const packs = await stockMethod.getPacksDrugFileBatch(stockId);
    packs.forEach((item) => {
      list.push(item);
    });

    const adjustments = await stockMethod.getAdjustmentsDrugFileBatch(stockId);
    adjustments.forEach((item) => {
      list.push(item);
    });

    const destructions = await stockMethod.getDestructionsDrugFileBatch(
      stockId
    );
    destructions.forEach((item) => {
      list.push(item);
    });

    const inventoryAdjustments =
      await stockMethod.getInventoryAdjustmentsDrugFileBatch(stockId);
    inventoryAdjustments.forEach((item) => {
      list.push(item);
    });
    list = list.sort((a, b) => {
      const d1 = new Date(a.eventDate);
      const d2 = new Date(b.eventDate);
      return d2 - d1;
    });
    return this.calculateBalance(list);
  },
};

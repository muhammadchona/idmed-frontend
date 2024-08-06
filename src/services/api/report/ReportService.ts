import api from '../apiService/apiService';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import stockAlertService from 'src/services/api/stockAlertService/StockAlertService';
import { nSQL } from 'nano-sql';
import moment from 'moment';

const { showloading } = useLoading();
const { isOnline } = useSystemUtils();

export default {
  async apiInitMmiaProcessing(params: any) {
    return await api().post('/mmiaReport/initReportProcess', params);
  },

  async apiInitLinhasUsadasProcessing(params: any) {
    return await api().post('/linhasUsadasReport/initReportProcess', params);
  },

  async apiInitSegundasLinhasProcessing(params: any) {
    return await api().post('/segundasLinhasReport/initReportProcess', params);
  },

  async apiInitBalanceteProcessing(params: any) {
    return await api().post('/balanceteReport/initReportProcess', params);
  },

  async apiInitPatientsAbandonmentProcessing(params: any) {
    return await api().post('/patientsAbandonmentReport/initReportProcess', params);
  },

  async apiPrintMmiaReport(reportId: string, fileType: string) {
    return await api().get(`/mmiaReport/printReport/${reportId}/${fileType}`);
  },

  async apiGetMmiaReport(reportId: string) {
    return await api().get(`/mmiaReport/${reportId}`);
  },

  // Received Stock report
  async apiInitReceivedStockProcessing(params: any) {
    return await api().post('/stockReportTemp/initReportProcess', params);
  },

  async apiReceivedStockReport(reportId: any, fileType: any) {
    return await api().get(
      `/stockReportTemp/printReport/${reportId}/${fileType}`
    );
  },

  // Used Stock Report
  async apiInitUsedStockProcessing(params: any) {
    return await api().post('/usedStockReportTemp/initReportProcess', params);
  },

  async apiUsedStockReport(reportId: string, fileType: any) {
    return await api().get(
      `/usedStockReportTemp/printReport/${reportId}/${fileType}`
    );
  },

  // Arv Daily Regster
  async apiInitArvDailyRegisterProcessing(params: any) {
    return await api().post(
      '/arvDailyRegisterReportTemp/initReportProcess',
      params
    );
  },

  async apiArvDailyRegisterReport(reportId: string, fileType: string) {
    return await api().get(
      `/arvDailyRegisterReportTemp/printReport/${reportId}/${fileType}`
    );
  },

  async apiInitActiveInDrugStoreProcessing(params: any) {
    return await api().post('/activePatientReport/initReportProcess', params);
  },

  async apiInitExpectedPatientsProcessing(params: any) {
    return await api().post(
      '/expectedPatientsReport/initReportProcess',
      params
    );
  },

  async apiInitInventoryReportProcessing(params: any) {
    return await api().post('/inventoryReport/initReportProcess', params);
  },

  async getInventoryList(controller: any, reportId: string) {
    return await api().get(`/${controller}/getInventoryList/${reportId}`);
  },

  async apiInitReferredPatientsProcessing(params: any) {
    return await api().post(
      '/referredPatientsReport/initReportProcess',
      params
    );
  },

  async apiActivePatientReport(reportId: string, fileType: any) {
    return await api().get(
      `/activePatientReport/printReport/${reportId}/${fileType}`
    );
  },

  async apiInitPatientsHistryProcessing(params: any) {
    return await api().post(
      '/historicoLevantamentoReport/initReportProcess',
      params
    );
  },

  async apiPatientsHistryReport(reportId: any, fileType: any) {
    return await api().get(
      `/historicoLevantamentoReport/printReport/${reportId}/${fileType}`
    );
  },

  apiMigrationStatus() {
    return api().get('/migration/migrationStatus');
  },

  apiMigrationStatusDetails(stage: any) {
    return api().get(`/migration/migrationStatusDetails/${stage}`);
  },

  apiGetRegisteredPatientByDispenseType(
    year: any,
    clinicId: string,
    serviceCode: any
  ) {
    return api().get(
      `/dashBoard/getRegisteredPatientByDispenseType/${year}/${clinicId}/${serviceCode}`
    );
  },

  apiGetPatientsFirstDispenseByGender(
    year: any,
    clinicId: any,
    serviceCode: any
  ) {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByGender/${year}/${clinicId}/${serviceCode}`
    );
  },

  apiGetPatientsFirstDispenseByAge(
    year: any,
    clinicId: string,
    serviceCode: string
  ) {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );
  },

  apiGetActivePatientPercentage(
    year: any,
    clinicId: string,
    serviceCode: string
  ) {
    return api().get(
      `/dashBoard/getActivePatientPercentage/${year}/${clinicId}/${serviceCode}`
    );
  },
  apiGetDispenseByAge(year: any, clinicId: string, serviceCode: any) {
    return api().get(
      `/dashBoard/getDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );
  },

  apiGetDispensesByGender(year: any, clinicId: string, serviceCode: string) {
    return api().get(
      `/dashBoard/getDispensesByGender/${year}/${clinicId}/${serviceCode}`
    );
  },

  apiGetStockAlert(clinicId: string, serviceCode: string) {
    return api().get(`/dashBoard/getStockAlert/${clinicId}/${serviceCode}`);
  },

  apiGetStockAlertAll(clinicId: string) {
    return api().get(`/dashBoard/getStockAlertAll/${clinicId}`);
  },

  apiGetDashboardServiceButton(year: any, clinicId: string) {
    return api().get(
      `/dashBoard/getDashboardServiceButton/${year}/${clinicId}`
    );
  },

  apiPrintActivePatientReport(reportId: any) {
    return api().get(`/activePatientReport/printReport/${reportId}`, {
      responseType: 'json',
    });
  },

  apiPrintExpectedPatientsReport(reportId: any) {
    return api().get(`/expectedPatientsReport/printReport/${reportId}`, {
      responseType: 'json',
    });
  },

  apiPrintInventoryReport(inventoryId: any, reportId: any) {
    return api().get(
      `/inventoryReport/printReportByInventoryId/${inventoryId}/${reportId}`,
      {
        responseType: 'json',
      }
    );
  },

  apiPrintPatientsWithoutDispenseReport(reportId: any) {
    return api().get(`/patientWithoutDispense/printReport/${reportId}`, {
      responseType: 'json',
    });
  },

  apiGenerateAbsentPatientsReport(reportId: any, fileType: any) {
    return api().get(
      `/absentPatientsReport/printReport/${reportId}/${fileType}`,
      { responseType: 'json' }
    );
  },
  apiPrintReferredPatientsReport(reportId: any, fileType: any) {
    return api().get(`/referredPatientsReport/printReport/${params.id}`);
  },

  apiInitReportProcess(controller: any, params: any) {
    return api().post(`/${controller}/initReportProcess`, params);
  },

  async getProcessingStatus(controller: any, params: any) {
    return await api().get(`/${controller}/getProcessingStatus/${params.id}`);
  },
  printReport(controller: any, id: any, fileType: any) {
    //  return api().get(`/${controller}/printReport/${id}`)
    return api().get(`/${controller}/printReport/${id}/${fileType}`, {
      responseType: 'json',
    });
  },
  printReportOther(controller: any, id: any) {
    //  return api().get(`/${controller}/printReport/${id}`)
    return api().get(`/${controller}/printReport/${id}`);
  },
  delete(controller: any, id: any) {
    return api().delete(`/${controller}/delete/${id}`);
  },

  get(controller: any, id: any) {
    return api().get(`/${controller}/${id}`);
  },

  createDrugArrayOfArrayRow(rows: any) {
    const data = [];
    for (const row in rows) {
      const createRow = [];
      createRow.push(rows[row]);
      data.push(createRow);
    }
    return data;
  },

  mapaDeAgrupamento(rowsAux: any) {
    // Crie um mapa para rastrear os objetos agrupados por nid e pickupDate
    const mapaDeAgrupamento = {};

    // Percorra a lista de objetos pai
    rowsAux.forEach((objetoPai) => {
      const nid = objetoPai.nid;
      const pickupDate = objetoPai.pickupDate;

      // Crie uma chave única para o agrupamento com base em nid e pickupDate
      const chaveDeAgrupamento = `${nid}_${pickupDate}`;

      // Se a chave de agrupamento não existir no mapa, crie um novo objeto
      if (!mapaDeAgrupamento[chaveDeAgrupamento]) {
        mapaDeAgrupamento[chaveDeAgrupamento] = { ...objetoPai };
        mapaDeAgrupamento[chaveDeAgrupamento].drugQuantityTemps = [
          objetoPai.drugQuantityTemps[0].drugName +
            ' - ' +
            objetoPai.drugQuantityTemps[0].quantity,
        ];
      } else {
        // Verifique se o drugName já existe na lista
        const drugName = objetoPai.drugQuantityTemps[0].drugName;
        const quant = objetoPai.drugQuantityTemps[0].quantity;
        if (
          !mapaDeAgrupamento[chaveDeAgrupamento].drugQuantityTemps.includes(
            drugName
          )
        ) {
          mapaDeAgrupamento[chaveDeAgrupamento].drugQuantityTemps.push(
            drugName + ' - ' + quant
          );
        }
      }
    });
    return mapaDeAgrupamento;
  },

  /*apiPrintReportHistoricoLevantamentoReport(id: any, fileType:any){
 return api().get(`/historicoLevantamentoReport/printReport/${id}/${fileType}`, { responseType: 'json' })
},*/

  apiGetMigrationLogReport() {
    return api().get('/migrationLog/printReport', { responseType: 'json' });
  },

  getFormatDDMMYYYY(date: any) {
    return moment(date).format('DD-MM-YYYY');
  },

  getFormatYYYYMMDD(date: any) {
    return moment(date).format('YYYY-MM-DD');
  },

  getDashboardServiceButton(year: any, clinicId: string) {
    if (isOnline.value) {
      return api().get(
        `/dashBoard/getDashboardServiceButton/${year}/${clinicId}`
      );
    } else {
      const dateStr = year + '-12-20';
      const parts = dateStr.split('-');
      const currentYear = new Date().getFullYear();
      let endDateObject = new Date(parts[0], parts[1] - 1, parts[2]);
      if (currentYear == year) {
        endDateObject = new Date();
      }

      showloading();
      return nSQL('identifiers')
        .query('select', [
          'clinicalServices.code AS service',
          '0 AS quantity',
          'identifiers.clinic.id AS clinicId',
          'identifiers.startDate AS startDate',
        ])
        .where(['clinic.id', 'LIKE', clinicId])
        .join({
          type: 'inner',
          table: 'clinicalServices',
          where: ['clinicalServices.id', '=', 'identifiers.service.id'],
        })
        .exec()
        .then((rows) => {
          // filtrar por datas
          rows = rows.filter(function (value) {
            return new Date(value.startDate) <= endDateObject; // Apenas o true sera mantido, o resto sera removido
          });

          return rows.reduce((acc, obj) => {
            const key = obj.service;
            const matchingObj = acc.find((item) => item.service === key);
            if (!matchingObj) {
              acc.push({ service: key, startDate: obj.startDate, quantity: 1 });
            } else {
              matchingObj.quantity++;
            }
            return acc;
          }, []);
        });
    }
  },

  getRegisteredPatientByDispenseType(
    year: any,
    clinicId: string,
    serviceCode: string
  ) {
    if (isOnline.value) {
      return api().get(
        `/dashBoard/getRegisteredPatientByDispenseType/${year}/${clinicId}/${serviceCode}`
      );
    } else {
      const realYear = year;
      const dateStr = realYear + '-12-20';
      const yearBefore = year - 1;
      const dateStr1 = yearBefore + '-12-21';
      const endDateObject = new Date(dateStr);
      const startDateObject = new Date(dateStr1);
      const serviceCD = serviceCode;

      return nSQL('patientVisits')
        .query('select', [
          '1 AS month',
          'clinicalServices.code AS service',
          'identifiers.startDate AS startDate',
          'patientVisits.visitDate AS visitDate',
          'patientVisits.patient.id AS patientId',
          'dispenseTypes.code AS dispenseTypeCode',
        ])
        .join([
          {
            type: 'inner',
            table: 'identifiers',
            where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: [
              'episodes.patientServiceIdentifier.id',
              '=',
              'identifiers.id',
            ],
          },
          {
            type: 'inner',
            table: 'clinicalServices',
            where: ['clinicalServices.id', '=', 'identifiers.service.id'],
          },
          {
            type: 'inner',
            table: 'patientVisitDetails',
            where: [
              'patientVisits.id',
              '=',
              'patientVisitDetails.patientVisit.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptions',
            where: [
              'prescriptions.id',
              '=',
              'patientVisitDetails.prescription.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptionsDetails',
            where: [
              'prescriptionsDetails.prescription.id',
              '=',
              'prescriptions.id',
            ],
          },
          {
            type: 'inner',
            table: 'dispenseTypes',
            where: [
              'dispenseTypes.id',
              '=',
              'prescriptionsDetails.dispenseType.id',
            ],
          },
        ])
        .exec()
        .then(async (rows) => {
          rows = await this.removerDuplicados(rows);
          rows.forEach((item) => {
            if (item.startDate !== null && item.startDate !== undefined) {
              const strtDate = new Date(item.startDate);
              if (strtDate.getDate() > 20) {
                item.month = strtDate.getMonth() + 2; // Adicionar 1 mes
              }
              if (strtDate.getDate() <= 20) {
                item.month = strtDate.getMonth() + 1; // Considerar mes da data
              }
            }
          });

          rows = rows.filter(function (value) {
            return (
              value.service === serviceCD &&
              new Date(value.startDate) >= startDateObject &&
              new Date(value.startDate) <= endDateObject &&
              new Date(value.visitDate) <= endDateObject
            ); // Apenas o true sera mantido, o resto sera removido
          });

          return rows.reduce((acc, obj) => {
            const key = obj.dispenseTypeCode;
            const matchingObj = acc.find(
              (item) => item.dispenseTypeCode === key
            );
            if (!matchingObj) {
              acc.push({
                dispenseTypeCode: key,
                startDate: obj.startDate,
                visitDate: obj.visitDate,
                month: obj.month,
                service: obj.service,
                quantity: 1,
              });
            } else {
              matchingObj.quantity++;
            }
            return acc;
          }, []);
        });
    }
  },

  removerDuplicados(registros: any) {
    const uniqueRegistros = registros.reduce((unique, registro) => {
      if (!unique.some((r) => r.patientId === registro.patientId)) {
        unique.push(registro);
      }
      return unique;
    }, []);
    return uniqueRegistros;
  },

  getPatientsFirstDispenseByAge(
    year: any,
    clinicId: string,
    serviceCode: string
  ) {
    if (isOnline.value) {
      return api().get(
        `/dashBoard/getPatientsFirstDispenseByAge/${year}/${clinicId}/${serviceCode}`
      );
    } else {
      const realYear = year;
      const dateStr = realYear + '-12-20';
      const yearBefore = year - 1;
      const dateStr1 = yearBefore + '-12-21';
      const endDateObject = new Date(dateStr);
      const startDateObject = new Date(dateStr1);
      const serviceCD = serviceCode;

      return nSQL('patientVisits')
        .query('select', [
          'identifiers.startDate AS startDate',
          'patientVisits.visitDate AS visitDate',
          'patientVisits.patient.dateOfBirth AS dateOfBirth',
          'patientVisits.patient.id AS patientId',
          'clinicalServices.code AS service',
          '1 AS month',
          '0 AS quantity',
          '0 AS faixa',
          'dispenseTypes.code AS dispenseTypeCode',
        ])
        .join([
          {
            type: 'inner',
            table: 'identifiers',
            where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: [
              'episodes.patientServiceIdentifier.id',
              '=',
              'identifiers.id',
            ],
          },
          {
            type: 'inner',
            table: 'clinicalServices',
            where: ['clinicalServices.id', '=', 'identifiers.service.id'],
          },
          {
            type: 'inner',
            table: 'patientVisitDetails',
            where: [
              'patientVisits.id',
              '=',
              'patientVisitDetails.patientVisit.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptions',
            where: [
              'prescriptions.id',
              '=',
              'patientVisitDetails.prescription.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptionsDetails',
            where: [
              'prescriptionsDetails.prescription.id',
              '=',
              'prescriptions.id',
            ],
          },
          {
            type: 'inner',
            table: 'dispenseTypes',
            where: [
              'dispenseTypes.id',
              '=',
              'prescriptionsDetails.dispenseType.id',
            ],
          },
        ])
        .exec()
        .then((rows) => {
          rows = this.removerDuplicados(rows);
          rows.forEach((item) => {
            const idade = this.calcularIdade(item.dateOfBirth);
            if (item.startDate !== null && item.startDate !== undefined) {
              const strtDate = new Date(item.startDate);
              if (strtDate.getDate() > 20) {
                item.month = strtDate.getMonth() + 2; // Adicionar 1 mes
              }
              if (strtDate.getDate() <= 20) {
                item.month = strtDate.getMonth() + 1; // Considerar mes da data
              }
              if (idade < 18) {
                item.faixa = 'MENOR';
              }
              if (idade >= 18) {
                item.faixa = 'ADULTO';
              }
            }
          });

          rows = rows.filter(function (value) {
            return (
              value.service === serviceCD &&
              new Date(value.startDate) >= startDateObject &&
              new Date(value.startDate) <= endDateObject &&
              new Date(value.visitDate) <= endDateObject
            ); // Apenas o true sera mantido, o resto sera removido
          });

          rows = rows.reduce((acc, obj) => {
            const key =
              obj.dispenseTypeCode + '-' + obj.month + '-' + obj.faixa;
            const matchingObj = acc.find((item) => item.key === key);
            if (!matchingObj) {
              acc.push({
                key: key,
                dispenseTypeCode: obj.dispenseTypeCode,
                startDate: obj.startDate,
                visitDate: obj.visitDate,
                month: obj.month,
                service: obj.service,
                dateOfBirth: obj.dateOfBirth,
                faixa: obj.faixa,
                quantity: 1,
              });
            } else {
              matchingObj.quantity++;
            }
            return acc;
          }, []);

          return rows;
        });
    }
  },

  calcularIdade(dataNascimento: any) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  },

  getActivePatientPercentage(year, clinicId, serviceCode) {
    if (isOnline.value) {
      return api().get(
        `/dashBoard/getActivePatientPercentage/${year}/${clinicId}/${serviceCode}`
      );
    } else {
      const realYear = year;
      const dateStr = realYear + '-12-20';
      const yearBefore = year - 1;
      const dateStr1 = yearBefore + '-12-21';
      const endDateObject = new Date(dateStr);
      const startDateObject = new Date(dateStr1);
      const serviceCD = serviceCode;
      return nSQL('patientVisits')
        .query('select', [
          'identifiers.startDate AS startDate',
          'patientVisits.visitDate AS visitDate',
          'patientVisits.patient.id AS patientId',
          'clinicalServices.code AS service',
          '0 AS quantity',
          '0 AS percent',
          'dispenseTypes.code AS dispenseTypeCode',
          'patientVisits.patientVisitDetails[0].prescription.prescriptionDetails[0].therapeuticRegimen.code AS therapeuticRegimen',
          'patientVisits.patientVisitDetails[0].prescription.prescriptionDate AS prescriptionDate',
          'patientVisits.patientVisitDetails[0].prescription.prescriptionDetails[0].therapeuticLine.code AS therapeuticLine',
          'patientVisits.patientVisitDetails[0].episode.episodeDate AS lastEpisode',
          'patientVisits.patient.gender AS gender',
        ])
        .join([
          {
            type: 'inner',
            table: 'identifiers',
            where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: [
              'episodes.patientServiceIdentifier.id',
              '=',
              'identifiers.id',
            ],
          },
          {
            type: 'inner',
            table: 'clinicalServices',
            where: ['clinicalServices.id', '=', 'identifiers.service.id'],
          },
          {
            type: 'inner',
            table: 'patientVisitDetails',
            where: [
              'patientVisits.id',
              '=',
              'patientVisitDetails.patientVisit.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptions',
            where: [
              'prescriptions.id',
              '=',
              'patientVisitDetails.prescription.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptionsDetails',
            where: [
              'prescriptionsDetails.prescription.id',
              '=',
              'prescriptions.id',
            ],
          },
          {
            type: 'inner',
            table: 'dispenseTypes',
            where: [
              'dispenseTypes.id',
              '=',
              'prescriptionsDetails.dispenseType.id',
            ],
          },
        ])
        .exec()
        .then((rows) => {
          rows = this.removerDuplicados(rows);
          rows = rows.filter(function (value) {
            return (
              value.service === serviceCD &&
              new Date(value.startDate) >= startDateObject &&
              new Date(value.startDate) <= endDateObject &&
              new Date(value.visitDate) <= endDateObject
            ); // Apenas o true sera mantido, o resto sera removido
          });
          const arr = this.filterUniquePatients(rows);
          const arr1 = this.groupByGender(arr);
          return arr1;
        });
    }
  },
  filterUniquePatients(data) {
    const patientMap = new Map();
    for (const item of data) {
      if (!patientMap.has(item.patientId)) {
        patientMap.set(item.patientId, item);
      } else {
        const existingItem = patientMap.get(item.patientId);
        if (new Date(item.visitDate) > new Date(existingItem.visitDate)) {
          patientMap.set(item.patientId, item);
        }
        if (new Date(item.lastEpisode) > new Date(existingItem.lastEpisode)) {
          patientMap.set(item.patientId, item);
        }
        if (
          new Date(item.prescriptionDate) >
          new Date(existingItem.prescriptionDate)
        ) {
          patientMap.set(item.patientId, item);
        }
      }
    }
    return Array.from(patientMap.values());
  },
  groupByGender(arr) {
    const countsByGender = arr.reduce((counts, obj) => {
      const gender = obj.gender;
      counts[gender] = counts[gender] || { quantity: 0 };
      counts[gender].quantity++;
      return counts;
    }, {});

    const results = [
      { gender: 'Masculino', quantity: 0, percent: 0 },
      { gender: 'Feminino', quantity: 0, percent: 0 },
    ];
    const totalCount = arr.length;
    for (const gender in countsByGender) {
      const count = countsByGender[gender].quantity;
      const percent = (count / totalCount) * 100;
      results[gender === 'Masculino' ? 0 : 1] = {
        gender,
        quantity: count,
        percent,
      };
    }

    return results;
  },

  getPatientsFirstDispenseByGender(
    year: any,
    clinicId: string,
    serviceCode: string
  ) {
    if (isOnline.value) {
      return api().get(
        `/dashBoard/getPatientsFirstDispenseByGender/${year}/${clinicId}/${serviceCode}`
      );
    } else {
      const realYear = year;
      const dateStr = realYear + '-12-20';
      const yearBefore = year - 1;
      const dateStr1 = yearBefore + '-12-21';
      const endDateObject = new Date(dateStr);
      const startDateObject = new Date(dateStr1);
      const serviceCD = serviceCode;
      return nSQL('patientVisits')
        .query('select', [
          'identifiers.startDate AS startDate',
          'patientVisits.visitDate AS visitDate',
          'patientVisits.patient.id AS patientId',
          'clinicalServices.code AS service',
          '0 AS quantity',
          '0 AS percent',
          'patientVisits.patientVisitDetails[0].episode.episodeDate AS lastEpisode',
          '0 AS month',
          'dispenseTypes.code AS dispenseTypeCode',
          'patientVisits.patient.gender AS gender',
        ])
        .join([
          {
            type: 'inner',
            table: 'identifiers',
            where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: [
              'episodes.patientServiceIdentifier.id',
              '=',
              'identifiers.id',
            ],
          },
          {
            type: 'inner',
            table: 'clinicalServices',
            where: ['clinicalServices.id', '=', 'identifiers.service.id'],
          },
          {
            type: 'inner',
            table: 'patientVisitDetails',
            where: [
              'patientVisits.id',
              '=',
              'patientVisitDetails.patientVisit.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptions',
            where: [
              'prescriptions.id',
              '=',
              'patientVisitDetails.prescription.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptionsDetails',
            where: [
              'prescriptionsDetails.prescription.id',
              '=',
              'prescriptions.id',
            ],
          },
          {
            type: 'inner',
            table: 'dispenseTypes',
            where: [
              'dispenseTypes.id',
              '=',
              'prescriptionsDetails.dispenseType.id',
            ],
          },
        ])
        .exec()
        .then((rows) => {
          rows = this.removerDuplicados(rows);
          rows = rows.filter(function (value) {
            return (
              value.service === serviceCD &&
              new Date(value.startDate) >= startDateObject &&
              new Date(value.startDate) <= endDateObject &&
              new Date(value.visitDate) >= startDateObject &&
              new Date(value.visitDate) <= endDateObject
            ); // Apenas o true sera mantido, o resto sera removido
          });

          rows.forEach((item) => {
            if (item.visitDate !== null && item.visitDate !== undefined) {
              const visitDate = new Date(item.visitDate);
              if (visitDate.getDate() > 20) {
                item.month = visitDate.getMonth() + 2; // Adicionar 1 mes
              }
              if (visitDate.getDate() <= 20) {
                item.month = visitDate.getMonth() + 1; // Considerar mes da data
              }
            }
          });
          rows = this.agruparRegistrosPorDispenseTypeCodeMonthGender(rows);
          return rows;
        });
    }
  },

  agruparRegistrosPorDispenseTypeCodeMonthGender(registros: any) {
    const agrupadoPorDispenseTypeCode = registros.reduce(
      (agrupado: any, registro: any) => {
        const chave = `${registro.dispenseTypeCode}-${registro.month}-${registro.gender}`;
        if (!agrupado[chave]) {
          agrupado[chave] = {
            dispenseTypeCode: registro.dispenseTypeCode,
            month: registro.month,
            quantity: 0,
            gender: registro.gender,
          };
        }
        agrupado[chave].quantity++;
        return agrupado;
      },
      {}
    );
    return Object.values(agrupadoPorDispenseTypeCode);
  },

  getDispenseByAge(year: any, clinicId: string, serviceCode: string) {
    if (isOnline.value) {
      return api().get(
        `/dashBoard/getDispenseByAge/${year}/${clinicId}/${serviceCode}`
      );
    } else {
      const realYear = year;
      const dateStr = realYear + '-12-20';
      const yearBefore = year - 1;
      const dateStr1 = yearBefore + '-12-21';
      const endDateObject = new Date(dateStr);
      const startDateObject = new Date(dateStr1);
      const serviceCD = serviceCode;
      return nSQL('patientVisits')
        .query('select', [
          'identifiers.startDate AS startDate',
          'patientVisits.visitDate AS visitDate',
          'packs.pickupDate AS pickupDate',
          'patientVisits.patient.id AS patientId',
          'clinicalServices.code AS service',
          '0 AS quantity',
          '0 AS percent',
          'patientVisits.patient.dateOfBirth AS dateOfBirth',
          'episodes.episodeDate AS lastEpisode',
          '0 AS month',
          'patientVisits.clinic.id AS clinicID',
          'dispenseTypes.code AS dispenseTypeCode',
          '0 AS faixa',
          'dispenseTypes.description AS dispenseTypeDescription',
          'patientVisits.patient.gender AS gender',
        ])
        .join([
          {
            type: 'inner',
            table: 'identifiers',
            where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: [
              'episodes.patientServiceIdentifier.id',
              '=',
              'identifiers.id',
            ],
          },
          {
            type: 'inner',
            table: 'clinicalServices',
            where: ['clinicalServices.id', '=', 'identifiers.service.id'],
          },
          {
            type: 'inner',
            table: 'patientVisitDetails',
            where: [
              'patientVisits.id',
              '=',
              'patientVisitDetails.patientVisit.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptions',
            where: [
              'prescriptions.id',
              '=',
              'patientVisitDetails.prescription.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptionsDetails',
            where: [
              'prescriptionsDetails.prescription.id',
              '=',
              'prescriptions.id',
            ],
          },
          {
            type: 'inner',
            table: 'dispenseTypes',
            where: [
              'dispenseTypes.id',
              '=',
              'prescriptionsDetails.dispenseType.id',
            ],
          },
          {
            type: 'inner',
            table: 'packs',
            where: ['packs.id', '=', 'patientVisitDetails.pack.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: ['episodes.id', '=', 'patientVisitDetails.episode.id'],
          },
        ])
        .exec()
        .then((rows) => {
          rows = rows.filter((value) => {
            return (
              value.service === serviceCD &&
              new Date(value.startDate) >= startDateObject &&
              new Date(value.startDate) <= endDateObject &&
              new Date(value.pickupDate) >= startDateObject &&
              new Date(value.pickupDate) <= endDateObject &&
              value.clinicID === clinicId
            ); // Apenas o true sera mantido, o resto sera removido
          });

          rows.forEach((item) => {
            const idade = this.calcularIdade(item.dateOfBirth);
            if (idade >= 0) {
              if (idade < 18) {
                item.faixa = 'MENOR';
              }
              if (idade >= 18) {
                item.faixa = 'ADULTO';
              }
            }
          });
          rows = this.agruparRegistros(rows);
          return rows;
        });
    }
  },

  agruparRegistros(registros: any) {
    const agrupado = registros.reduce((obj, registro) => {
      const descricao = registro.dispenseTypeDescription;
      const faixa = registro.faixa;

      if (!obj[descricao]) {
        obj[descricao] = {
          dispenseType: descricao,
          adulto: 0,
          menor: 0,
        };
      }

      if (faixa === 'ADULTO') {
        obj[descricao].adulto++;
      } else if (faixa === 'MENOR') {
        obj[descricao].menor++;
      }

      return obj;
    }, {});

    return Object.values(agrupado);
  },

  agruparRegistrosMascFem(registros) {
    const agrupado = registros.reduce((obj, registro) => {
      const descricao = registro.dispenseTypeDescription;
      const genero = registro.gender;

      if (!obj[descricao]) {
        obj[descricao] = {
          dispenseType: descricao,
          masculino: 0,
          femenino: 0,
        };
      }

      if (genero === 'Masculino') {
        obj[descricao].masculino++;
      } else if (genero === 'Feminino') {
        obj[descricao].femenino++;
      }

      return obj;
    }, {});

    return Object.values(agrupado);
  },

  getStockAlert(clinicId: string, serviceCode: string) {
    if (isOnline.value) {
      return api().get(`/dashBoard/getStockAlert/${clinicId}/${serviceCode}`);
    } else {
      return stockAlertService.apiGetStockAlertAll(clinicId);
    }
  },

  getDispensesByGender(year: any, clinicId: string, serviceCode: string) {
    if (isOnline.value) {
      return api().get(
        `/dashBoard/getDispensesByGender/${year}/${clinicId}/${serviceCode}`
      );
    } else {
      const realYear = year;
      const dateStr = realYear + '-12-20';
      const yearBefore = year - 1;
      const dateStr1 = yearBefore + '-12-21';
      const endDateObject = new Date(dateStr);
      const startDateObject = new Date(dateStr1);
      const serviceCD = serviceCode;
      return nSQL('patientVisits')
        .query('select', [
          'identifiers.startDate AS startDate',
          'patientVisits.visitDate AS visitDate',
          'packs.pickupDate AS pickupDate',
          'patientVisits.patient.id AS patientId',
          'clinicalServices.code AS service',
          '0 AS quantity',
          '0 AS percent',
          'episodes.episodeDate AS lastEpisode',
          '0 AS month',
          'patientVisits.clinic.id AS clinicID',
          'dispenseTypes.code AS dispenseTypeCode',
          'dispenseTypes.description AS dispenseTypeDescription',
          'patientVisits.patient.gender AS gender',
          'patientVisits.id AS patientVisitId',
        ])
        .join([
          {
            type: 'inner',
            table: 'identifiers',
            where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: [
              'episodes.patientServiceIdentifier.id',
              '=',
              'identifiers.id',
            ],
          },
          {
            type: 'inner',
            table: 'clinicalServices',
            where: ['clinicalServices.id', '=', 'identifiers.service.id'],
          },
          {
            type: 'inner',
            table: 'patientVisitDetails',
            where: [
              'patientVisits.id',
              '=',
              'patientVisitDetails.patientVisit.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptions',
            where: [
              'prescriptions.id',
              '=',
              'patientVisitDetails.prescription.id',
            ],
          },
          {
            type: 'inner',
            table: 'prescriptionsDetails',
            where: [
              'prescriptionsDetails.prescription.id',
              '=',
              'prescriptions.id',
            ],
          },
          {
            type: 'inner',
            table: 'dispenseTypes',
            where: [
              'dispenseTypes.id',
              '=',
              'prescriptionsDetails.dispenseType.id',
            ],
          },
          {
            type: 'inner',
            table: 'packs',
            where: ['packs.id', '=', 'patientVisitDetails.pack.id'],
          },
          {
            type: 'inner',
            table: 'episodes',
            where: ['episodes.id', '=', 'patientVisitDetails.episode.id'],
          },
        ])
        .exec()
        .then((rows) => {
          rows = rows.filter((value) => {
            return (
              value.service === serviceCD &&
              new Date(value.startDate) >= startDateObject &&
              new Date(value.startDate) <= endDateObject &&
              new Date(value.pickupDate) >= startDateObject &&
              new Date(value.pickupDate) <= endDateObject &&
              value.clinicID === clinicId
            ); // Apenas o true sera mantido, o resto sera removido
          });
          rows = this.agruparRegistrosMascFem(rows);
          return rows;
        });
    }
  },

  referredPatientsMobileOffline(
    startDateParam: any,
    endDateParam: any,
    clinicIdParam: string
  ) {
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    const clinicId = clinicIdParam;

    return nSQL('patientVisits')
      .query('select', [
        'patientVisits.patientVisitDetails[0].prescription.id AS prescriptionId',
        'patientVisits.visitDate AS visitDate',
        'patientVisits.clinic.id AS clinicID',
        'packs.pickupDate AS pickupDate',
        'patientVisits.patient.id AS patientId',
        'episodes.episodeDate AS episodeDate',
        'identifiers.startDate AS startDate',
        'startStopReasons.code AS code',
        'clinicalServices.code AS service',
        'identifiers.value AS nid',
        'patientVisits.patient.firstNames AS firstNames',
        'patientVisits.patient.middleNames AS middleNames',
        'packs.nextPickUpDate AS nextPickUpDate',
        'patientVisits.patient.lastNames AS lastNames',
        'patientVisits.patient.dateOfBirth AS dateOfBirth',
        'packs.dateReceived AS referenceDate',
        'episodes.referralClinic AS referralClinic',
      ])
      .join([
        {
          type: 'inner',
          table: 'patientVisitDetails',
          where: [
            'patientVisits.id',
            '=',
            'patientVisitDetails.patientVisit.id',
          ],
        },
        {
          type: 'inner',
          table: 'episodes',
          where: ['episodes.id', '=', 'patientVisitDetails.episode.id'],
        },
        {
          type: 'inner',
          table: 'packs',
          where: ['packs.id', '=', 'patientVisitDetails.pack.id'],
        },
        {
          type: 'inner',
          table: 'identifiers',
          where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
        },
        {
          type: 'inner',
          table: 'startStopReasons',
          where: ['startStopReasons.id', '=', 'episodes.startStopReason.id'],
        },
        {
          type: 'inner',
          table: 'clinicalServices',
          where: ['clinicalServices.id', '=', 'identifiers.service.id'],
        },
      ])
      .exec()
      .then((rows) => {
        rows = this.removerDuplicados(rows);
        return rows.filter((value) => {
          return (
            value.service === 'TARV' &&
            value.code === 'REFERIDO_PARA' &&
            new Date(value.episodeDate) >= startDate &&
            new Date(value.episodeDate) <= endDate &&
            value.clinicID === clinicId
          );
        });
      })
      .catch((error) => {
        console.error(error);
      });
  },

  referredBackPatientsMobileOffline(
    startDateParam: any,
    endDateParam: any,
    clinicIdParam: string
  ) {
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    const clinicId = clinicIdParam;

    return nSQL('patientVisits')
      .query('select', [
        'patientVisits.patientVisitDetails[0].prescription.id AS prescriptionId',
        'patientVisits.visitDate AS visitDate',
        'patientVisits.clinic.id AS clinicID',
        'packs.pickupDate AS pickupDate',
        'patientVisits.patient.id AS patientId',
        'episodes.episodeDate AS episodeDate',
        'identifiers.startDate AS startDate',
        'startStopReasons.code AS code',
        'clinicalServices.code AS service',
        'identifiers.value AS nid',
        'patientVisits.patient.firstNames AS firstNames',
        'patientVisits.patient.middleNames AS middleNames',
        'packs.nextPickUpDate AS nextPickUpDate',
        'patientVisits.patient.lastNames AS lastNames',
        'patientVisits.patient.dateOfBirth AS dateOfBirth',
        'packs.dateReceived AS referenceDate',
        'episodes.referralClinic AS referralClinic',
        'episodes.notes AS notes',
      ])
      .join([
        {
          type: 'inner',
          table: 'patientVisitDetails',
          where: [
            'patientVisits.id',
            '=',
            'patientVisitDetails.patientVisit.id',
          ],
        },
        {
          type: 'inner',
          table: 'episodes',
          where: ['episodes.id', '=', 'patientVisitDetails.episode.id'],
        },
        {
          type: 'inner',
          table: 'packs',
          where: ['packs.id', '=', 'patientVisitDetails.pack.id'],
        },
        {
          type: 'inner',
          table: 'identifiers',
          where: ['identifiers.patient.id', '=', 'patientVisits.patient.id'],
        },
        {
          type: 'inner',
          table: 'startStopReasons',
          where: ['startStopReasons.id', '=', 'episodes.startStopReason.id'],
        },
        {
          type: 'inner',
          table: 'clinicalServices',
          where: ['clinicalServices.id', '=', 'identifiers.service.id'],
        },
      ])
      .exec()
      .then((rows) => {
        rows = this.removerDuplicados(rows);
        return rows.filter((value) => {
          return (
            value.service === 'TARV' &&
            value.code === 'VOLTOU_REFERENCIA' &&
            new Date(value.episodeDate) >= startDate &&
            new Date(value.episodeDate) <= endDate &&
            value.clinicID === clinicId
          );
        });
      })
      .catch((error) => {
        console.error(error);
      });
  },

  saoIguais(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  },

  areEqualObjects(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  },
};

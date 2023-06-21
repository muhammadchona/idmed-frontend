import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Report from 'src/stores/models/report/Report';
import moment from 'moment';

const report = useRepo(Report);

export default {

 

   async apiInitMmiaProcessing(params: any) {
    return await api().post('/mmiaReport/initReportProcess', params);
  },

   async apiPrintMmiaReport(reportId: string, fileType: string) {
    return await api().get(
      `/mmiaReport/printReport/${reportId}/${fileType}`
    );
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
    return await api().post(
      '/usedStockReportTemp/initReportProcess',
      params
    );
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
    return await api().post(
      '/activePatientReport/initReportProcess',
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

   apiGetRegisteredPatientByDispenseType(year: any, clinicId: string, serviceCode: any) {
    return api().get(
      `/dashBoard/getRegisteredPatientByDispenseType/${year}/${clinicId}/${serviceCode}`
    );
  },

   apiGetPatientsFirstDispenseByGender(year: any, clinicId: any, serviceCode: any) {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByGender/${year}/${clinicId}/${serviceCode}`
    );
  },

   apiGetPatientsFirstDispenseByAge(year: any, clinicId: string, serviceCode: string) {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );
  },

   apiGetActivePatientPercentage(year: any, clinicId: string, serviceCode: string) {
    return api().get(
      `/dashBoard/getActivePatientPercentage/${year}/${clinicId}/${serviceCode}`
    );
  }
,
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

   apiGetStockAlert(clinicId:string, serviceCode: string) {
    return api().get(
      `/dashBoard/getStockAlert/${clinicId}/${serviceCode}`
    );
  },

   apiGetStockAlertAll(clinicId: string) {
    return api().get(`/dashBoard/getStockAlertAll/${clinicId}`);
  },

   apiGetDashboardServiceButton(year: any, clinicId: string) {
    return api().get(
      `/dashBoard/getDashboardServiceButton/${year}/${clinicId}`
    );
  },

  apiPrintActivePatientReport(reportId: any){
   return api().get(`/activePatientReport/printReport/${reportId}`, { responseType: 'json' })
  },

  apiGenerateAbsentPatientsReport(reportId: any, fileType: any){
  return api().get(`/absentPatientsReport/printReport/${reportId}/${fileType}`, { responseType: 'json' })
  },
  apiPrintReferredPatientsReport(reportId: any, fileType: any){
    return api().get(`/referredPatientsReport/printReport/${params.id}`)
    },

  apiInitReportProcess( controller: any, params: any){
  return api().post(`/${controller}/initReportProcess`, params)
  },

  async getProcessingStatus(controller: any, params: any) {
    return await api().get(
      `/${controller}/getProcessingStatus/${params.id}`
    );
  },
  printReport(controller: any, id: any, fileType: any) {
  //  return api().get(`/${controller}/printReport/${id}`)
    return api().get(`/${controller}/printReport/${id}/${fileType}`, { responseType: 'json' })
},
printReportOther(controller: any, id: any) {
    //  return api().get(`/${controller}/printReport/${id}`)
      return api().get(`/${controller}/printReport/${id}`)
  },
  delete(controller: any, id: any) {
   return api().delete(`/${controller}/delete/${id}`)
  },

  get(controller: any, id: any) {
   return api().get(`/${controller}/${id}`)
 },
 
/*apiPrintReportHistoricoLevantamentoReport(id: any, fileType:any){
 return api().get(`/historicoLevantamentoReport/printReport/${id}/${fileType}`, { responseType: 'json' })
},*/

   getFormatDDMMYYYY(date: any) {
    return moment(date).format('DD-MM-YYYY');
  },

   getFormatYYYYMMDD(date: any) {
    return moment(date).format('YYYY-MM-DD');
  }


}
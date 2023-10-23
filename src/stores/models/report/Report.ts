import { Model } from 'pinia-orm';
import moment from 'moment';

export default class Report extends Model {
  static entity = 'reports';

  static async apiInitMmiaProcessing(params) {
    return await this.api().post('/mmiaReport/initReportProcess', params);
  }

  static async apiPrintMmiaReport(reportId, fileType) {
    return await this.api().get(
      `/mmiaReport/printReport/${reportId}/${fileType}`
    );
  }

  static async apiGetMmiaReport(reportId) {
    return await this.api().get(`/mmiaReport/${reportId}`);
  }

  static async getProcessingStatus(controller, params) {
    return await this.api().get(
      `/${controller}/getProcessingStatus/${params.id}`
    );
  }

  // Received Stock report
  static async apiInitReceivedStockProcessing(params) {
    return await this.api().post('/stockReportTemp/initReportProcess', params);
  }

  static async apiReceivedStockReport(reportId, fileType) {
    return await this.api().get(
      `/stockReportTemp/printReport/${reportId}/${fileType}`
    );
  }

  // Used Stock Report
  static async apiInitUsedStockProcessing(params) {
    return await this.api().post(
      '/usedStockReportTemp/initReportProcess',
      params
    );
  }

  static async apiUsedStockReport(reportId, fileType) {
    return await this.api().get(
      `/usedStockReportTemp/printReport/${reportId}/${fileType}`
    );
  }

  // Arv Daily Regster
  static async apiInitArvDailyRegisterProcessing(params) {
    return await this.api().post(
      '/arvDailyRegisterReportTemp/initReportProcess',
      params
    );
  }

  static async apiArvDailyRegisterReport(reportId, fileType) {
    return await this.api().get(
      `/arvDailyRegisterReportTemp/printReport/${reportId}/${fileType}`
    );
  }

  static async apiInitActiveInDrugStoreProcessing(params) {
    return await this.api().post(
      '/activePatientReport/initReportProcess',
      params
    );
  }

  static async apiActivePatientReport(reportId, fileType) {
    return await this.api().get(
      `/activePatientReport/printReport/${reportId}/${fileType}`
    );
  }

  static async apiInitPatientsHistryProcessing(params) {
    return await this.api().post(
      '/historicoLevantamentoReport/initReportProcess',
      params
    );
  }

  static async apiPatientsHistryReport(reportId, fileType) {
    return await this.api().get(
      `/historicoLevantamentoReport/printReport/${reportId}/${fileType}`
    );
  }

  static apiMigrationStatus() {
    return this.api().get('/migration/migrationStatus');
  }

  static apiMigrationStatusDetails(stage) {
    return this.api().get(`/migration/migrationStatusDetails/${stage}`);
  }

  static apiGetRegisteredPatientByDispenseType(year, clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getRegisteredPatientByDispenseType/${year}/${clinicId}/${serviceCode}`
    );
  }

  static apiGetPatientsFirstDispenseByGender(year, clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getPatientsFirstDispenseByGender/${year}/${clinicId}/${serviceCode}`
    );
  }

  static apiGetPatientsFirstDispenseByAge(year, clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getPatientsFirstDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );
  }

  static apiGetActivePatientPercentage(year, clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getActivePatientPercentage/${year}/${clinicId}/${serviceCode}`
    );
  }

  static apiGetDispenseByAge(year, clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );
  }

  static apiGetDispensesByGender(year, clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getDispensesByGender/${year}/${clinicId}/${serviceCode}`
    );
  }

  static apiGetStockAlert(clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getStockAlert/${clinicId}/${serviceCode}`
    );
  }

  static apiGetStockAlertAll(clinicId) {
    return this.api().get(`/dashBoard/getStockAlertAll/${clinicId}`);
  }

  static apiGetDashboardServiceButton(year, clinicId) {
    return this.api().get(
      `/dashBoard/getDashboardServiceButton/${year}/${clinicId}`
    );
  }

  static getFormatDDMMYYYY(date) {
    return moment(date).format('DD-MM-YYYY');
  }

  
  static getFormatYYYYMMDD(date) {
    return moment(date).format('YYYY-MM-DD');
  }
}

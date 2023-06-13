import { useRepo } from 'pinia-orm';
import Report from 'src/stores/models/report/Report';
import api from '../apiService/apiService';
import { useStorage } from '@vueuse/core';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const reportRepo = useRepo(Report);

export default {
  getDashboardServiceButton(year, clinicId) {
    showloading();
    return api().get(
      `/dashBoard/getDashboardServiceButton/${year}/${clinicId}`
    );
  },

  getRegisteredPatientByDispenseType(year, clinicId, serviceCode) {
    return api().get(
      `/dashBoard/getRegisteredPatientByDispenseType/${year}/${clinicId}/${serviceCode}`
    );
  },

  getPatientsFirstDispenseByAge(year, clinicId, serviceCode) {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );
  },

  getActivePatientPercentage(year, clinicId, serviceCode) {
    return api().get(
      `/dashBoard/getActivePatientPercentage/${year}/${clinicId}/${serviceCode}`
    );
  },

  getPatientsFirstDispenseByGender(year, clinicId, serviceCode) {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByGender/${year}/${clinicId}/${serviceCode}`
    );
  },

  getDispenseByAge(year, clinicId, serviceCode) {
    return api().get(
      `/dashBoard/getDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );
  },
};

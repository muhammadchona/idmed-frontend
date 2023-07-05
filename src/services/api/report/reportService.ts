import api from '../apiService/apiService';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { showloading } = useLoading();
const { isOnline } = useSystemUtils();

export default {
  getDashboardServiceButton(year, clinicId) {
    showloading();

  if (!isOnline.value) {

  } else {
    return api().get(
      `/dashBoard/getDashboardServiceButton/${year}/${clinicId}`
    );}
  },

  getRegisteredPatientByDispenseType(year, clinicId, serviceCode) {
    if (!isOnline.value) {} else {
    return api().get(
      `/dashBoard/getRegisteredPatientByDispenseType/${year}/${clinicId}/${serviceCode}`
    );}
  },

  getPatientsFirstDispenseByAge(year, clinicId, serviceCode) {
    if (!isOnline.value) {} else {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );}
  },

  getActivePatientPercentage(year, clinicId, serviceCode) {
    if (!isOnline.value) {} else {
    return api().get(
      `/dashBoard/getActivePatientPercentage/${year}/${clinicId}/${serviceCode}`
    );}
  },

  getPatientsFirstDispenseByGender(year, clinicId, serviceCode) {
    if (!isOnline.value) {} else {
    return api().get(
      `/dashBoard/getPatientsFirstDispenseByGender/${year}/${clinicId}/${serviceCode}`
    );}
  },

  getDispenseByAge(year, clinicId, serviceCode) {
    if (!isOnline.value) {} else {
    return api().get(
      `/dashBoard/getDispenseByAge/${year}/${clinicId}/${serviceCode}`
    );}
  },

  getStockAlert(clinicId, serviceCode) {
    if (!isOnline.value) {} else {
    return api().get(`/dashBoard/getStockAlert/${clinicId}/${serviceCode}`);}
  },

  getDispensesByGender(year, clinicId, serviceCode) {
    if (!isOnline.value) {} else {
    return api().get(
      `/dashBoard/getDispensesByGender/${year}/${clinicId}/${serviceCode}`
    );}
  },
};

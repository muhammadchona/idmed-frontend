import { SecUser } from 'src/stores/models/userLogin/User';
import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService';
import InteroperabilityAttributeService from 'src/services/api/InteroperabilityAttribute/InteroperabilityAttributeService';
import InteroperabilityTypeService from 'src/services/api/InteroperabilityType/InteroperabilityTypeService';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService';
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService';
import clinicService from 'src/services/api/clinicService/clinicService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';
import dispenseTypeService from 'src/services/api/dispenseType/dispenseTypeService';
import districtService from 'src/services/api/districtService/districtService';
import doctorService from 'src/services/api/doctorService/doctorService';
import drugService from 'src/services/api/drugService/drugService';
import durationService from 'src/services/api/duration/durationService';
import episodeTypeService from 'src/services/api/episodeType/episodeTypeService';
import facilityTypeService from 'src/services/api/facilityTypeService/facilityTypeService';
import formService from 'src/services/api/formService/formService';
import groupTypeService from 'src/services/api/groupType/groupTypeService';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService';
import patientTransReferenceTypeService from 'src/services/api/patientTransReferenceServiceType/PatientTransReferenceTypeService';
import provinceService from 'src/services/api/provinceService/provinceService';
import provincialServerService from 'src/services/api/provincialServerService/provincialServerService';
import spetialPrescriptionMotiveService from 'src/services/api/spetialPrescriptionMotive/spetialPrescriptionMotiveService';
import startStopReasonService from 'src/services/api/startStopReasonService/startStopReasonService';
import stockCenterService from 'src/services/api/stockCenterService/StockCenterService';
import therapeuticLineService from 'src/services/api/therapeuticLineService/therapeuticLineService';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService';
import clinicalServiceAttributeTypeService from 'src/services/api/clinicalServiceAttrTypeService/ClinicalServiceAttrTypeService';
import clinicalServiceAttributeService from 'src/services/api/clinicalServiceAttributeService/clinicalServiceAttributeService';
import stockService from 'src/services/api/stockService/StockService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import StockCenterService from 'src/services/api/stockCenterService/StockCenterService';
import patientService from 'src/services/api/patientService/patientService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import episodeService from 'src/services/api/episode/episodeService';
import packService from 'src/services/api/pack/packService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import packagedDrugService from 'src/services/api/packagedDrug/packagedDrugService';
import prescribedDrugService from 'src/services/api/prescribedDrug/prescribedDrugService';
import patientAttributeService from 'src/services/api/patientAttribute/patientAttributeService';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import roleService from 'src/services/api/role/roleService';
import menuService from 'src/services/api/menu/menuService';
import roleMenuService from 'src/services/api/roleMenu/roleMenuService';
import userService from 'src/services/api/user/userService';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import adherenceScreeningService from 'src/services/api/adherenceScreening/adherenceScreeningService';
import appointmentService from 'src/services/api/appointment/appointmentService';
import groupService from 'src/services/api/group/groupService';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import pregnancyScreeningService from 'src/services/api/pregnancyScreening/pregnancyScreeningService';
import rAMScreeningService from 'src/services/api/rAMScreening/rAMScreeningService';
import tBScreeningService from 'src/services/api/tBScreening/tBScreeningService';
import vitalSignsScreeningService from 'src/services/api/vitalSignsScreening/vitalSignsScreeningService';
import { useLoading } from '../loading/loading';

const { closeLoading, showloading } = useLoading();

export function useOnline() {
  function loadSettingParams() {
    clinicalServiceService.get(0);
    showloading();
    clinicSectorService.get(0);
    showloading();
    clinicalServiceAttributeTypeService.get(0);
    showloading();
    identifierTypeService.get(0);
    showloading();
    episodeTypeService.get(0);
    showloading();
    facilityTypeService.get(0);
    showloading();
    startStopReasonService.get(0);
    showloading();
    // clinicalServiceAttributeService.get(0);
    durationService.get(0);
    showloading();
    drugService.get(0);
    showloading();
    therapeuticalRegimenService.get(0);
    showloading();
    therapeuticLineService.get(0);
    showloading();
    formService.get(0);
    showloading();
    dispenseTypeService.get(0);
    showloading();
    InteroperabilityTypeService.get(0);
    showloading();
    // InteroperabilityAttributeService.get(0);
    healthInformationSystemService.get(0);
    showloading();
    stockCenterService.get(0);
    showloading();
    facilityTypeService.get(0);
    showloading();
    clinicSectorTypeService.get(0);
    showloading();
    patientTransReferenceTypeService.get(0);
    showloading();
    spetialPrescriptionMotiveService.get(0);
    showloading();
    provincialServerService.get(0);
    showloading();
    doctorService.get(0);
    showloading();
    dispenseModeService.get(0);
    showloading();
    groupTypeService.get();
    showloading();
    provinceService.get(0);
    showloading();
    districtService.get(0);
    showloading();
    clinicService.get(0);
    showloading();
    roleService.get(0);
    showloading();
    menuService.get(0);
    showloading();
    userService.get(0);
    showloading();
    StockOperationTypeService.get(0);
  }

  function loadPatientData() {
    patientService.doPatientsBySectorGet();
    episodeService.doEpisodesBySectorGet();
  }

  function deleteStorageInfo() {
    patientVisitDetailsService.deleteAllFromStorage();
    prescriptionDetailsService.deleteAllFromStorage();
    prescribedDrugService.deleteAllFromStorage();
    groupMemberPrescriptionService.deleteAllFromStorage();
    prescriptionService.deleteAllFromStorage();
    patientVisitService.deleteAllFromStorage();
    rAMScreeningService.deleteAllFromStorage();
    adherenceScreeningService.deleteAllFromStorage();
    pregnancyScreeningService.deleteAllFromStorage();
    tBScreeningService.deleteAllFromStorage();
    vitalSignsScreeningService.deleteAllFromStorage();
    episodeService.deleteAllFromStorage();
    packagedDrugService.deleteAllFromStorage();
    packService.deleteAllFromStorage();
    appointmentService.deleteAllFromStorage();
    groupMemberService.deleteAllFromStorage();
    groupService.deleteAllFromStorage();
    patientServiceIdentifierService.deleteAllFromStorage();
    patientService.deleteAllFromStorage();
    // reportsService.deleteAllFromStorage();
  }

  function deleteStorageWithoutPatientInfo() {
    patientVisitDetailsService.deleteAllFromStorage();
    prescriptionDetailsService.deleteAllFromStorage();
    prescribedDrugService.deleteAllFromStorage();
    groupMemberPrescriptionService.deleteAllFromStorage();
    prescriptionService.deleteAllFromStorage();
    patientVisitService.deleteAllFromStorage();
    rAMScreeningService.deleteAllFromStorage();
    adherenceScreeningService.deleteAllFromStorage();
    pregnancyScreeningService.deleteAllFromStorage();
    tBScreeningService.deleteAllFromStorage();
    vitalSignsScreeningService.deleteAllFromStorage();
    episodeService.deleteAllFromStorage();
    packagedDrugService.deleteAllFromStorage();
    packService.deleteAllFromStorage();
    appointmentService.deleteAllFromStorage();
    groupMemberService.deleteAllFromStorage();
    groupService.deleteAllFromStorage();
    patientServiceIdentifierService.deleteAllFromStorage();
    // reportsService.deleteAllFromStorage();
  }

  return {
    loadSettingParams,
    loadPatientData,
    deleteStorageInfo,
    deleteStorageWithoutPatientInfo,
  };
}

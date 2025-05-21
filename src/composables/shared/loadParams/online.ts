import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService';
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
import patientService from 'src/services/api/patientService/patientService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import episodeService from 'src/services/api/episode/episodeService';
import packService from 'src/services/api/pack/packService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import packagedDrugService from 'src/services/api/packagedDrug/packagedDrugService';
import prescribedDrugService from 'src/services/api/prescribedDrug/prescribedDrugService';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService';
import StockOperationTypeService from 'src/services/api/stockOperationTypeService/StockOperationTypeService';
import roleService from 'src/services/api/role/roleService';
import menuService from 'src/services/api/menu/menuService';
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
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import StockService from 'src/services/api/stockService/StockService';
import StockReferenceAdjustmentService from 'src/services/api/stockAdjustment/StockReferenceAdjustmentService';
import StockDestructionAdjustmentService from 'src/services/api/stockAdjustment/StockDestructionAdjustmentService';
import InventoryStockAdjustmentService from 'src/services/api/stockAdjustment/InventoryStockAdjustmentService';
import InventoryService from 'src/services/api/inventoryService/InventoryService';
import UiSectionService from 'src/services/api/menu/UiSectionService';
import permissionService from 'src/services/api/user/PermissionService';
export function useOnline() {
  async function loadConfigsSettings() {
    systemConfigsService.get(0);
    provinceService.get(0);
    districtService.get(0);
    clinicService.get(0);
    menuService.get(0);
  }

  async function loadSettingParams() {
    therapeuticalRegimenService.get(0);

    clinicalServiceService.get(0);

    clinicSectorService.get(0);

    clinicalServiceAttributeTypeService.get(0);

    identifierTypeService.get(0);

    episodeTypeService.get(0);

    facilityTypeService.get(0);

    startStopReasonService.get(0);

    durationService.get(0);

    therapeuticLineService.get(0);

    formService.get(0);

    drugService.get(0);

    dispenseTypeService.get(0);

    InteroperabilityTypeService.get(0);

    healthInformationSystemService.get(0);

    stockCenterService.get(0);

    facilityTypeService.get(0);

    clinicSectorTypeService.get(0);

    patientTransReferenceTypeService.get(0);

    spetialPrescriptionMotiveService.get(0);

    provincialServerService.get(0);

    doctorService.get(0);

    dispenseModeService.get(0);

    provinceService.get(0);

    districtService.get(0);

    roleService.get(0);

    menuService.get(0);

    userService.get(0);

    StockOperationTypeService.get(0);

    UiSectionService.get(0);

    groupTypeService.get();
    permissionService.loadPermissions();
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
    StockService.deleteAllFromStorage();
    StockReferenceAdjustmentService.deleteAllFromStorage();
    StockDestructionAdjustmentService.deleteAllFromStorage();
    InventoryStockAdjustmentService.deleteAllFromStorage();
    InventoryService.deleteAllFromStorage();
    // reportsService.deleteAllFromStorage();
  }

  function deleteDexieInfo() {
    patientVisitDetailsService.deleteAllFromDexie();
    prescriptionDetailsService.deleteAllFromDexie();
    prescribedDrugService.deleteAllFromDexie();
    // groupMemberPrescriptionService.deleteAllFromDexie();
    prescriptionService.deleteAllFromDexie();
    patientVisitService.deleteAllFromDexie();
    rAMScreeningService.deleteAllFromDexie();
    adherenceScreeningService.deleteAllFromDexie();
    pregnancyScreeningService.deleteAllFromDexie();
    tBScreeningService.deleteAllFromDexie();
    vitalSignsScreeningService.deleteAllFromDexie();
    episodeService.deleteAllFromDexie();
    packagedDrugService.deleteAllFromDexie();
    packService.deleteAllFromDexie();
    appointmentService.deleteAllFromDexie();
    groupMemberService.deleteAllFromDexie();
    groupService.deleteAllFromDexie();
    patientServiceIdentifierService.deleteAllFromDexie();
    patientService.deleteAllFromDexie();
    StockService.deleteAllFromDexie();
    StockReferenceAdjustmentService.deleteAllFromDexie();
    // StockDestructionAdjustmentService.deleteAllFromDexie();
    InventoryStockAdjustmentService.deleteAllFromDexie();
    InventoryService.deleteAllFromDexie();
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
    deleteDexieInfo,
    deleteStorageWithoutPatientInfo,
    loadConfigsSettings,
  };
}

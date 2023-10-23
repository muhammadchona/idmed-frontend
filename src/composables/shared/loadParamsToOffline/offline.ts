import NanohealthInformationSystemService from 'src/services/Synchronization/HealthInformationSystem/NanohealthInformationSystemService';
import NanoInteroperabilityAttributeService from 'src/services/Synchronization/InteroperabilityAttribute/NanoInteroperabilityAttributeService';
import NanoInteroperabilityTypeService from 'src/services/Synchronization/InteroperabilityType/NanoInteroperabilityTypeService';
import NanoclinicSectorService from 'src/services/Synchronization/clinicSectorService/NanoclinicSectorService';
import NanoclinicSectorTypeService from 'src/services/Synchronization/clinicSectorTypeService/NanoclinicSectorTypeService';
import NanoclinicService from 'src/services/Synchronization/clinicService/NanoclinicService';
import NanoclinicalServiceAttributeService from 'src/services/Synchronization/clinicalServiceAttributeService/NanoclinicalServiceAttributeService';
import NanoclinicalServiceService from 'src/services/Synchronization/clinicalServiceService/NanoclinicalServiceService';
import NanodispenseModeService from 'src/services/Synchronization/dispenseMode/NanodispenseModeService';
import NanodispenseTypeService from 'src/services/Synchronization/dispenseType/NanodispenseTypeService';
import NanodistrictService from 'src/services/Synchronization/districtService/NanodistrictService';
import NanodoctorService from 'src/services/Synchronization/doctorService/NanodoctorService';
import NanodrugService from 'src/services/Synchronization/drugService/NanodrugService';
import NanodurationService from 'src/services/Synchronization/duration/NanodurationService';
import NanoepisodeService from 'src/services/Synchronization/episode/NanoepisodeService';
import NanoepisodeTypeService from 'src/services/Synchronization/episodeType/NanoepisodeTypeService';
import NanofacilityTypeService from 'src/services/Synchronization/facilityTypeService/NanofacilityTypeService';
import NanoformService from 'src/services/Synchronization/formService/NanoformService';
import NanoidentifierTypeService from 'src/services/Synchronization/identifierTypeService/NanoidentifierTypeService';
import NanopackService from 'src/services/Synchronization/pack/NanopackService';
import NanopackagedDrugService from 'src/services/Synchronization/packagedDrug/NanopackagedDrugService';
import NanopatientAttributeService from 'src/services/Synchronization/patientAttribute/NanopatientAttributeService';
import NanopatientService from 'src/services/Synchronization/patientService/NanopatientService';
import NanopatientServiceIdentifierService from 'src/services/Synchronization/patientServiceIdentifier/NanopatientServiceIdentifierService';
import NanoPatientTransReferenceTypeService from 'src/services/Synchronization/patientTransReferenceServiceType/NanoPatientTransReferenceTypeService';
import NanopatientVisitService from 'src/services/Synchronization/patientVisit/NanopatientVisitService';
import NanopatientVisitDetailsService from 'src/services/Synchronization/patientVisitDetails/NanopatientVisitDetailsService';
import NanoprescribedDrugService from 'src/services/Synchronization/prescribedDrug/NanoprescribedDrugService';
import NanoprescriptionService from 'src/services/Synchronization/prescription/NanoprescriptionService';
import NanoprescriptionDetailsService from 'src/services/Synchronization/prescriptionDetails/NanoprescriptionDetailsService';
import NanoprovinceService from 'src/services/Synchronization/provinceService/NanoprovinceService';
import NanoprovincialServerService from 'src/services/Synchronization/provincialServerService/NanoprovincialServerService';
import NanospetialPrescriptionMotiveService from 'src/services/Synchronization/spetialPrescriptionMotive/NanospetialPrescriptionMotiveService';
import NanostartStopReasonService from 'src/services/Synchronization/startStopReasonService/NanostartStopReasonService';
import NanoStockCenterService from 'src/services/Synchronization/stockCenter/NanoStockCenterService';
import NanoStockOperationTypeService from 'src/services/Synchronization/stockOperationType/NanoStockOperationTypeService';
import NanotherapeuticLineService from 'src/services/Synchronization/therapeuticLineService/NanotherapeuticLineService';
import NanotherapeuticRegimenService from 'src/services/Synchronization/therapeuticRegimenService/NanotherapeuticRegimenService';
import NanoGroupTypeService from 'src/services/Synchronization/groupType/NanoGroupTypeService';
import episodeService from 'src/services/api/episode/episodeService';
import patientService from 'src/services/api/patientService/patientService';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import adherenceScreeningService from 'src/services/api/adherenceScreening/adherenceScreeningService';
import appointmentService from 'src/services/api/appointment/appointmentService';
import groupService from 'src/services/api/group/groupService';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import packService from 'src/services/api/pack/packService';
import packagedDrugService from 'src/services/api/packagedDrug/packagedDrugService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import pregnancyScreeningService from 'src/services/api/pregnancyScreening/pregnancyScreeningService';
import prescribedDrugService from 'src/services/api/prescribedDrug/prescribedDrugService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService';
import rAMScreeningService from 'src/services/api/rAMScreening/rAMScreeningService';
import tBScreeningService from 'src/services/api/tBScreening/tBScreeningService';
import vitalSignsScreeningService from 'src/services/api/vitalSignsScreening/vitalSignsScreeningService';

export function useOffline() {
  async function loadSettingParamsToOffline() {
    //  await NanoclinicSectorTypeService.getFromBackEnd(0);
    //  await NanoclinicSectorService.getFromBackEnd(0);
    NanoclinicalServiceService.getFromBackEnd(0);
    NanoclinicalServiceAttributeService.getFromBackEnd(0);
    NanoidentifierTypeService.getFromBackEnd(0);
    NanoepisodeTypeService.getFromBackEnd(0);
    NanofacilityTypeService.getFromBackEnd(0);
    NanostartStopReasonService.getFromBackEnd(0);
    NanoclinicalServiceAttributeService.getFromBackEnd(0);
    NanodurationService.getFromBackEnd(0);
    NanotherapeuticRegimenService.getFromBackEnd(0);
    NanotherapeuticLineService.getFromBackEnd(0);
    NanoformService.getFromBackEnd(0);
    NanodispenseTypeService.getFromBackEnd(0);
    NanoInteroperabilityTypeService.getFromBackEnd(0);
    NanoInteroperabilityAttributeService.getFromBackEnd(0);
    NanohealthInformationSystemService.getFromBackEnd(0);
    NanofacilityTypeService.getFromBackEnd(0);

    NanoPatientTransReferenceTypeService.getFromBackEnd(0);
    NanospetialPrescriptionMotiveService.getFromBackEnd(0);
    NanoprovincialServerService.getFromBackEnd(0);
    NanodoctorService.getFromBackEnd(0);
    NanodispenseModeService.getFromBackEnd(0);
    // NanogroupTypeService.getFromBackEnd(0);
    NanoprovinceService.getFromBackEnd(0);
    NanodistrictService.getFromBackEnd(0);
    NanoclinicService.getFromBackEnd(0);
    NanoStockCenterService.getFromBackEnd(0);
    NanoStockOperationTypeService.getFromBackEnd(0);
    NanoGroupTypeService.getFromBackEnd(0);
  }

  async function loadPatientDataToOffline() {
    /*
    NanopatientService.getFromBackEnd(0);
    NanopatientAttributeService.getFromBackEnd(0);
    NanopatientServiceIdentifierService.getFromBackEnd(0);
    NanopatientVisitService.getFromBackEnd(0);
    NanopatientVisitDetailsService.getFromBackEnd(0);
    NanoepisodeService.getFromBackEnd(0);
    NanopackService.getFromBackEnd(0);
    NanoprescriptionService.getFromBackEnd(0);
    NanoprescriptionDetailsService.getFromBackEnd(0);
    NanopackagedDrugService.getFromBackEnd(0);
    NanoprescribedDrugService.getFromBackEnd(0);
    */
    await NanoclinicSectorService.getFromBackEnd(0);
    await NanoclinicSectorTypeService.getFromBackEnd(0);
    await patientService.doPatientsBySectorGet();
    await episodeService.doEpisodesBySectorGet();
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
    patientServiceIdentifierService.deleteAllFromStorage();
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
    loadSettingParamsToOffline,
    loadPatientDataToOffline,
    deleteStorageInfo,
    deleteStorageWithoutPatientInfo,
  };
}

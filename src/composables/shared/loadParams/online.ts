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

export function useOnline() {
  function loadSettingParams() {
    clinicalServiceService.get(0);
    clinicSectorService.get(0);
    //  ClinicalServiceAttributeType.get(0);
    identifierTypeService.get(0);
    episodeTypeService.get(0);
    facilityTypeService.get(0);
    startStopReasonService.get(0);
    //  ClinicalServiceAttribute.get(0);
    durationService.get(0);
    drugService.get(0);
    therapeuticalRegimenService.get(0);
    therapeuticLineService.get(0);
    formService.get(0);
    dispenseTypeService.get(0);
    InteroperabilityTypeService.get(0);
    InteroperabilityAttributeService.get(0);
    healthInformationSystemService.get(0);
    stockCenterService.get(0);
    facilityTypeService.get(0);
    clinicSectorTypeService.get(0);
    patientTransReferenceTypeService.get(0);
    spetialPrescriptionMotiveService.get(0);
    provincialServerService.get(0);
    doctorService.get(0);
    dispenseModeService.get(0);
    groupTypeService.get(0);
    provinceService.get(0);
    districtService.get(0);
    clinicService.get(0);
  }

  return { loadSettingParams };
}

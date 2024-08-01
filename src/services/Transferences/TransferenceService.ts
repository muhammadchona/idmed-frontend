import provinceService from 'src/services/api/provinceService/provinceService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import axios from 'axios';
import Clinic from 'src/stores/models/clinic/Clinic';
import Patient from 'src/stores/models/patient/Patient';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import District from 'src/stores/models/district/District';
import ClinicalService from 'src/stores/models/ClinicalService/ClinicalService';
import { ClinicSector } from 'src/stores/models/clinic/ClinicSector';
import IdentifierType from 'src/stores/models/identifierType/IdentifierType';
import EpisodeType from 'src/stores/models/episodeType/EpisodeType';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import Drug from 'src/stores/models/drug/Drug';
import TherapeuticRegimen from 'src/stores/models/therapeuticRegimen/TherapeuticRegimen';
import TherapeuticLine from 'src/stores/models/therapeuticLine/TherapeuticLine';
import DispenseType from 'src/stores/models/dispenseType/DispenseType';
import Pack from 'src/stores/models/packaging/Pack';
import Prescription from 'src/stores/models/prescription/Prescription';
import Episode from 'src/stores/models/episode/Episode';
// import PatientVisitDetails from 'src/stores/models/patientVisitDetails/PatientVisitDetails'
// import PatientVisit from 'src/stores/models/patientVisit/PatientVisit'
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import Duration from 'src/stores/models/duration/Duration';
import Doctor from 'src/stores/models/doctor/Doctor';
import { SessionStorage } from 'quasar';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import PatientVisitDetails from 'src/stores/models/patientVisitDetails/PatientVisitDetails';
import DispenseMode from 'src/stores/models/dispenseMode/DispenseMode';
import { v4 as uuidv4 } from 'uuid';

const { alertSucess, alertError, alertInfo } = useSwal();
export default {
  checkProvincialServer() {
    // const $q = useQuasar()
    const openProvincialServer = axios.create({
      baseURL: 'http://dev.fgh.org.mz:3910',
    });
    openProvincialServer
      .post('/rpc/login', {
        username: 'postgres',
        pass: 'postgres',
      })
      .then((response) => {
        if (response.data[0].token === undefined) {
          alertInfo(
            'O Utilizador  não se encontra no OpenMRS ou serviço rest no OpenMRS não se encontra em funcionamento.'
          );
        } else {
          alertSucess(
            'Pesquisa de Pacientes no Servidor Provincial em funcionamento!!'
          );
        }
      })
      .catch((error) => {
        if (String(error).includes('Network Error')) {
          alertError(
            'O Servidor OpenMRS encontra-se desligado ou existe um problema de conexão!'
          );
        } else {
          alertError('Falha inesperado, por favor contacte o administrador.');
        }
      });
  },
  provincialServiceSearch(
    currPatient: any,
    patients: any,
    transferencePatientData: any
  ) {
    const openProvincialServer = axios.create({
      baseURL: 'http://localhost:8086',
    });
    const nid = currPatient.identifiers[0].value.replaceAll('/', '-');

    if (nid.length <= 0) {
      alertError(
        'Não contem nenhum parâmetro de pesquisa. Por favor, indtroduza um Nº de Identificador'
      );
    } else {
      openProvincialServer
        .get('/patientTransReference/getPatientNid/' + nid)
        .then((response) => {
          patients = [];
          if (response.data !== null) {
            const localpatient = new Patient({
              id: uuidv4(),
              identifiers: [],
            });
            patients.push(
              this.buildLocalPatientTransfered(localpatient, response.data)
            );
            transferencePatientData.push(response.data);
          } else {
            alertError(
              'Nenhum resultado encontrado para o identificador ' + nid
            );
          }
        });
    }
  },
  buildLocalPatientTransfered(localpatient: any, idmedPatientTransfered: any) {
    localpatient.firstNames = idmedPatientTransfered.firstNames;
    localpatient.middleNames = idmedPatientTransfered.middleNames;
    localpatient.lastNames = idmedPatientTransfered.lastNames;
    localpatient.gender = idmedPatientTransfered.gender;
    localpatient.dateOfBirth = idmedPatientTransfered.dateOfBirth;
    localpatient.cellphone = idmedPatientTransfered.cellphone;
    localpatient.alternativeCellphone =
      idmedPatientTransfered.alternativeCellphone;
    localpatient.address = idmedPatientTransfered.address;
    localpatient.addressReference = idmedPatientTransfered.addressReference;
    localpatient.accountstatus = idmedPatientTransfered.accountstatus;
    // localpatient.hisUuid = idmedPatientTransfered.hisUuid
    // localpatient.hisLocation = idmedPatientTransfered.hisLocation
    // localpatient.hisLocationName = idmedPatientTransfered.hisLocationName
    //  localpatient.his = (this.selectedDataSources.id.length > 4) ? this.selectedDataSources : null
    //  localpatient.identifiers.push(this.buildPatientIdentifierFromIdmed(idmedPatientTransfered))
    //  localpatient.patientVisits.push(this.buildPatientVisitFromIdmed(idmedPatientTransfered))
    localpatient.province = provinceService
      .getAllProvincesByCode(idmedPatientTransfered.provinceCode)
      .first();
    localpatient.district = District.query()
      .with('province')
      .where('code', idmedPatientTransfered.districtCode)
      .first();
    return localpatient;
  },
  buildPatientIdentifierFromIdmed(idmedPatientTransfered) {
    const psi = new PatientServiceIdentifier({ id: uuidv4() });
    psi.startDate = idmedPatientTransfered.startDate;
    psi.value = idmedPatientTransfered.patientNid + '9989';
    psi.state = 'Activo';
    psi.prefered = true;
    psi.service = ClinicalService.query()
      .with('identifierType')
      .where('code', idmedPatientTransfered.clinicalServiceCode)
      .first();
    psi.identifierType = IdentifierType.query()
      .where('code', idmedPatientTransfered.identifierTypeCode)
      .first();
    psi.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('id', SessionStorage.getItem('currClinic').id)
      .first();
    //  psi.episodes.push(this.buildEpisodeFromIdmed(idmedPatientTransfered))
    return psi;
  },
  buildEpisodeFromIdmed(idmedPatientTransfered) {
    const episode = new Episode({ id: uuidv4() });
    episode.episodeDate = idmedPatientTransfered.episodeDate;
    episode.startStopReason = StartStopReason.query()
      .where('code', 'TRANSFERIDO_DE')
      .first();
    episode.episodeType = EpisodeType.query().where('code', 'INICIO').first();
    episode.creationDate = new Date();
    episode.clinicSector = ClinicSector.query()
      .with('clinicSectorType')
      .with('clinic')
      .where('code', 'TARV')
      .first();
    //  episode.patientServiceIdentifier = this.buildPatientIdentifierFromIdmed(idmedPatientTransfered)
    episode.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('id', SessionStorage.getItem('currClinic').id)
      .first();
    // episode.patientVisitDetails.push(this.buildPatientVisitDetailsFromIdmed(idmedPatientTransfered))
    episode.notes = 'Tranferencia';
    return episode;
  },
  buildPrescriptionFromIdmed(idmedPatientTransfered) {
    const prescription = new Prescription({ id: uuidv4() });
    prescription.prescriptionDate = idmedPatientTransfered.prescriptionDate;
    prescription.expiryDate = idmedPatientTransfered.expiryDate;
    prescription.prescriptionSeq = idmedPatientTransfered.prescriptionSeq;
    prescription.patientType = idmedPatientTransfered.patientType;
    prescription.patientStatus = idmedPatientTransfered.patientStatus;
    prescription.duration = Duration.query()
      .where('weeks', idmedPatientTransfered.weeksDuration)
      .first();
    prescription.doctor = Doctor.query().where('lastname', 'Generic').first();
    prescription.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();

    const prescriptionDetails = new PrescriptionDetail();
    prescriptionDetails.reasonForUpdate =
      idmedPatientTransfered.reasonForUpdate;
    prescriptionDetails.therapeuticLineCode = TherapeuticLine.query()
      .where('code', idmedPatientTransfered.therapeuticLineCode)
      .first();
    prescriptionDetails.therapeuticRegimen = TherapeuticRegimen.query()
      .where('code', idmedPatientTransfered.therapeuticRegimenCode)
      .first();
    prescriptionDetails.dispenseType = DispenseType.query()
      .where('code', idmedPatientTransfered.dispenseTypeCode)
      .first();
    prescriptionDetails.prescription = prescription;
    const prescribedDrugsLocal = [];
    const obj = idmedPatientTransfered.jsonPrescribedDrug;
    obj.forEach((obj1) => {
      const prescribedDrug = new PrescribedDrug();
      prescribedDrug.drug = Drug.query()
        .with('form')
        .where('fnmCode', obj1.drugCode)
        .first();
      prescribedDrug.amtPerTime = obj1.amtPerTime;
      prescribedDrug.timesPerDay = obj1.timesPerDay;
      prescribedDrug.prescribedQty = 0;
      prescribedDrug.form = obj1.form;
      // prescribedDrug.prescription = prescription
      prescribedDrugsLocal.push(prescribedDrug);
    });
    prescription.prescribedDrugs = prescribedDrugsLocal;
    return prescription;
  },
  buildPackFromIdmed(idmedPatientTransfered) {
    const pack = new Pack({ id: uuidv4() });
    pack.dateLeft = idmedPatientTransfered.dateLeft;
    pack.dateReceived = idmedPatientTransfered.dateReceived;
    pack.modified = idmedPatientTransfered.modified;
    pack.packDate = idmedPatientTransfered.packDate;
    pack.pickupDate = idmedPatientTransfered.pickupDate;
    pack.nextPickUpDate = idmedPatientTransfered.nextPickUpDate;
    pack.weeksSupply = idmedPatientTransfered.weeksSupply;
    pack.dateReturned = idmedPatientTransfered.dateReturned;
    pack.stockReturned = idmedPatientTransfered.stockReturned;
    pack.packageReturned = idmedPatientTransfered.packageReturned;
    pack.reasonForPackageReturn = idmedPatientTransfered.reasonForPackageReturn;
    pack.dispenseMode = DispenseMode.query()
      .where('code', idmedPatientTransfered.dispenseModeCode)
      .first();
    pack.syncStatus = 'N';
    pack.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();
    const packDrugsLocal = [];
    const obj = idmedPatientTransfered.jsonPackagedDrug;
    obj.forEach((obj1) => {
      const packageDrug = new PackagedDrug({ id: uuidv4() });
      packageDrug.drug = Drug.query()
        .with('form')
        .where('fnmCode', obj1.drugCode)
        .first();
      packageDrug.quantitySupplied = 0;
      packageDrug.nextPickUpDate = obj1.nextPickUpDate;
      packageDrug.toContinue = obj1.toContinue;
      packageDrug.creationDate = new Date();
      // packageDrug.pack = pack
      packDrugsLocal.push(packageDrug);
    });
    pack.packagedDrugs = packDrugsLocal;
    return pack;
  },
  buildPatientVisitFromIdmed(idmedPatientTransfered) {
    const patientVisit = new PatientVisit({ id: uuidv4() });
    patientVisit.visitDate = idmedPatientTransfered.patientVisitDate;
    patientVisit.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();

    const patientVisitDetails = new PatientVisitDetails({ id: uuidv4() });
    patientVisitDetails.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();
    // patientVisitDetails.patientVisit = patientVisit
    // patientVisitDetails.patientVisit = patientVisit
    patientVisitDetails.prescription = this.buildPrescriptionFromIdmed(
      idmedPatientTransfered
    );
    patientVisitDetails.pack = this.buildPackFromIdmed(idmedPatientTransfered);
    // patientVisitDetails.episode = this.buildEpisodeFromIdmed(idmedPatientTransfered)
    patientVisit.patientVisitDetails.push(patientVisitDetails);
    return patientVisit;
  },
  buildPatientVisitDetailsFromIdmed(idmedPatientTransfered) {
    const patientVisit = new PatientVisit({ id: uuidv4() });
    patientVisit.visitDate = idmedPatientTransfered.patientVisitDate;
    patientVisit.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();

    const patientVisitDetails = new PatientVisitDetails({ id: uuidv4() });
    patientVisitDetails.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();
    patientVisitDetails.patientVisit = patientVisit;
    patientVisitDetails.prescription = this.buildPrescriptionFromIdmed(
      idmedPatientTransfered
    );
    patientVisitDetails.pack = this.buildPackFromIdmed(idmedPatientTransfered);
    // patientVisitDetails.episode = this.buildEpisodeFromIdmed(idmedPatientTransfered)
    // patientVisit.patientVisitDetails.push(patientVisitDetails)
    return patientVisitDetails;
  },
  getPatientVisitWithDetailsPRescriptionAndPack(idmedPatientTransfered) {
    return this.buildPatientVisitFromIdmed(idmedPatientTransfered);
  },
  apiSavePrescriptionPackPatientVisit(patientVisit) {
    // Prescription.apiSave(patientVisit.patientVisitDetails[0].prescription).
  },
};

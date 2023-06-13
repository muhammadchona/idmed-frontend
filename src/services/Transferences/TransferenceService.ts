import axios from 'axios';
import Clinic from 'src/stores/models/clinic/Clinic';
import Patient from 'src/stores/models/patient/Patient';
import PrescriptionDetail from '../../store/models/prescriptionDetails/PrescriptionDetail';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import Province from 'src/stores/models/province/Province';
import District from 'src/stores/models/district/District';
import ClinicalService from 'src/stores/models/ClinicalService/ClinicalService';
import ClinicSector from 'src/stores/models/clinicSector/ClinicSector';
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
export default {
  checkProvincialServer($q) {
    // const $q = useQuasar()
    const openProvincialServer = axios.create({
      baseURL: 'http://dev.fgh.org.mz:3110',
    });
    openProvincialServer
      .post('/rpc/login', {
        username: 'postgres',
        pass: 'postgres',
      })
      .then((response) => {
        if (response.data[0].token === undefined) {
          $q.notify({
            color: 'negative',
            position: 'center',
            message:
              'O Utilizador ' +
              this.username +
              ' não se encontra no OpenMRS ou serviço rest no OpenMRS não se encontra em funcionamento.',
            icon: 'report_problem',
          });
        } else {
          $q.notify({
            color: 'positive',
            position: 'center',
            message:
              'Pesquisa de Pacientes no Servidor Provincial em funcionamento!!',
            icon: 'verified_user',
          });
        }
      })
      .catch((error) => {
        if (String(error).includes('Network Error')) {
          $q.notify({
            color: 'negative',
            position: 'center',
            message:
              'O Servidor OpenMRS encontra-se desligado ou existe um problema de conexão!',
            icon: 'report_problem',
          });
        } else {
          $q.notify({
            color: 'negative',
            position: 'center',
            message: 'Falha inexperada, por favor contacte o adminitrador.',
            icon: 'report_problem',
          });
        }
      });
    setTimeout(() => {
      $q.loading.hide();
    }, 400);
  },
  provincialServiceSearch($q, currPatient, patients, transferencePatientData) {
    const openProvincialServer = axios.create({
      baseURL: 'http://localhost:8884',
    });
    const nid = currPatient.identifiers[0].value.replaceAll('/', '-');

    if (nid.length <= 0) {
      $q.notify({
        color: 'negative',
        position: 'center',
        message:
          'Não contem nenhum parâmetro de pesquisa. Por favor, indtroduza um Nº de Identificador',
        icon: 'report_problem',
      });
    } else {
      openProvincialServer
        .get('/patientTransReference/getPatientNid/' + '3245233342')
        .then((response) => {
          this.patients = [];
          if (response.data !== null) {
            const localpatient = new Patient({
              identifiers: [],
            });
            patients.push(
              this.buildLocalPatientTransfered(localpatient, response.data)
            );
            transferencePatientData.push(response.data);
          } else {
            $q.notify({
              color: 'negative',
              position: 'center',
              message:
                'Nenhum resultado encontrado para o identificador ' + nid + '',
              icon: 'report_problem',
            });
          }
        });
    }
  },
  buildLocalPatientTransfered(localpatient, idmedPatientTransfered) {
    localpatient.firstNames = idmedPatientTransfered.firstNames + 'rrrrrt';
    localpatient.middleNames = idmedPatientTransfered.middleNames + 'aa';
    localpatient.lastNames =
      idmedPatientTransfered.lastNames + 'ccddaaabbbcccddd';
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
    localpatient.province = Province.query()
      .where('code', idmedPatientTransfered.provinceCode)
      .first();
    localpatient.district = District.query()
      .with('province')
      .where('code', idmedPatientTransfered.districtCode)
      .first();
    return localpatient;
  },
  buildPatientIdentifierFromIdmed(idmedPatientTransfered) {
    const psi = new PatientServiceIdentifier();
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
    const episode = new Episode();
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
    const prescription = new Prescription();
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
      prescribedDrug.qtyPrescribed = 0;
      prescribedDrug.form = obj1.form;
      // prescribedDrug.prescription = prescription
      prescribedDrugsLocal.push(prescribedDrug);
    });
    prescription.prescribedDrugs = prescribedDrugsLocal;
    return prescription;
  },
  buildPackFromIdmed(idmedPatientTransfered) {
    const pack = new Pack();
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
      const packageDrug = new PackagedDrug();
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
    const patientVisit = new PatientVisit();
    patientVisit.visitDate = idmedPatientTransfered.patientVisitDate;
    patientVisit.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();

    const patientVisitDetails = new PatientVisitDetails();
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
    const patientVisit = new PatientVisit();
    patientVisit.visitDate = idmedPatientTransfered.patientVisitDate;
    patientVisit.clinic = Clinic.query()
      .with('province')
      .with('district.province')
      .with('facilityType')
      .where('uuid', idmedPatientTransfered.originClinicUuid)
      .first();

    const patientVisitDetails = new PatientVisitDetails();
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

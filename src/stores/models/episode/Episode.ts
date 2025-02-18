import { Model } from 'pinia-orm';
import { Clinic } from '../clinic/ClinicHierarchy';
import { ClinicSector } from '../clinic/ClinicHierarchy';
import EpisodeType from '../episodeType/EpisodeType';
import PatientServiceIdentifier from '../patientServiceIdentifier/PatientServiceIdentifier';
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails';
import StartStopReason from '../startStopReason/StartStopReason';
import { v4 as uuidv4 } from 'uuid';

export default class Episode extends Model {
  static entity = 'episodes';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      episodeDate: this.attr(''),
      notes: this.attr(''),
      creationDate: this.attr(''),
      episodeType_id: this.attr(''),
      clinicSector_id: this.attr(''),
      patientServiceIdentifier_id: this.attr(''),
      startStopReason_id: this.attr(''),
      isLast: this.boolean(false),
      referralClinic_id: this.attr(''),
      syncStatus: this.attr(''),
      origin: this.attr(''),
      residentInCountry: this.boolean(true),
      // Relationships
      referralClinic: this.belongsTo(Clinic, 'referralClinic_id'),
      startStopReason: this.belongsTo(StartStopReason, 'startStopReason_id'),
      episodeType: this.belongsTo(EpisodeType, 'episodeType_id'),
      clinicSector: this.belongsTo(Clinic, 'clinicSector_id'),
      patientServiceIdentifier: this.belongsTo(
        PatientServiceIdentifier,
        'patientServiceIdentifier_id'
      ),
      patientVisitDetails: this.hasMany(PatientVisitDetails, 'episode_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}

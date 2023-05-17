import moment from 'moment';

export function usePatient() {
  function fullName(patient: any) {
    return `${patient.firstNames} ${patient.middleNames} ${patient.lastNames}`;
  }

  function isActiveOnGroupOfService(patient: any, service: any) {
    if (patient.members.length <= 0) return false;
    const isActive = patient.members.some((member: any) => {
      return (
        member.endDate === null && member.group.service.code === service.code
      );
    });
    return isActive;
  }

  function bairroName(patient: any) {
    if (patient.bairro === null) return '';
    return patient.bairro.description;
  }

  function postoAdministrativoName(patient: any) {
    if (patient.postoAdministrativo === null) return '';
    return patient.postoAdministrativo.description;
  }

  function hasIdentifiers(patient: any) {
    return patient.identifiers.length > 0;
  }

  function isMale(patient: any) {
    return patient.gender === 'Masculino';
  }

  function getOldestIdentifier(patient: any) {
    if (patient.identifiers.length <= 0) return null;
    let preferedIdentifier = '';
    Object.keys(patient.identifiers).forEach(
      function (k: any) {
        const identifier = patient.identifiers[k];
        if (preferedIdentifier === '') {
          preferedIdentifier = identifier;
        } else if (
          new Date(preferedIdentifier.startDate) >
          new Date(identifier.startDate)
        ) {
          preferedIdentifier = identifier;
        }
      }.bind(patient)
    );
    return preferedIdentifier;
  }

  function hasEpisodes(patient: any) {
    if (patient.identifiers.length <= 0) return false;
    const hasEpisode = patient.identifiers.some((identifier: any) => {
      return identifier.episodes.length > 0;
    });
    return hasEpisode;
  }

  function preferedIdentifier(patient: any) {
    if (patient.identifiers.length <= 0) return null;
    let preferedIdentifiers = null;
    Object.keys(patient.identifiers).forEach(
      function (k: any) {
        const identifier = patient.identifiers[k];
        if (identifier.prefered) {
          preferedIdentifiers = identifier;
        }
      }.bind(patient)
    );
    return preferedIdentifiers;
  }

  function hasPreferedId() {
    return preferedIdentifier !== null;
  }

  function preferedIdentifierValue(patient: any) {
    if (patient.identifiers.length <= 0) return 'Sem identificador';
    let preferedId = {};
    Object.keys(patient.identifiers).forEach(
      function (k: any) {
        const id = patient.identifiers[k];
        if (id.prefered) {
          preferedId = id;
        }
      }.bind(patient)
    );
    return preferedId.value;
  }

  function hasOneAndClosedIdentifier(patient: any) {
    if (patient.identifiers.length > 1 && hasEpisodes(patient)) return false;
    return (
      patient.identifiers.length === 1 &&
      patient.identifiers[0].endDate !== null
    );
  }

  function age(patient: any) {
    return moment().diff(moment(patient.dateOfBirth, 'YYYY-MM-DD'), 'years');
  }

  function getClassName() {
    return 'patient';
  }

  return {
    fullName,
    isActiveOnGroupOfService,
    bairroName,
    postoAdministrativoName,
    hasIdentifiers,
    isMale,
    getOldestIdentifier,
    hasEpisodes,
    preferedIdentifier,
    hasPreferedId,
    preferedIdentifierValue,
    hasOneAndClosedIdentifier,
    age,
    getClassName,
  };
}

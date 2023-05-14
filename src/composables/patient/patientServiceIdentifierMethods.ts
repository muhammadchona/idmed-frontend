export function usePatientServiceIdentifier() {
  function isPrefered(patientServiceIdentifier: any) {
    return patientServiceIdentifier.prefered;
  }

  function lastStartEpisodeWithPrescription(patientServiceIdentifier: any) {
    let lastVisit = '';
    patientServiceIdentifier.patientVisitDetails.forEach((visit: any) => {
      if (lastVisit === '' || lastVisit === null) {
        lastVisit = visit;
      } else if (visit.pack.pickupDate > lastVisit.pack.pickupDate) {
        lastVisit = visit;
      }
    });
    return lastVisit.pack;
  }

  function lastVisitPrescription(patientServiceIdentifier: any) {
    let lastVisit = '';
    patientServiceIdentifier.episodes.forEach((episode: any) => {
      episode.patientVisitDetails.forEach((pvd: any) => {
        if (lastVisit === null || lastVisit === '') {
          lastVisit = pvd;
        } else if (pvd.pack.pickupDate > lastVisit.pack.pickupDate) {
          lastVisit = pvd;
        }
      });
    });
    return lastVisit;
  }

  function lastEpisode(patientServiceIdentifier: any) {
    let lastVisit = '';
    patientServiceIdentifier.episodes.forEach((visit: any) => {
      if (lastVisit === null || lastVisit === '') {
        lastVisit = visit;
      } else if (visit.episodeDate > lastVisit.episodeDate) {
        lastVisit = visit;
      }
    });
    return lastVisit;
  }

  function checkClinicalServiceAttr(
    patientServiceIdentifier: any,
    attr: string
  ) {
    if (
      patientServiceIdentifier.service === '' ||
      patientServiceIdentifier.service === null
    )
      return false;
    const has = patientServiceIdentifier.service.attributes.some(
      (attribute: any) => {
        return attribute.clinicalServiceAttributeType.code === attr;
      }
    );
    return has;
  }

  function hasTherapeuticalRegimen(patientServiceIdentifier: any) {
    return checkClinicalServiceAttr(
      patientServiceIdentifier,
      'THERAPEUTICAL_REGIMEN'
    );
  }

  function hasTherapeuticalLine(patientServiceIdentifier: any) {
    return checkClinicalServiceAttr(
      patientServiceIdentifier,
      'THERAPEUTICAL_LINE'
    );
  }

  function hasPatientType(patientServiceIdentifier: any) {
    return checkClinicalServiceAttr(patientServiceIdentifier, 'PATIENT_TYPE');
  }

  function hasPrescriptionChangeMotive(patientServiceIdentifier: any) {
    return checkClinicalServiceAttr(
      patientServiceIdentifier,
      'PRESCRIPTION_CHANGE_MOTIVE'
    );
  }

  function hasEpisodes(patientServiceIdentifier: any) {
    return patientServiceIdentifier.episodes.length > 0;
  }

  function canBeEdited(patientServiceIdentifier: any) {
    if (!patientServiceIdentifier.hasEpisodes()) return true;
    let canEdit = true;
    Object.keys(patientServiceIdentifier.episodes).forEach(
      function (k: any) {
        const eps = patientServiceIdentifier.episodes[k];
        if (canEdit) {
          if (eps.hasVisits()) {
            canEdit = false;
          }
        }
      }.bind(patientServiceIdentifier)
    );
    return canEdit;
  }

  function getClassName() {
    return 'patientServiceIdentifier';
  }

  return {
    isPrefered,
    lastStartEpisodeWithPrescription,
    lastVisitPrescription,
    lastEpisode,
    checkClinicalServiceAttr,
    hasTherapeuticalRegimen,
    hasTherapeuticalLine,
    hasPatientType,
    hasPrescriptionChangeMotive,
    hasEpisodes,
    canBeEdited,
    getClassName,
  };
}

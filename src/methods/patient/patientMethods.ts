import moment from 'moment';


  fullName() {
    return  `${firstNames} ${middleNames} ${lastNames}`;
  }

  isActiveOnGroupOfService(service) {
    if (members.length <= 0) return false;
    const isActive = members.some((member) => {
      return (
        member.endDate === null && member.group.service.code === service.code
      );
    });
    return isActive;
  }

  bairroName() {
    if (bairro === null) return '';
    return bairro.description;
  }

  postoAdministrativoName() {
    if (postoAdministrativo === null) return '';
    return postoAdministrativo.description;
  }

  hasIdentifiers() {
    return identifiers.length > 0;
  }

  isMale() {
    return gender === 'Masculino';
  }

  getOldestIdentifier() {
    if (!hasIdentifiers()) return null;
    let preferedId = '';
    Object.keys(identifiers).forEach(
      function (k) {
        const id = identifiers[k];
        if (preferedId === '') {
          preferedId = id;
        } else if (new Date(preferedId.startDate) > new Date(id.startDate)) {
          preferedId = id;
        }
      }.bind(this)
    );
    return preferedId;
  }

  hasEpisodes() {
    if (identifiers.length <= 0) return false;
    const hasEpisodes = identifiers.some((identifier) => {
      return identifier.episodes.length > 0;
    });
    return hasEpisodes;
  }

  preferedIdentifier() {
    if (identifiers.length <= 0) return null;
    let preferedId = null;
    Object.keys(identifiers).forEach(
      function (k) {
        const id = identifiers[k];
        if (id.prefered) {
          preferedId = id;
        }
      }.bind(this)
    );
    return preferedId;
  }

  hasPreferedId() {
    return preferedIdentifier() !== null;
  }

  preferedIdentifierValue() {
    if (identifiers.length <= 0) return 'Sem identificador';
    let preferedId = {};
    Object.keys(identifiers).forEach(
      function (k) {
        const id = identifiers[k];
        if (id.prefered) {
          preferedId = id;
        }
      }.bind(this)
    );
    return preferedId.value;
  }

  hasOneAndClosedIdentifier() {
    if (identifiers.length > 1 && hasEpisodes) return false;
    return (
      identifiers.length === 1 && identifiers[0].endDate !== null
    );
  }

  age() {
    return moment().diff(moment(dateOfBirth, 'YYYY-MM-DD'), 'years');
  }

  static async apiFetchById(id) {
    return await api().get(`/patient/${id}`);
  }

  static async apiSearch(patient) {
    return await api().post('/patient/search', patient);
  }

  static async apisearchByParam(searchParam, clinicId) {
    return await api().get(
      `/patient/searchByParam/${searchParam}/${clinicId}`
    );
  }

  static async apiSave(patient, isNew) {
    if (isNew) {
      return await api().post('/patient', patient);
    } else {
      return await api().patch('/patient/' + patient.id, patient);
    }
  }

  static async apiUpdate(patient) {
    return await api().patch('/patient/' + patient.id, patient);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await api().get(
      '/patient/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(patient) {
    return db.newDb().collection('patients').add(patient);
  }

  static localDbGetById(id) {
    return db.newDb().collection('patients').doc({ id: id }).get();
  }

  static async localDbGetAll() {
    return await db.newDb().collection('patients').get();
  }

  static localDbUpdate(patient) {
    return db
      .newDb()
      .collection('patients')
      .doc({ id: patient.id })
      .set(patient);
  }

  static localDbUpdateAll(patients) {
    return db.newDb().collection('patients').set(patients);
  }

  static localDbDelete(patientId) {
    return db.newDb().collection('patients').doc({ id: patientId }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('patients').delete();
  }

  static async syncPatient(patient) {
    if (patient.syncStatus === 'R') await apiSave(patient);
    if (patient.syncStatus === 'U') await apiUpdate(patient);
  }

  static getClassName() {
    return 'patient';
  }

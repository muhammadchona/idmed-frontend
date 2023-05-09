
static async apiFetchById(id) {
  return await this.api().get(`/patientVisit/${id}`);
}

static async apiSave(patientVisit, newData) {
  return await this.api().post('/patientVisit', patientVisit);
}

static async apiMySave(patientVisit) {
  return await this.api().post('/patientVisit/mySave', patientVisit);
}

static async apiSaveRec(patientVisit) {
  return await this.api().post('/patientVisit/saveRecord', patientVisit);
}

static async apiUpdate(patientVisit) {
  return await this.api().patch(
    `/patientVisit/${patientVisit.id}`,
    patientVisit
  );
}

static async apiRemove(id) {
  return await this.api().delete(`/patientVisit/${id}`);
}

static async apiGetAllByPatientId(patientId) {
  return await this.api().get('/patientVisit/patient/' + patientId);
}

static async apiGetAllByClinicId(clinicId, offset, max) {
  return await this.api().get(
    '/patientVisit/clinic/' + clinicId + '?offset=0&max=100'
  );
}

static async apiGetAllLastWithScreeningOfClinic(clinicId, offset, max) {
  return await this.api().get(
    '/patientVisit/AllLastWithScreeningOfClinic/' +
      clinicId +
      '?offset=' +
      offset +
      '&max=' +
      max
  );
}

static async apiGetLastVisitOfPatient(patientId) {
  return await this.api().get(
    '/patientVisit/getLastVisitOfPatient/' + patientId
  );
}

static localDbAdd(patientVisit) {
  return db.newDb().collection('patientVisits').add(patientVisit);
}

static localDbGetById(id) {
  return db.newDb().collection('patientVisits').doc({ id: id }).get();
}

static localDbGetAll() {
  return db.newDb().collection('patientVisits').get();
}

static localDbUpdate(patientVisit) {
  return db
    .newDb()
    .collection('patientVisits')
    .doc({ id: patientVisit.id })
    .set(patientVisit);
}

static localDbUpdateAll(patientVisits) {
  return db.newDb().collection('patientVisits').set(patientVisits);
}

static localDbDelete(patientVisit) {
  return db
    .newDb()
    .collection('patientVisits')
    .doc({ id: patientVisit.id })
    .delete();
}

static localDbDeleteAll() {
  return db.newDb().collection('patientVisits').delete();
}

static getClassName() {
  return 'patientVisit';
}

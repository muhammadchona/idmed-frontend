
lastPack() {
  return this.pack;
}

static async apiFetchById(id) {
  return await this.api().get(`/patientVisitDetails/${id}`);
}

static async apiSave(patientVisitDetail) {
  return await this.api().post('/patientVisitDetails', patientVisitDetail);
}

static async apiDelete(patientVisitDetail) {
  return await this.api().delete(
    `/patientVisitDetails/${patientVisitDetail.id}`
  );
}

static async apiGetAllByClinicId(clinicId, offset, max) {
  return await this.api().get(
    '/patientVisitDetails/clinic/' +
      clinicId +
      '?offset=' +
      offset +
      '&max=' +
      max
  );
}

static async apiGetAllLastOfClinic(clinicId, offset, max) {
  return await this.api().get(
    '/patientVisitDetails/AllLastOfClinic/' +
      clinicId +
      '?offset=' +
      offset +
      '&max=' +
      max
  );
}

static async apiGetAllByEpisodeId(episodeId, offset, max) {
  return await this.api().get(
    '/patientVisitDetails/episode/' +
      episodeId +
      '?offset=' +
      offset +
      '&max=' +
      max
  );
}

static async apiGetLastByEpisodeId(episodeId) {
  return await this.api().get(
    '/patientVisitDetails/getLastByEpisodeId/' + episodeId
  );
}

static async apiGetAllofPrecription(prescriptionId) {
  return await this.api().get(
    '/patientVisitDetails/getAllofPrecription/' + prescriptionId
  );
}

static localDbAdd(patientVisitDetail) {
  return db.newDb().collection('patientVisitDetails').add(patientVisitDetail);
}

static localDbGetById(id) {
  return db.newDb().collection('patientVisitDetails').doc({ id: id }).get();
}

static async localDbGetAll() {
  return await db.newDb().collection('patientVisitDetails').get();
}

static localDbUpdate(patientVisitDetail) {
  return db
    .newDb()
    .collection('patientVisitDetails')
    .doc({ id: patientVisitDetail.id })
    .set(patientVisitDetail);
}

static localDbUpdateAll(patientVisitDetails) {
  return db
    .newDb()
    .collection('patientVisitDetails')
    .set(patientVisitDetails);
}

static localDbDelete(patientVisitDetail) {
  return db
    .newDb()
    .collection('patientVisitDetails')
    .doc({ id: patientVisitDetail.id })
    .delete();
}

static localDbDeleteAll() {
  return db.newDb().collection('patientVisitDetails').delete();
}

static localDbDeleteById(patientVisitDetailsId) {
  return db
    .newDb()
    .collection('patientVisitDetails')
    .doc({ id: patientVisitDetailsId })
    .delete();
}

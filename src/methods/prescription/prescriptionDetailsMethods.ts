
static async apiGetAllByPrescriptionId(prescriptionId) {
  return await this.api().get(
    '/prescriptionDetail/prescription/' + prescriptionId
  );
}

static async apiGetAll() {
  return await this.api().get(
    '/prescriptionDetail?offset=' + 0 + '&max=' + 200
  );
}

static async apiFetchById(id) {
  return await this.api().get(`/prescriptionDetail/${id}`);
}

static localDbAdd(prescriptionsDetail) {
  return db
    .newDb()
    .collection('prescriptionsDetails')
    .add(prescriptionsDetail);
}

static localDbGetById(id) {
  return db.newDb().collection('prescriptionsDetails').doc({ id: id }).get();
}

static localDbGetAll() {
  return db.newDb().collection('prescriptionsDetails').get();
}

static localDbUpdate(prescriptionsDetail) {
  return db
    .newDb()
    .collection('prescriptionsDetails')
    .doc({ id: prescriptionsDetail.id })
    .set(prescriptionsDetail);
}

static localDbUpdateAll(prescriptionsDetails) {
  return db
    .newDb()
    .collection('prescriptionsDetails')
    .set(prescriptionsDetails);
}

static localDbDelete(prescriptionsDetail) {
  return db
    .newDb()
    .collection('prescriptionsDetails')
    .doc({ id: prescriptionsDetail.id })
    .delete();
}

static localDbDeleteAll() {
  return db.newDb().collection('prescriptionsDetails').delete();
}

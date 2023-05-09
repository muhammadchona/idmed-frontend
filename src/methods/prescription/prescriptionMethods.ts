
calculateLeftDuration(weeksSupply) {
  if (this.leftDuration === 0) {
    this.leftDuration = Number(
      (Number(this.duration.weeks) - Number(weeksSupply)) / 4
    );
  } else {
    this.leftDuration = Number(
      (Number(this.leftDuration * 4) - Number(weeksSupply)) / 4
    );
  }
}

remainigDuration() {
  const prescriptionDuration = Number(this.duration.weeks);
  let packagedWeeks = 0;
  this.patientVisitDetails.forEach((pvd) => {
    if (pvd.pack !== null) {
      packagedWeeks = Number(packagedWeeks + pvd.pack.weeksSupply);
    }
  });
  return Number((prescriptionDuration - packagedWeeks) / 4);
}

remainigDurationInWeeks() {
  const prescriptionDuration = Number(this.duration.weeks);
  let packagedWeeks = 0;
  this.patientVisitDetails.forEach((pvd) => {
    if (pvd.pack !== null) {
      packagedWeeks = Number(packagedWeeks + pvd.pack.weeksSupply);
    }
  });
  return Number(prescriptionDuration - packagedWeeks);
}

lastPackOnPrescription() {
  let lastVisit = null;
  this.patientVisitDetails.forEach((visit) => {
    if (lastVisit === null) {
      lastVisit = visit;
    } else if (visit.pack.pickupDate > lastVisit.pack.pickupDate) {
      lastVisit = visit;
    }
  });
  return lastVisit.pack;
}

static async apiSave(prescription) {
  return await this.api().post('/prescription', prescription);
}

static async apiGetAllByClinicId(clinicId, offset, max) {
  return await this.api().get(
    '/prescription/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
  );
}

static async apiGetAllLastOfClinic(clinicId, offset, max) {
  return await this.api().get(
    '/prescription/AllLastOfClinic/' +
      clinicId +
      '?offset=' +
      offset +
      '&max=' +
      max
  );
}

static async apiFetchById(id) {
  return await this.api().get(`/prescription/${id}`);
}

static async apiFetchLastByIdentifierId(id) {
  return await this.api().get(`/prescription/identifier/${id}`);
}

static async apiFetchByPatientVisitDetailsId(pvdsId, offset, max) {
  return await this.api().get(
    '/prescription/visits/' + pvdsId + '?offset=' + offset + '&max=' + max
  );
}

static async apiGetByClinicId(clinicId) {
  return await this.api().get('/prescription/clinic/' + clinicId);
}

static localDbAdd(prescription) {
  return db.newDb().collection('prescriptions').add(prescription);
}

static async localDbGetById(id) {
  return await db.newDb().collection('prescriptions').doc({ id: id }).get();
}

static localDbGetAll() {
  return db.newDb().collection('prescriptions').get();
}

static localDbUpdate(prescription) {
  return db
    .newDb()
    .collection('prescriptions')
    .doc({ id: prescription.id })
    .set(prescription);
}

static localDbUpdateAll(prescriptions) {
  return db.newDb().collection('prescriptions').set(prescriptions);
}

static localDbDelete(prescription) {
  return db
    .newDb()
    .collection('prescriptions')
    .doc({ id: prescription.id })
    .delete();
}

static localDbDeleteAll() {
  return db.newDb().collection('prescriptions').delete();
}

static localDbDeleteById(prescriptionId) {
  return db
    .newDb()
    .collection('prescriptions')
    .doc({ id: prescriptionId })
    .delete();
}

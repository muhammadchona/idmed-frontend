import { defineStore } from 'pinia';

export interface PatientEntity {
  id: string;
  [key: string]: any;
}

export const usePatientMobileStore = defineStore('patient-mobile', {
  state: () => ({
    patients: [] as PatientEntity[],
  }),
  getters: {
    all(state): PatientEntity[] {
      return state.patients;
    },
  },
  actions: {
    setPatients(payload: PatientEntity[]) {
      this.patients = payload.map((patient) => ({ ...patient }));
    },
    bulkUpsert(payload: PatientEntity[]) {
      payload.forEach((patient) => {
        this.upsertPatient(patient);
      });
    },
    upsertPatient(payload: PatientEntity) {
      const patient = { ...payload };
      const index = this.patients.findIndex((item) => item.id === patient.id);
      if (index >= 0) {
        this.patients.splice(index, 1, patient);
      } else {
        this.patients.push(patient);
      }
    },
    removeById(id: string) {
      this.patients = this.patients.filter((patient) => patient.id !== id);
    },
    clear() {
      this.patients = [];
    },
    getById(id: string): PatientEntity | undefined {
      const patient = this.patients.find((item) => item.id === id);
      return patient ? { ...patient } : undefined;
    },
  },
});

import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Doctor from 'src/stores/models/doctor/Doctor';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const doctor = useRepo(Doctor);
const doctorDexie = db[Doctor.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let doctorMobileCache: any[] = [];

const setDoctorMobileCache = (rows: any[]) => {
  doctorMobileCache = rows.map((row) => clone(row));
};

const getDoctorMobileCache = () => doctorMobileCache.map((row) => clone(row));

const refreshDoctorMobileCache = async () => {
  const rows = await doctorDexie.toArray();
  setDoctorMobileCache(rows);
  return getDoctorMobileCache();
};

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('doctor', params)
      .then((resp) => {
        doctor.save(resp.data);
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('doctor?offset=' + offset + '&max=100')
        .then((resp) => {
          doctor.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('doctor/' + uuid, params)
      .then((resp) => {
        doctor.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('doctor/' + uuid)
      .then(() => {
        doctor.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return doctorDexie
      .put(payload)
      .then(async () => {
        await refreshDoctorMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return doctorDexie
      .put(payload)
      .then(async () => {
        await refreshDoctorMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return Promise.resolve([]);
    }
    return refreshDoctorMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return doctorDexie
      .delete(paramsId)
      .then(async () => {
        doctorMobileCache = doctorMobileCache.filter((item) => item.id !== paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    const payload = clone(params);
    return doctorDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshDoctorMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return doctor.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAlldoctors() {
    if (isMobile.value && !isOnline.value) {
      return getDoctorMobileCache().filter((entry) => entry.active);
    }
    return doctor
      .with('clinic', (query) => {
        query.with('province');
        query.with('district');
        query.with('facilityType');
      })
      .where('active', true)
      .orderBy('firstnames')
      .get();
  },
  getAllActiveAndNonActivedoctors() {
    if (isMobile.value && !isOnline.value) {
      return getDoctorMobileCache();
    }
    return doctor
      .with('clinic', (query) => {
        query.with('province');
        query.with('district');
        query.with('facilityType');
      })
      .orderBy('firstnames')
      .get();
  },
  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await doctorDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshDoctorMobileCache();
  },
};

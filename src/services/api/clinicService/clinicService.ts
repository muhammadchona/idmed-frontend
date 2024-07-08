import Province from 'src/stores/models/province/Province';
import { useRepo } from 'pinia-orm';
import { Clinic } from 'src/stores/models/clinic/Clinic';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { SessionStorage } from 'quasar';
import db from '../../../stores/dexie';

const clinic = useRepo(Clinic);
const clinicDexie = Clinic.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.addMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('clinic', params);
      clinic.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinic?offset=' + offset + '&max=100')
        .then((resp) => {
          clinic.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('clinic/' + uuid, params);
      clinic.save(resp.data);
      closeLoading();
      // alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('clinic/' + uuid);
      clinic.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[clinicDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        clinic.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[clinicDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        clinic.save(params);
        // alertSucess('O Registo foi efectuado com sucesso');
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  getMobile() {
    return db[clinicDexie]
      .toArray()
      .then((rows: any) => {
        clinic.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  deleteMobile(paramsId: string) {
    return db[clinicDexie]
      .delete(paramsId)
      .then(() => {
        clinic.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  addBulkMobile(params: string) {
    return db[clinicDexie]
      .bulkAdd(params)
      .then(() => {
        clinic.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  // Methods
  apiFetchById(id: string) {
    return api().get(`/clinic/${id}`);
  },
  apiFetchMainClinic() {
    return api().get('/clinic/mainClinic');
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/clinic?offset=' + offset + '&max=' + max);
  },
  async apiGetByUUID(uuid: string) {
    return await api().get('/clinic/uuid/' + uuid);
  },
  async apiSave(clinic: any) {
    return this.post(clinic);
  },
  async apiUpdate(clinic: any) {
    // return await api().post('/clinic', clinic)
    return this.patch(clinic.id, clinic);
  },
  async getAllClinicsByDistrictId(districtId: any) {
    return await api()
      .get('/clinic/district/' + districtId)
      .then((resp) => {
        clinic.save(resp.data);
        // closeLoading();
      })
      .catch((error) => {
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return clinic.getModel().$newInstance();
  },
  getAllFromStorage() {
    return clinic.all();
  },
  getClinicsByDistrictId(districtid: string) {
    return clinic
      .query()
      .with('nationalClinic')
      .with('province')
      .with('district')
      .where('district_id', districtid)
      .get();
  },

  /*PINIA*/
  currClinic() {
    const clinicSectorUser = SessionStorage.getItem('clinic_sector_users');
    if (clinicSectorUser === null || clinicSectorUser.includes('NORMAL')) {
      return clinic.withAllRecursive(2).where('mainClinic', true).first();
    } else {
      return this.getByCode(clinicSectorUser);
    }
  },

  savePinia(clin: any) {
    clinic.save(clin);
  },
  getAllClinics() {
    return clinic
      .query()
      .with('nationalClinic')
      .with('province')
      .with('facilityType')
      .with('district')
      .with('sectors')
      .where('type', 'CLINIC')
      .get();
  },

  getAllClinicSectors() {
    return clinic
      .query()
      .with('nationalClinic')
      .with('province')
      .with('facilityType')
      .with('district')
      .with('parentClinic')
      .with('sectors')
      .where((clinic) => {
        return clinic.parentClinic_id !== '';
      })
      .get();
  },

  getFromProvincial(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinic/clinicFromProvicnial/' + offset)
        .then((resp) => {
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromProvincial(offset);
          } else {
            alertSucess('Lista actualizada com sucesso');
            this.get(0);
          }
        });
    }
  },

  getAllClinicsOrdered(provinces: Province[], clinics: Clinic[]) {
    let listaFinal = [];
    let orderedList: any[] = [];
    const mapaListas = new Map();

    provinces.forEach((prov) => {
      listaFinal = clinics
        .filter((x) => x.province.description === prov.description)
        .sort((a, b) => a.clinicName.localeCompare(b.clinicName));
      if (listaFinal.length > 0 && prov !== undefined) {
        mapaListas.set(prov.description, listaFinal);
      }
    });
    const ascMap = new Map([...mapaListas.entries()].sort());
    const lista = [...ascMap.values()];
    lista.forEach((item) => {
      orderedList = orderedList.concat(item);
    });
    return orderedList;
  },
  getAllPrivateFromDistrict(districtId: string) {
    return clinic
      .withAllRecursive(2)
      .where('mainClinic', false)
      .where('active', true)
      .where('district_id', districtId)
      .whereHas('facilityType', (query) => {
        query.where((facilityType) => {
          return facilityType.code !== 'US' && facilityType.type === 'clinic';
        });
      })
      .orderBy('code', 'asc')
      .get();
  },
  getAllUSFromDistrict(districtId: string) {
    return clinic
      .withAllRecursive(2)
      .where('mainClinic', false)
      .where('active', true)
      .where('district_id', districtId)
      .whereHas('facilityType', (query) => {
        query.where((facilityType) => {
          return facilityType.code === 'US';
        });
      })
      .orderBy('code', 'asc')
      .get();
  },
  getAllActiveUSWithoutMain() {
    return clinic
      .withAllRecursive(1)
      .where('mainClinic', false)
      .where('active', true)
      .orderBy('code', 'asc')
      .get();
  },
  getById(id: string) {
    return clinic
      .query()
      .where((clinic) => {
        return clinic.id === id;
      })
      .withAllRecursive(2)
      .first();
  },
  getByCode(code: string) {
    return clinic
      .query()
      .where((clinic) => {
        return clinic.code === code;
      })
      .withAllRecursive(2)
      .first();
  },
  getActivebyClinicId(clinicId: string) {
    return clinic
      .query()
      .with('facilityType')
      .where((clinic) => {
        return clinic.active && clinic.parentClinic_id === clinicId;
      })
      .get();
  },
  deleteFromPinia() {
    return clinic.flush();
  },

  isClinicSector(currClinic: Clinic) {
    return currClinic && !!currClinic.parentClinic_id;
  },
};

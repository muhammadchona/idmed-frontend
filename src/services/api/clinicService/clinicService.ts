import Province from 'src/stores/models/province/Province';
import { useRepo } from 'pinia-orm';
import { Clinic } from 'src/stores/models/clinic/Clinic';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import db from '../../../stores/dexie';
import systemConfigsService from '../systemConfigs/systemConfigsService';

const clinic = useRepo(Clinic);
const clinicDexie = db[Clinic.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { isProvincialInstalation } = useSystemConfig();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let clinicMobileCache: any[] = [];

const setClinicMobileCache = (rows: any[]) => {
  clinicMobileCache = rows.map((row) => clone(row));
};

const getClinicMobileCache = () => clinicMobileCache.map((row) => clone(row));

const refreshClinicMobileCache = async () => {
  const rows = await clinicDexie.toArray();
  setClinicMobileCache(rows);
  return getClinicMobileCache();
};

const getCachedClinics = () => getClinicMobileCache();

const findCachedClinic = (predicate: (clinic: any) => boolean) =>
  getCachedClinics().find(predicate) ?? null;

const ensureClinicFromCache = (predicate: (clinic: any) => boolean) => {
  const entry = findCachedClinic(predicate);
  return entry ? clone(entry) : null;
};

export default {
  async post(params: string) {
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
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
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
          const clinics = resp?.data?.filter(
            (item: any) => !String(item?.entity).includes('clinicSector')
          );
          if (isMobile.value && !isOnline.value) {
            this.addBulkMobile(resp.data);
          }
          clinic.save(clinics);
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
  async apiWebGetAll() {
    return await this.getWeb(0);
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return clinicDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          clinic.save(params);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = clone(params);
    return clinicDexie
      .put(payload)
      .then(async () => {
        await refreshClinicMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return clinicDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          clinic.save(params);
          // alertSucess('O Registo foi efectuado com sucesso');
          closeLoading();
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
        });
    }
    const payload = clone(params);
    return clinicDexie
      .put(payload)
      .then(async () => {
        await refreshClinicMobileCache();
        closeLoading();
        return payload;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return clinicDexie
        .toArray()
        .then((rows: any) => {
          clinic.save(rows);
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
        });
    }
    return clinicDexie
      .toArray()
      .then((rows: any) => {
        setClinicMobileCache(rows);
        return getClinicMobileCache();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return clinicDexie
        .delete(paramsId)
        .then(() => {
          clinic.destroy(paramsId);
          alertSucess('O Registo foi removido com sucesso');
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
        });
    }
    return clinicDexie
      .delete(paramsId)
      .then(async () => {
        clinicMobileCache = clinicMobileCache.filter(
          (item) => item.id !== paramsId
        );
        alertSucess('O Registo foi removido com sucesso');
        return paramsId;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        throw error;
      });
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return clinicDexie
        .bulkPut(params)
        .then(() => {
          clinic.save(params);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = clone(params);
    return clinicDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshClinicMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
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
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics();
    }
    return clinic.query().withAllRecursive(1).get();
  },
  getClinicsByDistrictId(districtid: string) {
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics().filter(
        (entry) => entry.district_id === districtid
      );
    }
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
    const instalationType = systemConfigsService.getInstallationType();
    const clinicUser = localStorage.getItem('clinicUsers');
    if (isMobile.value && !isOnline.value) {
      const clinics = getClinicMobileCache();
      if (
        instalationType !== null &&
        ((clinicUser === 'undefined' && !isProvincialInstalation()) ||
          (clinicUser === '' && !isProvincialInstalation()) ||
          String(clinicUser).includes('NORMAL'))
      ) {
        return (
          clinics.find(
            (entry) =>
              entry.mainClinic === true &&
              entry.id === instalationType.description
          ) ?? null
        );
      } else if (clinicUser !== null && clinicUser !== '') {
        let sectorCode = clinicUser;
        if (clinicUser.includes(',')) {
          const arrayOfSectors = clinicUser.split(',');
          sectorCode = arrayOfSectors[0];
        }
        return clinics.find((entry) => entry.code === sectorCode) ?? null;
      }
      return null;
    }
    if (
      instalationType !== null &&
      ((clinicUser === 'undefined' && !isProvincialInstalation()) ||
        (clinicUser === '' && !isProvincialInstalation()) ||
        String(clinicUser).includes('NORMAL'))
    ) {
      return clinic
        .withAllRecursive(2)
        .where('mainClinic', true)
        .where('id', instalationType.description)
        .first();
    } else if (clinicUser !== null && clinicUser !== '') {
      let sectorCode = clinicUser;
      if (clinicUser.includes(',')) {
        const arrayOfSectors = clinicUser.split(',');
        sectorCode = arrayOfSectors[0];
      }

      return this.getByCode(sectorCode);
    }
    return null;
  },

  savePinia(clin: any) {
    clinic.save(clin);
  },

  getAllClinics() {
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics().filter((entry) => entry.type === 'CLINIC');
    }
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
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics().filter(
        (entry) => entry.type === 'CLINIC_SECTOR'
      );
    }
    return clinic.query().withAll().where('type', 'CLINIC_SECTOR').get();
  },

  getAllClinicsAndClinicSectors() {
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics();
    }
    return clinic
      .query()
      .with('nationalClinic')
      .with('province')
      .with('facilityType')
      .with('district')
      .with('sectors')
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
    let listaFinal: any[] = [];
    let orderedList: any[] = [];
    const mapaListas = new Map();

    if (isMobile.value && !isOnline.value) {
      const cachedClinics =
        clinics && clinics.length ? clinics : getCachedClinics();
      provinces.forEach((prov) => {
        listaFinal = cachedClinics
          .filter(
            (x) => x.province && x.province.description === prov.description
          )
          .sort((a, b) =>
            (a.clinicName || '').localeCompare(b.clinicName || '')
          );
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
    }

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
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics()
        .filter((entry) => {
          const facilityType = entry.facilityType;
          return (
            entry.mainClinic === false &&
            entry.active === true &&
            entry.district_id === districtId &&
            facilityType &&
            facilityType.code !== 'US' &&
            facilityType.type === 'clinic'
          );
        })
        .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    }
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
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics()
        .filter((entry) => {
          const facilityType = entry.facilityType;
          return (
            entry.mainClinic === false &&
            entry.active === true &&
            entry.district_id === districtId &&
            facilityType &&
            facilityType.code === 'US'
          );
        })
        .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    }
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

  getAllofAllUSFromDistrict(districtId: string) {
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics()
        .filter((entry) => {
          const facilityType = entry.facilityType;
          return (
            entry.active === true &&
            entry.district_id === districtId &&
            facilityType &&
            facilityType.code === 'US'
          );
        })
        .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    }
    return clinic
      .withAllRecursive(2)
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
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics()
        .filter((entry) => {
          const facilityType = entry.facilityType;
          return (
            entry.mainClinic === false &&
            entry.active === true &&
            facilityType &&
            facilityType.code === 'US'
          );
        })
        .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    }
    return clinic
      .withAllRecursive(1)
      .where('mainClinic', false)
      .where('active', true)
      .orderBy('code', 'asc')
      .get();
  },
  getById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return ensureClinicFromCache((entry) => entry.id === id);
    }
    return clinic
      .query()
      .where((clinic) => {
        return clinic.id === id;
      })
      .withAllRecursive(2)
      .first();
  },
  getByCode(code: string) {
    if (isMobile.value && !isOnline.value) {
      return ensureClinicFromCache((entry) => entry.code === code);
    }
    return clinic
      .query()
      .where((clinic) => {
        return clinic.code === code;
      })
      .withAllRecursive(2)
      .first();
  },
  getActivebyClinicId(clinicId: string) {
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics().filter(
        (entry) => entry.active && entry.parentClinic_id === clinicId
      );
    }
    return clinic
      .query()
      .with('facilityType')
      .where((clinic) => {
        return clinic.active && clinic.parentClinic_id === clinicId;
      })
      .get();
  },

  getActivebyClinicCodeinList(clinicCode: [string]) {
    if (isMobile.value && !isOnline.value) {
      return getCachedClinics().filter((entry) =>
        clinicCode.includes(entry.code)
      );
    }
    return clinic
      .with('facilityType')
      .where((clinicResult: Clinic) => {
        return clinicCode.includes(clinicResult.code);
      })
      .get();
  },

  deleteFromPinia() {
    return clinic.flush();
  },

  isClinicSector(currClinic: Clinic) {
    return currClinic && currClinic.facilityType.type == 'clinic_sector';
  },

  isPrivatePharmacy(currClinic: Clinic) {
    return currClinic && currClinic.facilityType.code == 'FP';
  },

  // Dexie Block
  async getByIdFromDexie(id: string) {
    return await clinicDexie.get(id);
  },

  async getAllByIDsFromDexie(ids: []) {
    // 1. Keep only **non-empty strings**
    const validIds = ids
      .filter((id) => typeof id === 'string')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    // 2. If nothing valid, no need to hit Dexie
    if (validIds.length === 0) {
      return [];
    }

    // 3. Safe call: all values are clean strings
    return clinicDexie.where('id').anyOfIgnoreCase(validIds).toArray();
    //  return await clinicDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return this.getMobile();
  },

  putBulkMobile(payload: string) {
    return clinicDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshClinicMobileCache();
        closeLoading();
        return payload;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        throw error;
      });
  },
};

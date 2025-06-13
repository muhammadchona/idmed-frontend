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
import { ClinicSector } from 'src/stores/models/clinic/ClinicSector';

const clinic = useRepo(Clinic);
const clinicSector = useRepo(ClinicSector);
const clinicDexie = db[Clinic.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { isProvincialInstalation } = useSystemConfig();

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
    return clinicDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        clinic.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
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
  },
  getMobile() {
    return clinicDexie
      .toArray()
      .then((rows: any) => {
        clinic.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  deleteMobile(paramsId: string) {
    return clinicDexie
      .delete(paramsId)
      .then(() => {
        clinic.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
      });
  },
  addBulkMobile(params: any) {
    return clinicDexie
      .bulkPut(params)
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
    return clinic.query().withAllRecursive(1).get();
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
    const instalationType = systemConfigsService.getInstallationType();
    const clinicUser = localStorage.getItem('clinicUsers');
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
    return clinic.query().withAll().where('type', 'CLINIC_SECTOR').get();
  },

  getAllClinicsAndClinicSectors() {
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

  getAllofAllUSFromDistrict(districtId: string) {
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

  getActivebyClinicCodeinList(clinicCode: [string]) {
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
    return await clinicDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
};

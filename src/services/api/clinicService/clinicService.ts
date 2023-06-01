import { Province } from 'src/stores/models/province/Province';
import { useRepo } from 'pinia-orm';
import Clinic from 'src/stores/models/clinic/Clinic';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useStorage } from '@vueuse/core';
import { useLoading } from 'src/composables/shared/loading/loading';
import provinceService from '../provinceService/provinceService';

const { closeLoading, showloading } = useLoading();
const clinic = useRepo(Clinic);

const { alertSucess, alertError, alertWarning } = useSwal();

export default {
  async post(params: string) {
    try {
      const resp = await api().post('clinic', params);
      const clinicData = JSON.parse(resp.config.data);
      clinic.save(clinicData);
      useStorage('clinic', clinicData);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      if (error.request != null) {
        const arrayErrors = JSON.parse(error.request.response);
        const listErrors = [];
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element: any) => {
            listErrors.push(element.message);
          });
        }
        alertError(String(listErrors));
      } else if (error.request) {
        alertError(error.request);
      } else {
        alertError(error.message);
      }
    }
  },
  get(offset: number) {
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
          if (error.request != null) {
            const arrayErrors = JSON.parse(error.request.response);
            const listErrors = [];
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element: any) => {
                listErrors.push(element.message);
              });
            }
            alertError(String(listErrors));
          } else if (error.request) {
            alertError(error.request);
          } else {
            alertError(error.message);
          }
        });
    }
  },
  async patch(uid: string, params: string) {
    try {
      const resp = await api().patch('clinic?uuid=eq.' + uid, params);
      clinic.save(JSON.parse(resp.config.data));
      useStorage('clinic', JSON.parse(resp.config.data));
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      if (error.request != null) {
        const arrayErrors = JSON.parse(error.request.response);
        const listErrors = [];
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element: any) => {
            listErrors.push(element.message);
          });
        }
        alertError(String(listErrors));
      } else if (error.request) {
        alertError(error.request);
      } else {
        alertError(error.message);
      }
    }
  },
  async delete(uuid: string) {
    try {
      const resp = await api().delete('clinic?uuid=eq.' + uuid);
      clinic.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      if (error.request != null) {
        const arrayErrors = JSON.parse(error.request.response);
        const listErrors = [];
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element: any) => {
            listErrors.push(element.message);
          });
        }
        alertWarning(
          'Alerta!',
          'Esta farmácia tem pacientes assossiados e não pode ser removida'
        );
      } else if (error.request) {
        alertError(error.request);
      } else {
        alertError(error.message);
      }
    }
  },
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
    return await api().post('/clinic', clinic);
  },
  async apiUpdate(clinic: any) {
    // return await api().post('/clinic', clinic)
    return await api().patch('/clinic/' + clinic.id, clinic);
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
      .with('district.province')
      .where('district_id', districtid)
      .get();
  },

  /*PINIA*/
  currClinic() {
    return clinic.withAllRecursive(2)
     // .with('province')
     // .with('facilityType')
     // .with('district')
     // .with('sectors')
      .where('mainClinic', true)
      .first();
  },

  getAllClinics() {
    return clinic
      .query()
      .with('nationalClinic')
      .with('province')
      .with('facilityType')
      .with('district')
      .with('sectors')
      .get();
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
};

import { useRepo } from 'pinia-orm';
import Clinic from 'src/stores/models/clinic/Clinic';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useStorage } from '@vueuse/core';

const clinic = useRepo(Clinic);

const { alertSucess, alertError, alertWarning } = useSwal();

export default {
  async post(params: string) {
    try {
      const resp = await api().post('clinic', params);
      const clinicData = JSON.parse(resp.config.data);
      clinic.save(clinicData);
      useStorage('clinic', clinicData);
      alertSucess('Sucesso!', 'O Registo foi efectuado com sucesso');
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
        alertError('Erro no registo', listErrors);
      } else if (error.request) {
        alertError('Erro no registo', error.request);
      } else {
        alertError('Erro no registo', error.message);
      }
    }
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinic?offset=' + offset + '&limit=100')
        .then((resp) => {
          clinic.save(resp.data);
          useStorage('clinic', resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
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
            alertError('Erro no registo', listErrors);
          } else if (error.request) {
            alertError('Erro no registo', error.request);
          } else {
            alertError('Erro no registo', error.message);
          }
        });
    }
  },
  async patch(uid: string, params: string) {
    try {
      const resp = await api().patch('clinic?uuid=eq.' + uid, params);
      clinic.save(JSON.parse(resp.config.data));
      useStorage('clinic', JSON.parse(resp.config.data));
      alertSucess('Sucesso!', 'O Registo foi alterado com sucesso');
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
        alertError('Erro no registo', listErrors);
      } else if (error.request) {
        alertError('Erro no registo', error.request);
      } else {
        alertError('Erro no registo', error.message);
      }
    }
  },
  async delete(uuid: string) {
    try {
      const resp = await api().delete('clinic?uuid=eq.' + uuid);
      clinic.destroy(uuid);
      alertSucess('Sucesso!', 'O Registo foi removido com sucesso');
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
        alertError('Erro no registo', error.request);
      } else {
        alertError('Erro no registo', error.message);
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
      .with('province')
      .with('district')
      .with('district.province')
      .where('district_id', districtid)
      .get();
  },

  currClinic() {
    return clinic
      .query()
      .with('province.*')
      .with('facilityType.*')
      .with('district.*')
      .with('sectors.*')
      .where('mainClinic', true)
      .first();
  },
};

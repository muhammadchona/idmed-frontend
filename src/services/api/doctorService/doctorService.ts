import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Doctor from 'src/stores/models/doctor/Doctor';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const doctor = useRepo(Doctor);

export default {
  async post(params: string) {
    try {
      const resp = await api().post('doctor', params);
      doctor.save(resp.data);
      alertSucess('Sucesso!', 'O Registo foi efectuado com sucesso');
    } catch (error) {
      if (error.request != null) {
        const arrayErrors = JSON.parse(error.request.response);
        const listErrors = [];
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element) => {
            listErrors.push(element.message);
          });
        }
        alertError('Erro no porcessamento', String(listErrors));
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
        .get('doctor?offset=' + offset + '&max=100')
        .then((resp) => {
          doctor.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          if (error.request != null) {
            const arrayErrors = JSON.parse(error.request.response);
            const listErrors = {};
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
            alertError('Erro no porcessamento', String(listErrors));
          } else if (error.request) {
            alertError('Erro no registo', error.request);
          } else {
            alertError('Erro no registo', error.message);
          }
        });
    }
  },
  async patch(id: string, params: string) {
    try {
      const resp = await api().patch('doctor/' + id, params);
      doctor.save(resp.data);
      alertSucess('Sucesso!', 'O Registo foi alterado com sucesso');
    } catch (error) {
      if (error.request != null) {
        const arrayErrors = JSON.parse(error.request.response);
        const listErrors = {};
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element) => {
            listErrors.push(element.message);
          });
        }
        alertError('Erro no porcessamento', String(listErrors));
      } else if (error.request) {
        alertError('Erro no registo', error.request);
      } else {
        alertError('Erro no registo', error.message);
      }
    }
  },
  async delete(id: number) {
    await api().delete('clinicsector/' + id);
    doctor.destroy(id);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return doctor.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAlldoctors() {
    return doctor
      .with('clinic', (query) => {
        query.with('province');
        query.with('district');
        query.with('facilityType');
      })
      .orderBy('firstnames')
      .get();
  },
};

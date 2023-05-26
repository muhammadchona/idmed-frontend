import { useRepo } from 'pinia-orm';
import District from 'src/stores/models/district/District';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const district = useRepo(District);

export default {
  async post(params: string) {
    try {
      const resp = await api().post('district', params);
      district.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
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
        alertError(String(listErrors));
      } else if (error.request) {
        alertError(error.requestlistErrors);
      } else {
        alertError(error.messagelistErrors);
      }
    }
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('district?offset=' + offset + '&max=100')
        .then((resp) => {
          district.save(resp.data);
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
            alertError(String(listErrors));
          } else if (error.request) {
            alertError(error.requestlistErrors);
          } else {
            alertError(error.messagelistErrors);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    try {
      const resp = await api().patch('district/' + id, params);
      district.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
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
        alertError(String(listErrors));
      } else if (error.request) {
        alertError(error.requestlistErrors);
      } else {
        alertError(error.messagelistErrors);
      }
    }
  },
  async delete(id: number) {
    await api().delete('district/' + id);
    district.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/district?offset=' + offset + '&max=' + max);
  },
  getAllDistrictByProvinceId(provinceid: string) {
    return district
      .query()
      .with('province')
      .where('province_id', provinceid)
      .get();
  },
  getAllDistrictByDescription(description: string) {
    return district
      .query()
      .with('province')
      .where('description', description)
      .first();
  },
};

import { useRepo } from 'pinia-orm';
import District from 'src/stores/models/district/District';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();

const district = useRepo(District);

export default {
  async post(params: string) {
    try {
      const resp = await api().post('district', params);
      district.save(resp.data);
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
        alertError('Erro no registo', listErrors);
      } else if (error.request) {
        alertError('Erro no registo', error.requestlistErrors);
      } else {
        alertError('Erro no registo', error.messagelistErrors);
      }
    }
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('district?offset=' + offset + '&limit=100')
        .then((resp) => {
          district.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
            setTimeout(this.get, 2);
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
            alertError('Erro no registo', listErrors);
          } else if (error.request) {
            alertError('Erro no registo', error.requestlistErrors);
          } else {
            alertError('Erro no registo', error.messagelistErrors);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    try {
      const resp = await api().patch('district/' + id, params);
      district.save(resp.data);
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
        alertError('Erro no registo', listErrors);
      } else if (error.request) {
        alertError('Erro no registo', error.requestlistErrors);
      } else {
        alertError('Erro no registo', error.messagelistErrors);
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
};

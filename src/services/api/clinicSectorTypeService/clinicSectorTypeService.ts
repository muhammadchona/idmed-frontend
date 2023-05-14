import { useRepo } from 'pinia-orm';
import ClinicSectorType from 'src/stores/models/clinicSectorType/ClinicSectorType';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();

const clinicSectorType = useRepo(ClinicSectorType);

export default {
  post(params: string) {
    return api()
      .post('clinicSectorType', params)
      .then((resp) => {
        clinicSectorType.save(resp.data);
        alertSucess(
          'Sucesso!',
          'O Registo foi efectuado com sucesso'
        );
      })
      .catch((error) => {
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
          alertError('Erro no registo', error.request);
        } else {
          alertError('Erro no registo', error.message);
        }
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinicSectorType?offset=' + offset + '&limit=100')
        .then((resp) => {
          clinicSectorType.save(resp.data);
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
          alertError('Erro no registo', error.request);
        } else {
          alertError('Erro no registo', error.message);
        }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('clinicSectorType/' + id, params)
      .then((resp) => {
        clinicSectorType.save(resp.data);
        alertSucess(
          'Sucesso!',
          'O Registo foi alterado com sucesso'
        );
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
            alertError('Erro no registo', listErrors);
          } else if (error.request) {
            alertError('Erro no registo', error.request);
          } else {
            alertError('Erro no registo', error.message);
          }
      });
  },
  delete(id: number) {
    return api()
      .delete('clinicSectorType/' + id)
      .then(() => {
        clinicSectorType.destroy(id);
      });
  },
};

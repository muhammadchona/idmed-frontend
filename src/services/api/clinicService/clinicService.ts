import { Query, useRepo } from 'pinia-orm';
import Clinic from 'src/stores/models/clinic/clinic';
import api from '../apiService/apiService';
import District from 'src/stores/models/district/district';
import { alert } from 'src/components/Shared/Dialog/Dialog';

const clinic = useRepo(Clinic);

export default {
  post(params: string) {
    return api()
      .post('clinic', params)
      .then((resp) => {
        const clinicData = JSON.parse(resp.config.data);
        const restLocation = String(resp.headers.location);
        const restId = restLocation.substring(restLocation.indexOf('.') + 1);
        clinicData.id = Number(restId);
        clinic.save(clinicData);
        alert(
          'Sucesso!',
          'O Registo foi efectuado com sucesso',
          null,
          null,
          null
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
          alert('Erro no registo', listErrors, null, null, null);
        } else if (error.request) {
          alert('Erro no registo', error.request, null, null, null);
        } else {
          alert('Erro no registo', error.message, null, null, null);
        }
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinic?offset=' + offset + '&limit=100')
        .then((resp) => {
          clinic.save(resp.data);
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
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
            alert('Erro no registo', listErrors, null, null, null);
          } else if (error.request) {
            alert('Erro no registo', error.request, null, null, null);
          } else {
            alert('Erro no registo', error.message, null, null, null);
          }
        });
    }
  },
  patch(uid: string, params: string) {
    return api()
      .patch('clinic?uuid=eq.' + uid, params)
      .then((resp) => {
        clinic.save(JSON.parse(resp.config.data));
        alert(
          'Sucesso!',
          'O Registo foi alterado com sucesso',
          null,
          null,
          null
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
          alert('Erro no registo', listErrors, '', '', '');
        } else if (error.request) {
          alert('Erro no registo', error.request, '', '', '');
        } else {
          alert('Erro no registo', error.message, '', '', '');
        }
      });
  },
  delete(uuid: string) {
    return api()
      .delete('clinic?uuid=eq.' + uuid)
      .then((resp) => {
        clinic.destroy(uuid);
        alert(
          'Sucesso!',
          'O Registo foi removido com sucesso',
          null,
          null,
          null
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
          alert(
            'Erro no registo',
            'Esta farmácia tem pacientes assossiados e não pode ser removida',
            null,
            null,
            null
          );
        } else if (error.request) {
          alert('Erro no registo', error.request, null, null, null);
        } else {
          alert('Erro no registo', error.message, null, null, null);
        }
      });
  },
}

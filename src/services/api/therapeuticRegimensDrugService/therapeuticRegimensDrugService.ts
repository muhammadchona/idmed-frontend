import { useRepo } from 'pinia-orm';
import TherapeuticRegimensDrug from 'src/stores/models/TherapeuticRegimensDrug/TherapeuticRegimensDrug';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();

const therapeuticRegimensDrug = useRepo(TherapeuticRegimensDrug);

export default {
  post(params: string) {
    return api()
      .post('therapeuticRegimensDrug', params)
      .then((resp) => {
        therapeuticRegimensDrug.save(resp.data);
        alertSucess('O Registo foi efectuado com sucesso');
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
          alertError(String(listErrors));
        } else if (error.request) {
          alertError(error.request);
        } else {
          alertError(error.message);
        }
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('therapeuticRegimensDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticRegimensDrug.save(resp.data);
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
            alertError(String(listErrors));
          } else if (error.request) {
            alertError(error.request);
          } else {
            alertError(error.message);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('therapeuticRegimensDrug/' + id, params)
      .then((resp) => {
        therapeuticRegimensDrug.save(resp.data);
        alertSucess('O Registo foi alterado com sucesso');
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
          alertError(error.request);
        } else {
          alertError(error.message);
        }
      });
  },
  delete(id: number) {
    return api()
      .delete('therapeuticRegimensDrug/' + id)
      .then(() => {
        therapeuticRegimensDrug.destroy(id);
      });
  },
};

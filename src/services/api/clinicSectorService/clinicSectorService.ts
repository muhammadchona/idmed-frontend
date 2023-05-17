import { useRepo } from 'pinia-orm';
import ClinicSector from 'src/stores/models/clinicSector/ClinicSector';
import api from '../apiService/apiService';
import { useStorage } from '@vueuse/core';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError, alertWarning } = useSwal();

const clinicsector = useRepo(ClinicSector);

export default {
  post(params: string) {
    return api()
      .post('clinicSector', params)
      .then((resp) => {
        clinicsector.save(resp.data);
        // alertSucess('Sucesso!', 'O Registo foi efectuado com sucesso');
        alert('O Registo foi efectuado com sucesso');
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
          // alertError('Erro no registo', listErrors);
        } else if (error.request) {
          // alertError('Erro no registo', error.request);
        } else {
          // alertError('Erro no registo', error.message);
        }
      });
  },
  // get(offset: number) {
  //   if (offset >= 0) {
  //     return api()
  //       .get('clinicsector?offset=' + offset + '&limit=100')
  //       .then((resp) => {
  //         clinicsector.save(resp.data);
  //         offset = offset + 100;
  //         if (resp.data.length > 0) {
  //           this.get(offset);
  //           setTimeout(this.get, 2);
  //         }
  //       })
  //       .catch((error) => {
  //         if (error.request != null) {
  //           const arrayErrors = JSON.parse(error.request.response);
  //           const listErrors = {};
  //           if (arrayErrors.total == null) {
  //             listErrors.push(arrayErrors.message);
  //           } else {
  //             arrayErrors._embedded.errors.forEach((element) => {
  //               listErrors.push(element.message);
  //             });
  //           }
  //           alertError('Erro no registo', listErrors);
  //         } else if (error.request) {
  //           alertError('Erro no registo', error.request);
  //         } else {
  //           alertError('Erro no registo', error.message);
  //         }
  //       });
  //   }
  // },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinicSector?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicsector.save(resp.data);
          useStorage('clinicsector', resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
        .catch((error) => {
          closeLoading();
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
            alertError('Erro no porcessamento', String(listErrors));
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
      .patch('clinicSector/' + id, params)
      .then((resp) => {
        clinicSector.save(resp.data);
        alertSucess('Sucesso!', 'O Registo foi alterado com sucesso');
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
  },
  delete(id: number) {
    return api()
      .delete('clinicSector/' + id)
      .then(() => {
        clinicSector.destroy(id);
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return clinicsector.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicSectors() {
    return clinicsector.withAll().get();
  },

  getClinicSectorsByClinicId(clinicId: string) {
    return clinicsector.query().where('clinic_id', clinicId).get();
  },
};

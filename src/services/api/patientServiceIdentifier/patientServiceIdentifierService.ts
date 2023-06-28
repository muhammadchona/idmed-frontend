import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const patientServiceIdentifier = useRepo(PatientServiceIdentifier);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('patientServiceIdentifier', params);
      patientServiceIdentifier.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientServiceIdentifier?offset=' + offset + '&max=100')
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch(
        'patientServiceIdentifier/' + uuid,
        params
      );
      patientServiceIdentifier.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('patientServiceIdentifier/' + uuid);
      patientServiceIdentifier.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  async putMobile(params: string) {
    try {
      await nSQL(patientServiceIdentifier.use?.entity)
        .query('upsert', params)
        .exec();
      patientServiceIdentifier.save(JSON.parse(params));
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getMobile() {
    try {
      const rows = await nSQL(patientServiceIdentifier.use?.entity)
        .query('select')
        .exec();
      patientServiceIdentifier.save(rows);
    } catch (error) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await nSQL(patientServiceIdentifier.use?.entity)
        .query('delete')
        .where(['id', '=', paramsId])
        .exec();
      patientServiceIdentifier.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async apiSave(identifier: any, isNew: boolean) {
    if (isNew) {
      return await this.post(identifier);
    } else {
      return await this.patch(identifier.id, identifier);
    }
  },

  async apiUpdate(identifier: any) {
    return await this.patch(identifier.id, identifier);
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientServiceIdentifier/${id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/patientServiceIdentifier/clinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },

  async apiGetAllByPatientId(patientId: string, offset: number, max: number) {
    if (isMobile && !isOnline) {
      return nSQL(patientServiceIdentifier.use?.entity)
        .query('select')
        .where(['patient_id', '=', patientId])
        .exec()
        .then((rows) => {
          patientServiceIdentifier.save(rows);
        });
    } else {
      return await api()
        .get(
          '/patientServiceIdentifier/patient/' +
            patientId +
            '?offset=' +
            offset +
            '&max=' +
            max
        )
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
        });
    }
  },
  async syncPatientServiceIdentifier(identifier: any) {
    if (identifier.syncStatus === 'R') await this.apiSave(identifier, true);
    if (identifier.syncStatus === 'U') await this.apiUpdate(identifier);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientServiceIdentifier.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientServiceIdentifier.all();
  },
  identifierCurr(id: string) {
    return patientServiceIdentifier.withAllRecursive(2).where('id', id).first();
  },
  getAllEpisodesByIdentifierId(id: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('episodeType', (query) => {
          query.where('code', 'INICIO');
        });
      })
      .where('id', id)
      .get();
  },

  getAllIdentifierWithInicialEpisodeByPatient(patientId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('episodeType', (query) => {
          query.where('code', 'INICIO');
        });
      })
      .where('patient_id', patientId)
      .get();
  },
  curIdentifierById(id: string) {
    return patientServiceIdentifier.withAllRecursive(2).where('id', id).first();
  },
};

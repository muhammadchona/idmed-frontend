import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Pack from 'src/stores/models/packaging/Pack';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const pack = useRepo(Pack);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(uid, params);
    }
  },
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('pack', params)
      .then((resp) => {
        pack.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('pack?offset=' + offset + '&max=100')
        .then((resp) => {
          pack.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('pack/' + uuid, params)
      .then((resp) => {
        pack.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('pack/' + uuid)
      .then(() => {
        pack.destroy(uuid);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(Pack.entity)
      .query('upsert', params)
      .exec()
      .then((resp) => {
        pack.save(resp[0].affectedRows);
      });
  },
  getMobile() {
    return nSQL(Pack.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        pack.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(Pack.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        pack.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },

  async apiSave(pack: any) {
    return await api().post('/pack', pack);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/pack/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/pack/AllLastOfClinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        nSQL(Pack.entity).query('upsert', resp.data).exec();
        pack.save(resp.data);
      });
  },
  async apiGetByPatientId(patientid: string) {
    if (isMobile.value && !isOnline.value) {
      this.get(0);
    } else {
      return await api()
        .get('pack/patient/' + patientid)
        .then((resp) => {
          pack.save(resp.data);
        });
    }
  },
  async apiGetAllByPatientVisitDetailsId(
    patientVisitDetailsId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/pack/patientVisitDetails/' +
        patientVisitDetailsId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllByPrescriptionId(prescriptionId: string) {
    return await api().get('/pack/prescription/' + prescriptionId);
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/pack/${id}`)
      .then((resp) => {
        pack.save(resp.data);
        return resp;
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return pack.getModel().$newInstance();
  },
  getAllFromStorage() {
    return pack.all();
  },
  deleteAllFromStorage() {
    pack.flush();
  },
  removeFromStorage(id: string) {
    return pack.destroy(id);
  },

  getPackByID(Id: string) {
    return pack.query().whereId(Id).first();
  },

  getPackWithsByID(Id: string) {
    return pack
      .query()
      .with('dispenseMode')
      .with('packagedDrugs')
      .whereId(Id)
      .first();
  },

  getLastPackFromPatientVisitAndPrescription(prescriptionId: string) {
    return pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('prescription_id', prescriptionId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },
  getLastPackFromEpisode(episodeId: string) {
    return pack
      .withAllRecursive(1)
      .whereHas('patientVisitDetails', (query) => {
        query.where('episode_id', episodeId);
      })
      .orderBy('pickupDate', 'desc')
      .first();
  },
  getPacksFromPatientId(patientServiceIdentifierid: string) {
    return pack
      .withAllRecursive(2)
      .whereHas('patientVisitDetails', (query) => {
        query.whereHas('episode', (query) => {
          query.where(
            'patientServiceIdentifier_id',
            patientServiceIdentifierid
          );
        });
      })
      .orderBy('pickupDate', 'desc')
      .get();
  },
};

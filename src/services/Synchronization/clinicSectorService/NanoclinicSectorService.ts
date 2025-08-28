import api from '../../api/apiService/apiService';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService';
import { ClinicSector } from 'src/stores/models/clinic/ClinicSector';
import { useRepo } from 'pinia-orm';
import db from 'src/stores/dexie';
import synchronizationService from '../SynchronizationService';

const clinicSector = useRepo(ClinicSector);
const clinicSectorDexie = db[ClinicSector.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinicSector?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicSectorDexie.bulkPut(resp.data);
          console.log('Data synced from backend: ClinicSector');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania ClinicSector');
    (await synchronizationService.hasData(clinicSectorDexie))
      ? await clinicSectorService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie ClinicSector');
    const getAllclinicSector = clinicSectorService.getAllClinicSectors();
    await clinicSectorDexie.bulkPut(getAllclinicSector);
  },
};

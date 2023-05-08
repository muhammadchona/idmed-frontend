import { Model } from 'pinia-orm';
import { date } from 'quasar';
import Clinic from '../clinic/Clinic';
import { InventoryStockAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Inventory extends Model {
  static entity = 'inventorys';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      startDate: this.attr(null),
      endDate: this.attr(null),
      open: this.boolean(true),
      generic: this.boolean(true),
      sequence: this.number(0),
      drugs: this.attr([]),
      syncStatus: this.attr(''),
      clinic_id: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      adjustments: this.hasMany(InventoryStockAdjustment, 'inventory_id'),
    };
  }

  getInventoryType() {
    if (this.generic) {
      return 'Geral';
    } else {
      return 'Parcial';
    }
  }

  getChipColor() {
    if (this.open) {
      return 'primary';
    } else {
      return 'negative';
    }
  }

  getFormatedStartDate() {
    return this.formatDate(this.startDate);
  }

  getFormatedEndDate() {
    return this.formatDate(this.endDate);
  }

  formatDate(dateString) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  }

  getInventoryStatus() {
    if (this.open) {
      return 'Aberto';
    } else {
      return 'Fechado';
    }
  }

  static async apiSave(inventory) {
    return await this.api().post('/inventory', inventory);
  }

  static async apiUpdate(inventory) {
    return await this.api().patch('/inventory/' + inventory.id, inventory);
  }

  static async apiClose(id) {
    return await this.api().patch(`/inventory/close/${id}`);
  }

  static async apiRemove(id) {
    return await this.api().delete(`/inventory/${id}`);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/inventory/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static async apiGetAll(offset, max) {
    return await this.api().get('/inventory?offset=' + offset + '&max=' + max);
  }

  static async apiFetchById(id) {
    return await this.api().get(`/inventory/${id}`);
  }

  static localDbAdd(inventory) {
    return db.newDb().collection('inventorys').add(inventory);
  }

  static localDbGetById(id) {
    return db.newDb().collection('inventorys').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('inventorys').get();
  }

  static localDbUpdate(inventory) {
    return db
      .newDb()
      .collection('inventorys')
      .doc({ id: inventory.id })
      .set(inventory);
  }

  static localDbUpdateAll(inventorys) {
    return db.newDb().collection('inventorys').set(inventorys);
  }

  static localDbDelete(inventory) {
    return db
      .newDb()
      .collection('inventorys')
      .doc({ id: inventory.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('inventorys').delete();
  }

  static localDbDeleteById(id) {
    return db.newDb().collection('inventorys').doc({ id: id }).delete();
  }

  static async syncInventory(inventory) {
    if (inventory.syncStatus === 'R') await this.apiSave(inventory);
    if (inventory.syncStatus === 'U') await this.apiUpdate(inventory);
  }

  static getClassName() {
    return 'Inventory';
  }
}

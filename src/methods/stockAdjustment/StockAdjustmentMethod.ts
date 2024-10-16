

export default {
  // Axios API call

  // Local Storage Pinia

  isPosetiveAdjustment() {
    return this.operation.code === 'AJUSTE_POSETIVO';
  },

  isNegativeAdjustment() {
    return this.operation.code === 'AJUSTE_NEGATIVO';
  },

   localDbDeleteAll() {
    return db.newDb().collection('stockAdjustments').delete();
  }
,
   localDbGetById(id: String) {
    return db.newDb().collection('stockAdjustments').doc({ id: id }).get();
  }


};

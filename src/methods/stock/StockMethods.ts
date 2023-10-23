import { date } from 'quasar';
export default {
  isInUse() {
    return (
      (this.packagedDrugStocks !== undefined &&
        this.packagedDrugStocks.length > 0) ||
      this.adjustments.length > 0
    );
  },

  getFormatedExpireDate() {
    return this.formatDate(this.expireDate);
  },

  formatDate(dateString: string) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  },
  getClassName() {
    return 'stock';
  },
};

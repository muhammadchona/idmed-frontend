
import { date } from 'quasar';

export function useStock() {


 function isInUse(stock:any) {
    return (
      (stock.packagedDrugStocks !== undefined &&
        stock.packagedDrugStocks.length > 0) ||
        stock.adjustments.length > 0
    );
  }

  function getFormatedExpireDate(stock: any) {
    return formatDate(stock.expireDate);
  }

  function formatDate(dateString: string) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  }

  function getClassName() {
    return 'stock';
  }
  return {
    isInUse,
    getFormatedExpireDate,
    formatDate,
    getClassName
  }
}

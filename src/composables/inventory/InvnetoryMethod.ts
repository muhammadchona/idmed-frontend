import { useDateUtils } from '../shared/dateUtils/dateUtils';
const dateUtils = useDateUtils()

export function useInventory() {


  function getInventoryType(inventory: any) {
    if (inventory.generic) {
      return 'Geral';
    } else {
      return 'Parcial';
    }
  }

  function getChipColor(inventory: any) {
    if (inventory.open) {
      return 'primary';
    } else {
      return 'negative';
    }
  }

  
  function getFormatedStartDate(inventory: any) {
    return dateUtils.formatDate(inventory.startDate);
  }

 function  getFormatedEndDate(inventory: any) {
    return dateUtils.formatDate(inventory.endDate);
  }

 
  function getInventoryStatus(inventory: any) {
    if (inventory.open) {
      return 'Aberto';
    } else {
      return 'Fechado';
    }
  }


  function circularReferenceReplacer () {
    const seen = new WeakSet();
    return (_, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return; // Break circular reference
        }
        seen.add(value);
      }
      return value;
    };
  };


  function getClassName() {
    return 'inventory';
  }
  return {
    getClassName,
    getInventoryType,
    getChipColor,
    getFormatedEndDate,
    getFormatedStartDate,
    getInventoryStatus,
    circularReferenceReplacer
  }
  

};
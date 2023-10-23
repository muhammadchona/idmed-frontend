import { reactive } from 'vue';

export function useProgress() {
  function barAndPercentProgressVal(
    valParam: any
  ) {
    const resultObj = reactive({barVal: 0, percentVal: '0%'})

    resultObj.barVal = (valParam.toFixed(2))/100
    resultObj.percentVal  = valParam.toFixed(0) + '%';
    
    return resultObj;
  }

  

  return { barAndPercentProgressVal };
}

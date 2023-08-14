import { reactive } from 'vue';

export function useProgress() {
  function barAndPercentProgressVal(
    valParam: number
  ) {
    const resultObj = reactive({barVal: 0, percentVal: '0%'})

    resultObj.percentVal  = valParam.toFixed(0) + '%';
    resultObj.barVal = valParam/20
    
    return resultObj;
  }

  

  return { barAndPercentProgressVal };
}

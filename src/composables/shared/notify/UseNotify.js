// import { useQuasar } from 'quasar'
import { Notify } from 'quasar';
export default function useNotify () {
//   const $q = useQuasar()

//   const notifySuccess = (messageParam) => {
//     $q.notify({
//       type: 'positive',
//       message: messageParam || 'Sucesso'
//     })
//   }

//   const notifyError = (messageParam) => {
//     $q.notify({
//       type: 'negative',
//       message: messageParam || 'Falhou'
//     })
//   }

const notifySuccess = (messageParam) => {
    Notify.create({
        icon: 'announcement',
        message: messageParam,
        type: 'positive',
        progress: true,
        timeout: 3000,
        position: 'top',
        color: 'negative',
        textColor: 'white',
        classes: 'glossy',
    })
};

  const notifyError = (messageParam) => {
    Notify.create({
        icon: 'announcement',
        message: messageParam,
        type: 'negative',
        progress: true,
        timeout: 5000,
        position: 'top',
        color: 'negative',
        textColor: 'white',
        classes: 'glossy',
    })
};

  return {
    notifySuccess,
    notifyError
  }
}

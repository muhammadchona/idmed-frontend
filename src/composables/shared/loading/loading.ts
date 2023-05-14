import {
  useQuasar,
  QSpinnerGears,
  QSpinnerFacebook,
  QSpinnerBall,
} from 'quasar';

const $q = useQuasar();

export function useLoading() {
  function QSpinnerGearsShow(
    spinnerColor: string,
    spinnerSize: number,
    messageColor: string,
    backgroundColor: string,
    message: string
  ) {
    return $q.loading.show({
      spinner: QSpinnerGears,
      spinnerColor: spinnerColor,
      spinnerSize: spinnerSize,
      messageColor: messageColor,
      backgroundColor: backgroundColor,
      message: message,
    });
  }

  function QSpinnerFacebookShow(
    spinnerColor: string,
    spinnerSize: number,
    messageColor: string,
    backgroundColor: string,
    message: string
  ) {
    return $q.loading.show({
      spinner: QSpinnerFacebook,
      spinnerColor: spinnerColor,
      spinnerSize: spinnerSize,
      messageColor: messageColor,
      backgroundColor: backgroundColor,
      message: message,
    });
  }

  function showloading() {
    return $q.loading.show({
      spinner: QSpinnerBall,
      spinnerColor: 'gray',
      spinnerSize: 140,
      message: 'Carregando, aguarde por favor...',
      messageColor: 'white',
    });
  }

  function closeLoading() {
    return $q.loading.hide();
  }

  return { QSpinnerGearsShow, QSpinnerFacebookShow, closeLoading, showloading };
}

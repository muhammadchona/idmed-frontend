import { Loading, QSpinnerGears, QSpinnerFacebook, QSpinnerBall } from 'quasar';

export function useLoading() {
  function QSpinnerGearsShow(
    spinnerColor: string,
    spinnerSize: number,
    messageColor: string,
    backgroundColor: string,
    message: string
  ) {
    return Loading.show({
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
    return Loading.show({
      spinner: QSpinnerFacebook,
      spinnerColor: spinnerColor,
      spinnerSize: spinnerSize,
      messageColor: messageColor,
      backgroundColor: backgroundColor,
      message: message,
    });
  }

  function showloading() {
    return Loading.show({
      spinner: QSpinnerBall,
      spinnerColor: 'gray',
      spinnerSize: 140,
      message: 'Carregando, aguarde por favor...',
      messageColor: 'white',
    });
  }

  function closeLoading() {
    return Loading.hide();
  }

  return { QSpinnerGearsShow, QSpinnerFacebookShow, closeLoading, showloading };
}

import swal from 'sweetalert';

export function useSwal() {
  function alertSucess(title: string, message: string) {
    return swal({
      title: title,
      text: message,
      
      icon: 'success',
      // buttons: 'Aceitar',
    });
  }

  function alertWarning(title: string, message: string) {
    return swal({
      title: title,
      text: message,
      icon: 'warning',
      // buttons: 'Aceitar',
    });
  }

  function alertError(title: string, message: string) {
    return swal({
      title: title,
      text: message,
      icon: 'error',
      // buttons: 'Aceitar',
    });
  }

  function alertInfo(title: string, message: string) {
    return swal({
      title: title,
      text: message,
      icon: 'info',
      // buttons: 'Aceitar',
    });
  }

  function alertWarningAction(
    title: string,
    message: string,
    botaoCancelar: string,
    botaoAceitar: string
  ) {
    swal({
      title: title,
      text: message,
      icon: 'warning',
      buttons: [botaoCancelar, botaoAceitar],
      dangerMode: true,
    });
  }

  return {
    alertSucess,
    alertWarning,
    alertError,
    alertInfo,
    alertWarningAction,
  };
}

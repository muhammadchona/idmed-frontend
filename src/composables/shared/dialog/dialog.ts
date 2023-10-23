import swal from 'sweetalert';

export function useSwal() {
  function alertSucess(message: string) {
    return swal({
      title: 'Sucesso',
      text: message,
      icon: 'success',
      // buttons: 'Aceitar',
    });
  }

  function alertWarning(message: string) {
    return swal({
      title: 'Aviso',
      text: message,
      icon: 'warning',
      // buttons: 'Aceitar',
    });
  }

  function alertError(message: string) {
    return swal({
      title: 'Erro',
      text: message,
      icon: 'error',
      // buttons: 'Aceitar',
    });
  }

  function alertInfo(message: string) {
    return swal({
      title: 'Informação',
      text: message,
      icon: 'info',
      // buttons: 'Aceitar',
    });
  }

  function alertWarningAction(message: string) {
    return swal({
      title: 'Confirmação',
      text: message,
      icon: 'warning',
      buttons: ['Não', 'Sim'],
      dangerMode: true,
      closeOnClickOutside: false,
      closeOnEsc: false,
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

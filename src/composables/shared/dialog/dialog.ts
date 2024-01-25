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

  function alertWarningTitle(title: string, message: string) {
    return swal({
      title: title,
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

  function confirmeServiceReport(){
    (async () => {
      const { value: formValues } = await swal.fire({
        title: 'Selecionar Servico por imprimir',
        html: `
          <div class="q-pa-md">
            <input type="checkbox" id="tarvCheckbox" >
            <label for="tarvCheckbox">TARV</label>
    
            <input type="checkbox" id="tbCheckbox" >
            <label for="tbCheckbox">TB</label>
    
            <input type="checkbox" id="smiCheckbox" >
            <label for="smiCheckbox">SMI</label>
          </div>
        `,
        focusConfirm: false,
        preConfirm: () => {
          return [
            document.getElementById('tarv-input1').value,
            document.getElementById('tb-input2').value,
            document.getElementById('tb-input2').value
          ];
        }
      });
      if (formValues) {
        return swal.fire(JSON.stringify(formValues));
      }
    })()
  }

  return {
    alertSucess,
    alertWarning,
    alertWarningTitle,
    alertError,
    alertInfo,
    alertWarningAction,
    confirmeServiceReport
  };
}

import { v4 as uuidv4 } from 'uuid';
import { nSQL } from 'nano-sql';
import { Model } from 'pinia-orm';

export default class MmiaReport extends Model {
  static entity = 'mmiaReports';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      reportId: this.attr(''),
      // fields

      /**
       * Tipo de doentes em TARV
       */
      totalPacientesInicio: this.attr(0),
      totalPacientesManter: this.attr(0),
      totalPacientesAlterar: this.attr(0),
      totalPacientesTransito: this.attr(0),
      totalPacientesTransferidoDe: this.attr(0),

      /**
       * Faixa etaria dos pacientes em TARV
       */
      totalPacientesAdulto: this.attr(0),
      totalPacientes04: this.attr(0),
      totalPacientes59: this.attr(0),
      totalPacientes1014: this.attr(0),

      /**
       * Profilaxia
       */
      totalPacientesPPE: this.attr(0),
      totalPacientesPREP: this.attr(0),
      totalpacientesCE: this.attr(0),

      dsM0: this.attr(0),
      dsM1: this.attr(0),
      dsM2: this.attr(0),
      dsM3: this.attr(0),
      dsM4: this.attr(0),
      dsM5: this.attr(0),

      dtM0: this.attr(0),
      dtM1: this.attr(0),
      dtM2: this.attr(0),

      dbM0: this.attr(0),
      dbM1: this.attr(0),

      dM: this.attr(0),
    };
  }

  static addTotalPacientesInicio() {
    this.totalPacientesInicio++;
  }

  static addTotalPacientesManter() {
    this.totalPacientesManter++;
  }

  static addTotalPacientesAlterar() {
    this.totalPacientesAlterar++;
  }

  static addTotalPacientesTransito() {
    this.totalPacientesTransito++;
  }

  static addTotalPacientesTransferido() {
    this.totalPacientesTransferidoDe++;
  }

  static addTotalPacientesAdulto() {
    this.totalPacientesAdulto++;
  }

  static addTotalPacientes04() {
    this.totalPacientes04++;
  }

  static addTotalPacientes59() {
    this.totalPacientes59++;
  }

  static addTotalPacientes1014() {
    this.totalPacientes1014++;
  }

  static addTotalPacientesPPE() {
    this.totalPacientesPPE++;
  }

  static addTotalPacientesPREP() {
    this.totalPacientesPREP++;
  }

  static addTotalPacientesCE() {
    this.totalpacientesCE++;
  }

  static addTotalDsM0() {
    this.dsM0++;
  }

  static addTotalDtM0() {
    this.dtM0++;
  }

  static addTotalDM() {
    this.dM++;
  }

  static addTotalPrep() {
    this.prep++;
  }
}

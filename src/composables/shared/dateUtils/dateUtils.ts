import moment from 'moment';
import { date } from 'quasar';

export function useDateUtils() {
  function isValidDate(dateString: string) {
    return date.isValid(dateString);
  }
  function formatDate(dateString: string) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  }
  const optionsNonFutureDate = (date: string) => {
    return date <= moment().format('YYYY/MM/DD');
  };
  function getJSDateFromDDMMYYY(dateString: string) {
    const dateParts = dateString.split('-');
    return new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);
  }

  function getDDMMYYYFromJSDate(jsDate: Date) {
    return moment(jsDate).local().format('DD-MM-YYYY');
  }

  function getYYYYMMDDFromJSDate(jsDate: Date) {
    return moment(jsDate).local().format('YYYY-MM-DD');
  }

  function getHyphenDDMMYYYYFromJSDate(jsDate: Date) {
    return moment(jsDate).local().format('DD/MM/YYYY');
  }

  function getHyphenYYYYMMDDFromJSDate(jsDate: Date) {
    return moment(jsDate).local().format('YYYY/MM/DD');
  }

  function getDateFromSlashDDMMYYYY(jsDate: string) {
    return date.extractDate(jsDate, 'DD/MM/YYYY');
  }

  function getDateFromHyphenDDMMYYYY(jsDate: string) {
    return date.extractDate(jsDate, 'DD-MM-YYYY');
  }

  function getDateFromSlashYYYYMMDD(jsDate: string) {
    return date.extractDate(jsDate, 'YYYY/MM/DD');
  }

  function getDateFromHyphenYYYYMMDD(jsDate: string) {
    return date.extractDate(jsDate, 'YYYY-MM-DD');
  }

  function getDateFormatYYYYMMDDFromDDMMYYYY(date: Date) {
    return moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  }

  function extractHyphenDateFromDMYConvertYMD(jsDate: string) {
    return getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(jsDate));
  }

  function getDateFormatDDMMYYYY(date: Date) {
    return moment(date, 'DD-MM-YYYY').format('DD-MM-YYYY');
  }

  function getDateFormatMMDDYYYY(date: Date) {
    return moment(date, 'MM-DD-YYYY').format('MM-DD-YYYY');
  }

  function getDateFormatYYYYMMDD(date: Date) {
    return moment(date, 'MM-DD-YYYY').format('MM-DD-YYYY');
  }

  function getDateFormatDDMMYYYYFromYYYYMMDD(date: Date) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  function getDateFormatDDMMYYYYDash(date: Date) {
    return moment(date, 'DD-MM-YYYY').format('DD/MM/YYYY');
  }

  function getDateFromHyphenDDMMYYYYWithTime(jsDate: string) {
    const selectedDateMoment = moment(jsDate, 'DD-MM-YYYY');
    const currentTimeMoment = moment();
    selectedDateMoment.set({
      hour: currentTimeMoment.hour(),
      minute: currentTimeMoment.minute(),
      second: currentTimeMoment.second(),
    });
    const formattedDateTime1 = moment(
      selectedDateMoment,
      'DD-MM-YYYY HH:mm:ss'
    );
    return formattedDateTime1.toDate();
  }

  function idadeCalculator(dateOfBirth: Date) {
    if (dateOfBirth !== undefined && dateOfBirth !== null) {
      return moment().diff(moment(dateOfBirth, 'DD-MM-YYYY'), 'years');
    } else {
      return null;
    }
  }

  return {
    isValidDate,
    formatDate,
    optionsNonFutureDate,
    getJSDateFromDDMMYYY,
    getDDMMYYYFromJSDate,
    getYYYYMMDDFromJSDate,
    getHyphenDDMMYYYYFromJSDate,
    getHyphenYYYYMMDDFromJSDate,
    getDateFromSlashDDMMYYYY,
    getDateFromHyphenDDMMYYYY,
    getDateFromSlashYYYYMMDD,
    getDateFromHyphenYYYYMMDD,
    getDateFormatYYYYMMDDFromDDMMYYYY,
    extractHyphenDateFromDMYConvertYMD,
    getDateFormatDDMMYYYY,
    getDateFormatMMDDYYYY,
    getDateFormatYYYYMMDD,
    getDateFormatDDMMYYYYFromYYYYMMDD,
    getDateFormatDDMMYYYYDash,
    idadeCalculator,
    getDateFromHyphenDDMMYYYYWithTime,
  };
}

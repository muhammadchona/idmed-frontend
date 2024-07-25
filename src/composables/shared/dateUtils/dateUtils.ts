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

  function idadeReportCalculator(dateOfBirth: Date) {
    if (dateOfBirth !== undefined && dateOfBirth !== null) {
      return moment().diff(moment(dateOfBirth, 'YYYY-MM-DD'), 'years');
    } else {
      return null;
    }
  }

  function returnEstatisticMonth(thedate) {
    const startOfYear = new Date(thedate.getFullYear(), 0, 1);

    const intervals = [
      {
        start: new Date(startOfYear.getTime() + 21 * 24 * 60 * 60 * 1000),
        end: new Date(
          startOfYear.getTime() + (1 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 2,
      },
      {
        start: new Date(
          startOfYear.getTime() + (1 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (2 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 3,
      },
      {
        start: new Date(
          startOfYear.getTime() + (2 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (3 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 4,
      },
      {
        start: new Date(
          startOfYear.getTime() + (3 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (4 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 5,
      },
      {
        start: new Date(
          startOfYear.getTime() + (4 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (5 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 6,
      },
      {
        start: new Date(
          startOfYear.getTime() + (5 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (6 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 7,
      },
      {
        start: new Date(
          startOfYear.getTime() + (6 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (7 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 8,
      },
      {
        start: new Date(
          startOfYear.getTime() + (7 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (8 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 9,
      },
      {
        start: new Date(
          startOfYear.getTime() + (8 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (9 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 10,
      },
      {
        start: new Date(
          startOfYear.getTime() + (9 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (10 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 11,
      },
      {
        start: new Date(
          startOfYear.getTime() + (10 * 30 + 21) * 24 * 60 * 60 * 1000
        ),
        end: new Date(
          startOfYear.getTime() + (11 * 30 + 20) * 24 * 60 * 60 * 1000
        ),
        value: 12,
      },
    ];

    for (const interval of intervals) {
      if (thedate >= interval.start && thedate <= interval.end) {
        return interval.value;
      }
    }

    return 1;
  }

  function getMonthName(monthNumber) {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    // monthNumber should be between 1 and 12
    if (monthNumber < 1 || monthNumber > 12) {
      throw new Error('Invalid month number');
    }

    return monthNames[monthNumber - 1];
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
    idadeReportCalculator,
    getDateFromHyphenDDMMYYYYWithTime,
    returnEstatisticMonth,
    getMonthName,
  };
}

import moment from 'moment'

 const PERIOD_TYPE_SPECIFIC = 'SPECIFIC'
const PERIOD_TYPE_MONTH = 'MONTH'
const PERIOD_TYPE_QUARTER = 'QUARTER'
const PERIOD_TYPE_SEMESTER = 'SEMESTER'
const PERIOD_TYPE_ANNUAL = 'ANNUAL'

export default {
    determineStartEndDate (reportSearchParams) {
        switch (reportSearchParams.periodType) {
            case PERIOD_TYPE_MONTH: {
                const month = reportSearchParams.period
                reportSearchParams.startDate = moment([21, month, reportSearchParams.year], 'DD-MM-YYYY').subtract('1', 'months').format('YYYY-MM-DD')
                reportSearchParams.endDate = moment([20, month, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(reportSearchParams.endDate)
                break
            }
            case PERIOD_TYPE_QUARTER: {
              switch (reportSearchParams.period) {
                case 1: {
              reportSearchParams.startDate = moment([21, 12, reportSearchParams.year], 'DD-MM-YYYY').subtract('1', 'year').format('YYYY-MM-DD')
              console.log(reportSearchParams.startDate)
              reportSearchParams.endDate = moment([20, 3, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
              console.log(reportSearchParams.endDate)
              break
            }
              case 2: {
                reportSearchParams.startDate = moment([21, 3, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(reportSearchParams.startDate)
                reportSearchParams.endDate = moment([20, 6, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(reportSearchParams.endDate)
                break
              }
              case 3: {
                reportSearchParams.startDate = moment([21, 6, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(reportSearchParams.startDate)
                reportSearchParams.endDate = moment([20, 9, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(reportSearchParams.endDate)
                break
              }
              case 4: {
                reportSearchParams.startDate = moment([21, 9, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(reportSearchParams.startDate)
                reportSearchParams.endDate = moment([20, 12, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
                console.log(reportSearchParams.endDate)
                break
              }
              }
              break
          }
          case PERIOD_TYPE_SEMESTER: {
            switch (reportSearchParams.period) {
              case 1: {
            reportSearchParams.startDate = moment([21, 12, reportSearchParams.year], 'DD-MM-YYYY').subtract('1', 'year').format('YYYY-MM-DD')
            console.log(reportSearchParams.startDate)
            reportSearchParams.endDate = moment([20, 6, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
            console.log(reportSearchParams.endDate)
            break
          }
          case 2: {
            reportSearchParams.startDate = moment([21, 6, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
            console.log(reportSearchParams.startDate)
            reportSearchParams.endDate = moment([20, 12, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
            console.log(reportSearchParams.endDate)
            break
          }
            }
            break
          }
          case PERIOD_TYPE_ANNUAL: {
            reportSearchParams.startDate = moment([21, 12, reportSearchParams.year], 'DD-MM-YYYY').subtract('1', 'years').format('YYYY-MM-DD')
            console.log(reportSearchParams.startDate)
            reportSearchParams.endDate = moment([20, 12, reportSearchParams.year], 'DD-MM-YYYY').format('YYYY-MM-DD')
            console.log(reportSearchParams.endDate)
            break
        }
        case PERIOD_TYPE_SPECIFIC: {
          reportSearchParams.startDate = moment(reportSearchParams.startDateParam, 'DD-MM-YYYY').format('YYYY-MM-DD')
          console.log(reportSearchParams.startDate)
          reportSearchParams.endDate = moment(reportSearchParams.endDateParam, 'DD-MM-YYYY').format('YYYY-MM-DD')
          console.log(reportSearchParams.endDate)
          break
      }
        }
        return reportSearchParams
  },
  getDDMMYYYFromJSDate (jsDate) {
    return moment(jsDate).format('DD-MM-YYYY')
  }
}

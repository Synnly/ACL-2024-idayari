function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
}

// quick addMonth and addYears functions, should use moment.js in the future
function addMonths(date, months) {
    const result = new Date(date.getTime());
    const d = date.getDate();
    result.setMonth(result.getMonth() + months);
    if (result.getDate() != d) {
      result.setDate(0);
    }
    return result;
  }

function addYears(date, years) {
    const result = new Date(date.getTime());
    result.setFullYear(result.getFullYear() + years);
    return result;
}

function daysDiff(d1, d2) {
    // nombre de millisecondes en un jour
    const ONE_DAY = 1000 * 60 * 60 * 24;

    const differenceMs = Math.abs(d1 - d2);
    return differenceMs / ONE_DAY;

}

// on suppose que d1 <= d2
function monthDiff(d1, d2) {
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months;
}

// on suppose que d1 <= d2
function yearDiff(d1, d2) {
    return d2.getFullYear() - d1.getFullYear();
}

export {addDays, addMonths, addYears, daysDiff, monthDiff, yearDiff}
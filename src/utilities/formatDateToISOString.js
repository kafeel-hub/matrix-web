/**
 * Converts an MUI Date object or a standard JavaScript Date object
 * to a standardized ISO 8601 string.
 * @param {any} date - The MUI Date object or JavaScript Date object.
 * @returns {string} ISO 8601 formatted string
 */
// function formatToISOString(date) {
//     if (typeof date?.toDate === "function") {
//         const jsDate = date.toDate();
//         if (!(jsDate instanceof Date) || isNaN(jsDate)) {
//             throw new Error("Invalid MUI Date object provided");
//         }
//         return jsDate.toISOString();
//     }

//     if (date instanceof Date && !isNaN(date)) {
//         return date.toISOString();
//     }

//     throw new Error("Invalid Date object provided (neither MUI Date nor JS Date)");
// }

// export default formatToISOString

import dayjs from "dayjs";
import moment from "moment";

/**
 * Converts various date input formats to ISO string.
 * Supports: Date, dayjs(), moment(), ISO string
 */

function formatToYYYYMMDD(date) {
  if (!date) return null;

  // ✅ Handle dayjs
  if (typeof date?.toDate === "function" && dayjs.isDayjs(date)) {
    return date.isValid() ? date.format("YYYY-MM-DD") : null;
  }

  // ✅ Handle moment
  if (moment.isMoment(date)) {
    return date.isValid() ? date.format("YYYY-MM-DD") : null;
  }

  // ✅ Handle native Date
  if (date instanceof Date && !isNaN(date)) {
    return dayjs(date).format("YYYY-MM-DD");
  }

  // ✅ Handle ISO or other strings
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
}

export default formatToYYYYMMDD;

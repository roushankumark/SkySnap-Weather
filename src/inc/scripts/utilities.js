let reactNavigate = null;

export function registerNavigator(navFn) {
  reactNavigate = navFn;
}

export function navigate(page) {
  if (!page) return;
  const target = page.startsWith("/") ? page : `/${page}`;
  if (typeof reactNavigate === "function") {
    reactNavigate(target);
  } else {
    window.location.href = target;
  }
}

export const getCurrentDate = () => {
  let day, month, date, dateExtension;
  const DATE = new Date();
  date = DATE.getDate();

  switch (DATE.getMonth()) {
    case 0: month = "January"; break;
    case 1: month = "February"; break;
    case 2: month = "March"; break;
    case 3: month = "April"; break;
    case 4: month = "May"; break;
    case 5: month = "June"; break;
    case 6: month = "July"; break;
    case 7: month = "August"; break;
    case 8: month = "September"; break;
    case 9: month = "October"; break;
    case 10: month = "November"; break;
    case 11: month = "December"; break;
    default: month = "Undefined"; break;
  }

  switch (DATE.getDay()) {
    case 0: day = "Sunday"; break;
    case 1: day = "Monday"; break;
    case 2: day = "Tuesday"; break;
    case 3: day = "Wednesday"; break;
    case 4: day = "Thursday"; break;
    case 5: day = "Friday"; break;
    case 6: day = "Saturday"; break;
    default: day = "Undefined"; break;
  }

  let dateLength = date.toString().length;
  if (
    (dateLength === 1 && date === 1) ||
    (dateLength === 2 && date.toString().indexOf("1") === 1)
  ) {
    dateExtension = "st";
  } else if (
    (dateLength === 1 && date === 2) ||
    (dateLength === 2 && date.toString().indexOf("2") === 1)
  ) {
    dateExtension = "nd";
  } else if (
    (dateLength === 1 && date === 3) ||
    (dateLength === 2 && date.toString().indexOf("3") === 1)
  ) {
    dateExtension = "rd";
  } else {
    dateExtension = "th";
  }

  return `${day}, ${date}${dateExtension} ${month}`;
};

export function convertTo12Hour(timeStr) {
  if (!timeStr) return "";
  let hours = timeStr;
  if (timeStr.includes(":")) {
    hours = timeStr.split(":")[0];
  }
  let h = parseInt(hours, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  h = h ? h : 12;
  return `${h}${ampm}`;
}

export function getTimeFromDateString(dateTimeStr) {
  if (!dateTimeStr) return "";
  const parts = dateTimeStr.split(" ");
  return parts[1] ? parts[1] : dateTimeStr;
}

export default navigate;



const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let yearInputRef = null;
let monthRef = null;
let contentSectionRef = null;
let dateFromSpanRef = null;
let dateToSpanRef = null;
let activeDayRef = null;
let outputHiddenField = null;

let datePickerLabel;


function generateDays(store) {
  const containerFragment = document.createDocumentFragment();
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const daysInNonLeapYear = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let i;
  // 1. generate divs containing day names
  for (i = 0; i < dayNames.length; i++) {
    let tmpDiv = document.createElement('div');
    tmpDiv.classList.add('day', 'day-name');
    tmpDiv.textContent = dayNames[i];
    containerFragment.appendChild(tmpDiv);
  }

  // 2. generate empty divs
  let countEmpty = calculateFirstDayOfMonth(store.getState().currentYear, store.getState().currentMonth);
  for (i = 0; i < countEmpty; i++) {
    let tmpDiv = document.createElement('div');
    tmpDiv.classList.add('day');
    containerFragment.appendChild(tmpDiv);
  }

  // 3. genearte numbered divs
  let numOfDays;
  if (isLeapYear(store.getState().currentYear) && store.getState().currentMonth == 2) {
    numOfDays = 29;
  } else {
    numOfDays = daysInNonLeapYear[store.getState().currentMonth - 1];
  }
  for (i = 1; i <= numOfDays; i++) {
    let tmpDiv = document.createElement('div');
    tmpDiv.classList.add('day', 'day-number');
    tmpDiv.textContent = i;
    if (i === store.getState().currentDay) {
      activeDayRef = tmpDiv;
      tmpDiv.classList.toggle('active');
    }
    tmpDiv.addEventListener('click', dayClickHandler.bind({ store: store }));
    containerFragment.appendChild(tmpDiv);
  }

  // 5. generate empty divs to make the calendar always uniform size
  let paddingCount;
  if (countEmpty + numOfDays < 36) {
    paddingCount = 36 - (countEmpty + numOfDays);
    for (i = 0; i < paddingCount; i++) {
      let tmpDiv = document.createElement('div');
      tmpDiv.classList.add('day');
      containerFragment.appendChild(tmpDiv);
    }
  }
  const dayContainer = document.createElement('div');
  dayContainer.classList.add('day-container');
  dayContainer.appendChild(containerFragment);
  return dayContainer;
}

function dayClickHandler(ev) {
  if (activeDayRef !== null) {
    activeDayRef.classList.remove('active');
  }
  ev.target.classList.add('active');
  activeDayRef = ev.target;
  this.store.dispatch({ type: 'SELECT_CURRENT_DAY', currentDay: Number(ev.target.textContent) });
  let tmpDate = {
    day: Number(ev.target.textContent),
    month: this.store.getState().currentMonth,
    year: this.store.getState().currentYear,
  }
  if (this.store.getState().activeDate === 1) {
    this.store.dispatch({ type: 'SET_START_DATE', startDate: tmpDate });
  } else {
    this.store.dispatch({ type: 'SET_END_DATE', endDate: tmpDate });
  }
  // debug
  let tmpActiveDate = this.store.getState().activeDate;
  if (tmpActiveDate === 1) {
    updateSelectedDate(dateFromSpanRef);
    datePickerLabel.textContent
  } else if (tmpActiveDate === 2) {
    updateSelectedDate(dateToSpanRef);
  }
}

function updateSelectedDate(dateSpanElement) {
  const tmpState = store.getState();
  let tmpDate = {
    day: tmpState.currentDay,
    month: tmpState.currentMonth,
    year: tmpState.currentYear
  }
  // date.textContent = `${day}-${month}-${year}`;
  dateSpanElement.textContent = formatDate(tmpDate);
}

function formatDate(date) {
  let dayStr = date.day < 10 ? '0' + date.day : '' + date.day;
  let monthStr = date.month < 10 ? '0' + date.month : '' + date.month;
  return `${dayStr}-${monthStr}-${date.year}`;
}

function formatDateReverse(date) {
  let dayStr = date.day < 10 ? '0' + date.day : '' + date.day;
  let monthStr = date.month < 10 ? '0' + date.month : '' + date.month;
  return `${date.year}-${monthStr}-${dayStr}`;
}

function calculateFirstDayOfMonth(year, month) {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daysInNonLeapYear = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const baseDate = {
    day: 1,
    month: 1,
    year: 2000,
    dayOfTheWeek: 5 // 0-6, 0 = monday, 6 = sunday
  }
  const comparedDate = {
    day: 1,
    month: month,
    year: year
  }
  const dayDifference = daysBetweenDates(baseDate, comparedDate);
  if (comparedDate.year < baseDate.year) {
    return Math.abs((dayDifference % 7) - baseDate.dayOfTheWeek) % 7;
  }
  else if (comparedDate.year > baseDate.year) {
    return ((dayDifference % 7) + baseDate.dayOfTheWeek) % 7;
  }
  else if (comparedDate.year === baseDate.year) {
    if (comparedDate.month < baseDate.month) {
      return Math.abs((dayDifference % 7) - baseDate.dayOfTheWeek) % 7;
    }
    else if (comparedDate.month > baseDate.month) {
      return ((dayDifference % 7) + baseDate.dayOfTheWeek) % 7;
    }
    else if (comparedDate.month === baseDate.month) {
      if (comparedDate.day < baseDate.day) {
        return Math.abs((dayDifference % 7) - baseDate.dayOfTheWeek) % 7;
      }
      else if (comparedDate.day >= baseDate.day) {
        return ((dayDifference % 7) + baseDate.dayOfTheWeek) % 7;
      }
    }
  }
}

function daysBetweenDates(date1, date2) {
  const daysInNonLeapYear = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayCount = 0;
  if (date1.year === date2.year) {
    if (date1.month === date2.month) {
      return Math.abs(date1.day - date2.day);
    }
    else if (date1.month > date2.month) {
      if (isLeapYear(date2.year) && date2.month === 2) {
        dayCount += 29 - date2.day; // not including first day
      } else {
        dayCount += daysInNonLeapYear[date2.month-1] - date2.day; // not including first day
      }
      for (let i = date2.month; i < date1.month - 1; i++) {
        dayCount += daysInNonLeapYear[i];
      }
      return dayCount + date1.day;
    }
    else if (date1.month < date2.month) {
      if (isLeapYear(date1.year) && date1.month === 2) {
        dayCount += 29 - date1.day; // not including first day
      } else {
        dayCount += daysInNonLeapYear[date1.month-1] - date1.day; // not including first day
      }
      for (let i = date1.month; i < date2.month - 1; i++) {
        dayCount += daysInNonLeapYear[i];
      }
      return dayCount + date2.day;
    }
  }
  else if (date1.year > date2.year) {
    if (isLeapYear(date2.year) && date2.month === 2) {
      dayCount += 29 - date2.day; // not including first day
    } else {
      dayCount += daysInNonLeapYear[date2.month-1] - date2.day; // not including first day
    }
    for (let i = date2.month + 1; i <= 12; i++) {
      if (isLeapYear(date2.year) &&  i === 2) {
        dayCount += 29;
      } else {
        dayCount += daysInNonLeapYear[i-1];
      }
    }

    let yearDiff = date1.year - date2.year;
    // dayCount += 365*(yearDiff - Math.floor(yearDiff/4) - 1) + 366*Math.floor(yearDiff/4);
    for (let i = 1; i < yearDiff; i++) {
      if (isLeapYear(date2.year + i)) {
        dayCount += 366;
      } else {
        dayCount += 365;
      }
    }

    for (let i = 1; i < date1.month; i++) {
      if (isLeapYear(date1.year) && i === 2) {
        dayCount += 29;
      } else {
        dayCount += daysInNonLeapYear[i-1];
      }
    }
    return dayCount + date1.day;
  }
  else if (date1.year < date2.year) {
    if (isLeapYear(date1.year) && date1.month === 2) {
      dayCount += 29 - date1.day; // not including first day
    } else {
      dayCount += daysInNonLeapYear[date1.month-1] - date1.day; // not including first day
    }
    
    for (let i = date1.month + 1; i <= 12; i++) {
      if (isLeapYear(date1.year) &&  i === 2) {
        dayCount += 29;
      } else {
        dayCount += daysInNonLeapYear[i-1];
      }
    }
    
    let yearDiff = date2.year - date1.year;
    // dayCount += 365*(yearDiff - Math.floor(yearDiff/4) - 1) + 366*Math.floor(yearDiff/4);
    for (let i = 1; i < yearDiff; i++) {
      if (isLeapYear(date1.year + i)) {
        dayCount += 366;
      } else {
        dayCount += 365;
      }
    }

    for (let i = 1; i < date2.month; i++) {
      if (isLeapYear(date2.year) && i === 2) {
        dayCount += 29;
      } else {
        dayCount += daysInNonLeapYear[i-1];
      }
    }
    return dayCount + date2.day;
  }
}

function isLeapYear(year) {
  return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
}

function generateMonths(store) {
  const tmpMonthFragment = document.createDocumentFragment();
  for (let i = 0; i < 12; i++) {
    let tmpDiv = document.createElement('div');
    tmpDiv.classList.add('month');
    tmpDiv.textContent = monthNames[i];
    tmpDiv.addEventListener('click', selectMonthClickHandler.bind({ store: store }), false);
    tmpMonthFragment.appendChild(tmpDiv);
  }
  const monthPickerContainer = document.createElement('div');
  monthPickerContainer.classList.add('month-picker');
  monthPickerContainer.appendChild(tmpMonthFragment);
  return monthPickerContainer;
}

function selectMonthClickHandler(ev) {
  this.store.dispatch({ type: 'SELECT_CURRENT_MONTH', currentMonth: monthNames.indexOf(ev.target.textContent) + 1 })
  monthRef.textContent = ev.target.textContent;
  contentSectionRef.innerHTML = '';
  contentSectionRef.appendChild(generateDays(this.store));
}

function init(rootContainerId, hiddenInputFieldId, store) {
  const rootContainer = document.getElementById(rootContainerId);
  outputHiddenField = document.getElementById(hiddenInputFieldId);

  // header
  const headerContainer = document.createElement('div');
  headerContainer.classList.add('header');

  // content
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('content');

  // previous button
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  let icon = document.createElement('i');
  icon.classList.add('fa', 'fa-angle-left');
  icon.setAttribute('aria-hidden', 'true');
  prevBtn.appendChild(icon);

  // month and year
  const monthYearContainer = document.createElement('div');
  const month = document.createElement('h2');
  month.classList.add('h');
  month.textContent = monthNames[store.getState().currentMonth - 1];
  const inputGroup = document.createElement('div');
  inputGroup.classList.add('input-group');

  const yearInput = document.createElement('input');
  yearInput.type = 'text';
  yearInput.value = store.getState().currentYear;

  const yearButtonsContainer = document.createElement('div');
  yearButtonsContainer.classList.add('buttons');
  
  const incYearBtn = document.createElement('button');
  incYearBtn.type = 'button';
  icon = document.createElement('i');
  icon.classList.add('fas', 'fa-chevron-up');
  icon.setAttribute('aria-hidden', 'true');
  incYearBtn.appendChild(icon);
  
  const decYearBtn = document.createElement('button');
  decYearBtn.type = 'button';
  icon = document.createElement('i');
  icon.classList.add('fas', 'fa-chevron-down');
  icon.setAttribute('aria-hidden', 'true');
  decYearBtn.appendChild(icon);

  yearButtonsContainer.appendChild(incYearBtn);
  yearButtonsContainer.appendChild(decYearBtn);
  inputGroup.appendChild(yearInput);
  inputGroup.appendChild(yearButtonsContainer);

  monthYearContainer.appendChild(month);
  monthYearContainer.appendChild(inputGroup);

  // next button
  const nextBtn = document.createElement('button');
  prevBtn.type = 'button';
  icon = document.createElement('i');
  icon.classList.add('fa', 'fa-angle-right');
  icon.setAttribute('aria-hidden', 'true');
  nextBtn.appendChild(icon);

  headerContainer.appendChild(prevBtn);
  headerContainer.appendChild(monthYearContainer);
  headerContainer.appendChild(nextBtn);

  // footer
  const footerContainer = document.createElement('div');
  footerContainer.classList.add('footer');
  let tmpContainer = document.createElement('div');

  const dateFromSpan = document.createElement('span');
  // dateFromSpan.classList.add('active');
  const dateToSpan = document.createElement('span');
  dateFromSpan.textContent = 'date-from';
  dateToSpan.textContent = 'date-to';
  // tmpContainer.innerHTML = `from ${dateFromSpan.outerHTML} to ${dateToSpan.outerHTML}`; // doesn't work for hooking up click events
  tmpContainer.appendChild(dateFromSpan);
  tmpContainer.insertAdjacentText('afterbegin', 'from ');
  tmpContainer.appendChild(dateToSpan);
  dateToSpan.insertAdjacentText('beforebegin', ' to ');
  footerContainer.appendChild(tmpContainer);

  let tmpDate = store.getState().startDate;
  dateFromSpan.textContent = formatDate(tmpDate);
  tmpDate = store.getState().endDate;
  dateToSpan.textContent = formatDate(tmpDate);

  let activeDate = store.getState().activeDate;
  if (activeDate === 1) {
    dateFromSpan.classList.add('active');
  }
  else if (activeDate === 2) {
    dateToSpan.classList.add('active');
  }

  tmpContainer = document.createElement('div');
  tmpContainer.classList.add('buttons');
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'cancel';
  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.textContent = 'apply';
  tmpContainer.appendChild(cancelBtn);
  tmpContainer.appendChild(applyBtn);
  footerContainer.appendChild(tmpContainer);

  prevBtn.addEventListener('click', prevMonthClickHandler.bind({ store: store }), false);
  nextBtn.addEventListener('click', nextMonthClickHandler.bind({ store: store }), false);
  incYearBtn.addEventListener('click', incYearHandler.bind({ store: store }), false);
  decYearBtn.addEventListener('click', decYearHandler.bind({ store: store }), false);
  month.addEventListener('click', monthSelectHandler.bind({ store: store }), false);
  yearInput.addEventListener('input', yearInputHandler.bind({ store: store }), false);
  cancelBtn.addEventListener('click', cancelBtnHandler, false);
  applyBtn.addEventListener('click', applyBtnHandler.bind({ store: store }), false);
  dateFromSpan.addEventListener('click', dateFromClickHandler.bind({ store: store }), false);
  dateToSpan.addEventListener('click', dateToClickHandler.bind({ store: store }), false);

  dateFromSpanRef = dateFromSpan;
  dateToSpanRef = dateToSpan;
  contentSectionRef = contentContainer;
  yearInputRef = yearInput;
  monthRef = month;

  datePickerLabel = document.getElementById('date-picker-label');
  const s = store.getState();
  let formattedStartDate = formatDate(s.startDate);
  let formattedEndDate = formatDate(s.endDate);
  datePickerLabel.textContent = `${formattedStartDate} to ${formattedEndDate}`;

  rootContainer.appendChild(headerContainer);
  rootContainer.appendChild(contentContainer);
  rootContainer.appendChild(footerContainer);
  contentContainer.appendChild(generateDays(store));
}

// Button Event Handlers
function prevMonthClickHandler(ev) {
  let currentMonth = this.store.getState().currentMonth;
  let currentYear = this.store.getState().currentYear;
  if (currentMonth - 1 < 1) {
    this.store.dispatch({ type: 'SELECT_CURRENT_YEAR', currentYear: currentYear - 1 });
    this.store.dispatch({ type: 'SELECT_CURRENT_MONTH', currentMonth: 12 });
    contentSectionRef.innerHTML = '';
    contentSectionRef.appendChild(generateDays(this.store));
    yearInputRef.value = currentYear - 1;
    monthRef.textContent = monthNames[11];
  } else {
    this.store.dispatch({ type: 'SELECT_CURRENT_MONTH', currentMonth: currentMonth - 1 });
    contentSectionRef.innerHTML = '';
    contentSectionRef.appendChild(generateDays(this.store));
    monthRef.textContent = monthNames[currentMonth - 2];
  }
}

function nextMonthClickHandler(ev) {
  let currentMonth = this.store.getState().currentMonth;
  let currentYear = this.store.getState().currentYear;
  if (currentMonth + 1 > 12) {
    this.store.dispatch({ type: 'SELECT_CURRENT_YEAR', currentYear: currentYear + 1 });
    this.store.dispatch({ type: 'SELECT_CURRENT_MONTH', currentMonth: 1 });
    contentSectionRef.innerHTML = '';
    contentSectionRef.appendChild(generateDays(this.store));
    yearInputRef.value = currentYear + 1;
    monthRef.textContent = monthNames[0];
  } else {
    this.store.dispatch({ type: 'SELECT_CURRENT_MONTH', currentMonth: currentMonth + 1 });
    contentSectionRef.innerHTML = '';
    contentSectionRef.appendChild(generateDays(this.store));
    monthRef.textContent = monthNames[currentMonth];
  }
}

function incYearHandler(ev) {
  const currentYear = store.getState().currentYear;
  store.dispatch({ type: 'SELECT_CURRENT_YEAR', currentYear: currentYear + 1 });
  yearInputRef.value = currentYear + 1;
  contentSectionRef.innerHTML = '';
  contentSectionRef.appendChild(generateDays(this.store));
}

function decYearHandler(ev) {
  const currentYear = store.getState().currentYear;
  store.dispatch({ type: 'SELECT_CURRENT_YEAR', currentYear: currentYear - 1 });
  yearInputRef.value = currentYear - 1;
  contentSectionRef.innerHTML = '';
  contentSectionRef.appendChild(generateDays(this.store));
}

function monthSelectHandler(ev) {
  contentSectionRef.innerHTML = '';
  contentSectionRef.appendChild(generateMonths(this.store));
}

function yearInputHandler(ev) {
  if (!isNaN(ev.target.value)) {
    this.store.dispatch({ type: 'SELECT_CURRENT_YEAR', currentYear: Number(ev.target.value) });
    contentSectionRef.innerHTML = '';
    contentSectionRef.appendChild(generateDays(this.store));
  }
}

function cancelBtnHandler(ev) {
  toggleModal();
}

function applyBtnHandler(ev) {
  const startDate = this.store.getState().startDate;
  const endDate = this.store.getState().endDate;
  outputHiddenField.value = formatDateReverse(startDate) + ';' + formatDateReverse(endDate);
  datePickerLabel.textContent = `${formatDate(startDate)} to ${formatDate(endDate)}`;
  toggleModal();
}

function dateFromClickHandler(ev) {
  if (!ev.target.classList.contains('active')) {
    ev.target.classList.add('active');
    this.store.dispatch({ type: 'SELECT_ACTIVE_DATE', activeDate: 1 });
    dateToSpanRef.classList.remove('active');
  }
}

function dateToClickHandler(ev) {
  if (!ev.target.classList.contains('active')) {
    ev.target.classList.add('active');
    this.store.dispatch({ type: 'SELECT_ACTIVE_DATE', activeDate: 2 });
    dateFromSpanRef.classList.remove('active');
  }
}

function reducer(state, action) {
  if (action.type === 'SELECT_CURRENT_YEAR') {
    return {...state, currentYear: action.currentYear }
  }
  else if (action.type === 'SELECT_CURRENT_MONTH') {
    return {...state, currentMonth: action.currentMonth }
  }
  else if (action.type === 'SELECT_CURRENT_DAY') {
    return {...state, currentDay: action.currentDay }
  } 
  else if (action.type === 'SELECT_ACTIVE_DATE') {
    return {...state, activeDate: action.activeDate }
  }
  else if (action.type === 'SET_START_DATE') {
    return {...state, startDate: action.startDate }
  }
  else if (action.type === 'SET_END_DATE') {
    return {...state, endDate: action.endDate }
  }
  else {
    return state;
  }
}

const initialState = {
  currentDay: new Date().getDate(),
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  activeDate: 1,

  startDate: {
    day: 1,
    month: 1,
    year: 2019
  },

  endDate: {
    day: 23,
    month: 1,
    year: 2020
  }
}

function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];

  const subscribe = (listener) => {
    listeners.push(listener);
  };

  const getState = () => (state);

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(l => l());
  };

  return {
    getState,
    dispatch,
    subscribe
  };
}

// Init Sctipt
const store = createStore(reducer, initialState);
const triggerBtn = document.getElementById('trigger');
let modal = document.getElementById("date-picker-modal");
init('date-picker-container', 'outputField', store);

function toggleModal() {
  modal.classList.toggle("show-modal");
}

function windowOnClick(ev) {
  if (ev.target === modal) {
    toggleModal();
  }
}

triggerBtn.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
const daysContainer = document.getElementById('days');
let days = daysContainer.children;
let activeDay;

let isMonthPickerActive = false;

const monthSelector = document.getElementById('month-selector');
monthSelector.onclick = function(ev) {
  if (!isMonthPickerActive) {
    selectMonth('month-picker-container', store);
    isMonthPickerActive = true;
  } else {
    const tmpContainer = document.getElementById('month-picker-container');
    tmpContainer.innerHTML = '';
    isMonthPickerActive = false;
  }
}

// selecting months
function selectMonth(containerId, store) {
  const monthChoices = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  console.log(monthChoices);
  const monthPickerContainer = document.getElementById(containerId);
  const tmpListContainer = document.createElement('ul');
  for (let month of monthChoices) {
    let tmpListElement = document.createElement('li');
    tmpListElement.textContent = month;
    tmpListElement.addEventListener('click', function(ev) {
      // console.log(ev.target.textContent)
      monthSelector.textContent = ev.target.textContent;
      store.dispatch({ type: 'SELECT_CURRENT_MONTH', currentMonth: monthChoices.indexOf(ev.target.textContent) + 1 });
      const tmpContainer = document.getElementById('month-picker-container');
      tmpContainer.innerHTML = '';
      isMonthPickerActive = false;
    });
    tmpListContainer.appendChild(tmpListElement);
  }
  monthPickerContainer.appendChild(tmpListContainer);
}

/*
Generating days
*/
function generateDays(store) {
  const containerFragment = document.createDocumentFragment();
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const daysInNonLeapYear = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const baseDayOfTheWeek = {
    day: 1,
    month: 1,
    year: 2000,
    dayOfTheWeek: 5 // 0-6, 0 = monday, 6 = sunday
  }
  let i;
  // 1. generate divs containing day names
  for (i = 0; i < dayNames.length; i++) {
    let tmpDiv = document.createElement('div');
    tmpDiv.classList.add('day');
    tmpDiv.textContent = dayNames[i];
    containerFragment.appendChild(tmpDiv);
  }

  // 2. generate empty divs
  for (i = 0; i < 5; i++) {
    let tmpDiv = document.createElement('div');
    containerFragment.appendChild(tmpDiv);
  }

  // 3. genearte numbered divs
  for (i = 1; i <= 29; i++) {
    let tmpDiv = document.createElement('div');
    tmpDiv.classList.add('number');
    tmpDiv.textContent = i;
    if (i === store.getState().currentDay) {
      activeDay = tmpDiv;
      activeDay.classList.toggle('active');
    }
    tmpDiv.addEventListener('click', function(ev) {
      activeDay.classList.toggle('active');
      activeDay = ev.target;
      activeDay.classList.toggle('active');
      store.dispatch({ type: 'SELECT_CURRENT_DAY', currentDay: Number(ev.target.textContent) });
      let tmpDate = {
        day: Number(ev.target.textContent),
        month: store.getState().currentMonth,
        year: store.getState().currentYear,
      }
      if (store.getState().activeDate === 1) {
        store.dispatch({ type: 'SET_START_DATE', startDate: tmpDate });
      } else {
        store.dispatch({ type: 'SET_END_DATE', endDate: tmpDate });
      }
      
      
      let tmpActiveDate = store.getState().activeDate;
      if (tmpActiveDate === 1) {
        updateSelectedDate(dateFromSpan);
      } else if (tmpActiveDate === 2) {
        updateSelectedDate(dateToSpan);
      }
    });
    containerFragment.appendChild(tmpDiv);
  }

  return containerFragment;
}

function isLeapYear(year) {
  return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
}

/*
Add click handlers to numbers in the days container
*/
/*for (let day of days) {
  if (day.classList.contains('number')) {
    if (Number(day.textContent) === 17) {
      activeDay = day;
      activeDay.classList.toggle('active');
    }
    day.addEventListener('click', function(ev) {
      // console.log(ev.target.textContent);
      activeDay.classList.toggle('active');
      activeDay = ev.target;
      activeDay.classList.toggle('active');
      store.dispatch({ type: 'SELECT_CURRENT_DAY', currentDay: Number(day.textContent) });
      let tmpActiveDate = store.getState().activeDate;
      if (tmpActiveDate === 1) {
        updateSelectedDate(dateFromSpan);
      } else if (tmpActiveDate === 2) {
        updateSelectedDate(dateToSpan);
      }
    });
  }
}*/

const dateFromSpan = document.getElementById('date-from');
const dateToSpan = document.getElementById('date-to');

dateFromSpan.addEventListener('click', function(ev) {
  dateToSpan.classList.remove('active');
  ev.target.classList.add('active');
  store.dispatch({ type: 'SELECT_ACTIVE_DATE', activeDate: 1 });
});

dateToSpan.addEventListener('click', function(ev) {
  dateFromSpan.classList.remove('active');
  ev.target.classList.add('active');
  store.dispatch({ type: 'SELECT_ACTIVE_DATE', activeDate: 2 });
});

function updateSelectedDate(date) {
  const tmpState = store.getState();
  let day = tmpState.currentDay;
  let month = tmpState.currentMonth;
  let year = tmpState.currentYear;
  // date.textContent = `${day}-${month}-${year}`;
  date.textContent = formatDate(day, month, year);
}

function formatDate(day, month, year) {
  let dateStr = '';
  if (Number(day) < 10) {
    dateStr += '0' + day + '-';
  } else {
    dateStr += day + '-';
  }
  if (Number(month) < 10) {
    dateStr += '0' + month + '-';
  } else {
    dateStr += month + '-';
  }
  return dateStr + year;
}



/*
current year
current month
current day

date1 (from)
date2 (to)
*/

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

const selectYearAction = {
  type: 'SELECT_CURRENT_YEAR',
  currentYear: 2031
}


const initialState = {
  currentDay: 18,
  currentMonth: 8,
  currentYear: 2020,
  activeDate: 1,

  startDate: {
    day: 1,
    month: 1,
    year: 2019
  },

  endDate: {
    day: 1,
    month: 1,
    year: 2020
  }
}

// Set up the redux store
const store = createStore(reducer, initialState);

function listener1() {
  const tmpState = store.getState();
  let day = tmpState.currentDay;
  let month = tmpState.currentMonth;
  let year = tmpState.currentYear;
  // console.log(`${day}-${month}-${year}`);
  // console.log(formatDate(day, month, year));
  console.log(tmpState);
}

store.subscribe(listener1);

// store.dispatch(selectYearAction);
// store.dispatch({ type:'SELECT_CURRENT_YEAR', currentYear: 2019 });
// store.dispatch({ type:'SELECT_CURRENT_YEAR', currentYear: 2019 });

// store.dispatch({ type: 'default' });



// Need store reference

daysContainer.appendChild(generateDays(store));

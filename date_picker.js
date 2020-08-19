const daysContainer = document.getElementById('days');
let days = daysContainer.children;
let activeDay;

/*
Generating days
*/
function generateDays() {
  const containerFragment = document.createDocumentFragment();
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
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
    containerFragment.appendChild(tmpDiv);
  }

  return containerFragment;
}

// daysContainer.appendChild(generateDays());

/*
Add click handlers to numbers in the days container
*/
for (let day of days) {
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
}

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
  activeDate: 1
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





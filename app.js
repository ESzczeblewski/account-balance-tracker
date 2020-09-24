import { sanitize } from 'dompurify';

const form = document.querySelector('.add');
const inputText = document.querySelector('input[name="name"]');
const inputNumber = document.querySelector('input[name="value"]');
const historyList = document.querySelector('.history__list');
// const balance = document.querySelector('.balance');
const currentBalance = document.querySelector('.balance span');
const income = document.querySelector('.expenses__income span');
const expense = document.querySelector('.expenses__expense span');
// const submitBtn = document.querySelector('button[type="submit"]');
let state = [];

function handleSubmit(e) {
  e.preventDefault();
  const name = inputText.value;
  const { value } = inputNumber;
  const transaction = {
    name,
    value,
    id: Date.now(),
    plus: value > 0,
  };
  state.push(transaction);
  e.target.reset();
  historyList.dispatchEvent(new CustomEvent('listUpdated'));
}

function addToHistory() {
  const html = state
    .map(
      (item) => `<li class="${item.plus ? 'plus' : 'minus'}">
    <button value="${item.id}">&times;</button>
    <span class="name">${item.name}</span>
    <span class="value">${item.value}</span>
    </li>`
    )
    .join('');
  historyList.innerHTML = sanitize(html, {
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  });
}

function identifyTransaction() {
  let currentIncome = 0;
  let currentExpenses = 0;
  state.forEach(function (item) {
    if (item.value > 0) {
      currentIncome += parseInt(item.value);
    } else if (item.value < 0) {
      currentExpenses += parseInt(item.value);
    }
  });
  income.textContent = `$${currentIncome}`;
  expense.textContent = `$${currentExpenses}`;
  // Update overall balance
  currentBalance.textContent = `$${currentIncome + currentExpenses}`;
}
function deleteTransaction(id) {
  const newState = state.filter(function (item) {
    return item.id !== id;
  });
  state = newState;
  historyList.dispatchEvent(new CustomEvent('listUpdated'));
}

function saveStateToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(state));
}

function restoreFromLocalStorage() {
  const stateRef = JSON.parse(localStorage.getItem('transactions'));
  if (stateRef) {
    state.push(...stateRef);
    addToHistory();
  }
  historyList.dispatchEvent(new CustomEvent('listUpdated'));
}

form.addEventListener('submit', handleSubmit);
historyList.addEventListener('listUpdated', identifyTransaction);
historyList.addEventListener('listUpdated', addToHistory);
historyList.addEventListener('listUpdated', saveStateToLocalStorage);
historyList.addEventListener('click', function (e) {
  const id = parseInt(e.target.value);
  deleteTransaction(id);
});
restoreFromLocalStorage();

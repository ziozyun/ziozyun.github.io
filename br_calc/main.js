const elements = {
  bank: document.getElementById('bank'),
  register: document.getElementById('register'),
  calculate: document.getElementById('calculate'),
  tableBody: document.getElementById('table-body'),
  sumBank: document.getElementById('sum-bank'),
  sumRegister: document.getElementById('sum-register'),
  sumDifference: document.getElementById('sum-difference'),
  filterDate: document.getElementById('filter-date'),
  filterCode: document.getElementById('filter-code'),
  filterTitle: document.getElementById('filter-title'),
  filterBank: document.getElementById('filter-bank'),
  filterRegister: document.getElementById('filter-register'),
  filterDifference: document.getElementById('filter-difference'),
};

function parseExcelString(text, columns) {
  const rows = text.split('\n');
  let result = [], tmpCols, tmpObj;
  for (let i = 0, length = rows.length; i < length; i++) {
    if (rows[i] !== '') {
      tmpCols = rows[i].split('\t');
      tmpObj = {};
      for (const column in columns) {
        if (columns.hasOwnProperty(column)) {
          tmpObj[column] = tmpCols[columns[column]];
        }
      }
      result.push(tmpObj);
    }
  }
  return result;
}

function getDate(string) {
  const date = string.split(' ').shift().split('.');
  return `${date[1]}.${date[2]}`;
}

function getCode(string) {
  if (string['substr'](0, 2) === '00') {
    return string['substr'](2);
  }
  return string;
}

function getTD(value, name) {
  const td = document.createElement('td');
  td.innerText = value;
  td.dataset.name = name;
  return td;
}

function setDrawRows(dataInfo) {
  let drawData = {}, date, code, keys = {};
  for (const k in dataInfo) {
    if (dataInfo.hasOwnProperty(k)) {
      keys[k] = 0;
    }
  }
  for (const key in dataInfo) {
    if (dataInfo.hasOwnProperty(key)) {
      for (const row of dataInfo[key]) {
        code = getCode(row.code);
        date = getDate(row.date);
        if (drawData.hasOwnProperty(row.code)) {
          if (drawData[code].dateList.hasOwnProperty(date)) {
            drawData[code].dateList[date][key] += parseFloat(row.sum);
          } else {
            drawData[code].dateList[date] = Object.assign({}, keys);
            drawData[code].dateList[date][key] = parseFloat(row.sum);
          }
        } else {
          drawData[code] = {
            title: row.title,
            dateList: {
              [date]: Object.assign({}, keys)
            }
          };
          drawData[code].dateList[date][key] = parseFloat(row.sum);
        }
      }
    }
  }
  return drawData;
}

elements.calculate.addEventListener('click', function () {
  let drawRows = setDrawRows({
    bankData: parseExcelString(elements.bank.value, {
      date: parseInt(document.getElementById('bank_date').value),
      title: parseInt(document.getElementById('bank_title').value),
      code: parseInt(document.getElementById('bank_code').value),
      sum: parseInt(document.getElementById('bank_sum').value)
    }),
    registerData: parseExcelString(elements.register.value, {
      date: parseInt(document.getElementById('register_date').value),
      title: parseInt(document.getElementById('register_title').value),
      code: parseInt(document.getElementById('register_code').value),
      sum: parseInt(document.getElementById('register_sum').value)
    })
  });
  let bankSum = 0, registerSum = 0, differenceSum = 0, difference;
  elements.tableBody.innerHTML = '';
  elements.sumBank.innerText = '0';
  elements.sumRegister.innerText = '0';
  elements.sumDifference.innerHTML = '0';
  for (const code in drawRows) {
    if (drawRows.hasOwnProperty(code)) {
      for (const date in drawRows[code].dateList) {
        if (drawRows[code].dateList.hasOwnProperty(date)) {
          const tr = document.createElement('tr');
          elements.tableBody.appendChild(tr);
          tr.appendChild(getTD(date, 'date'));
          tr.appendChild(getTD(code, 'code'));
          tr.appendChild(getTD(drawRows[code].title, 'title'));
          tr.appendChild(getTD(drawRows[code].dateList[date].bankData, 'bank'));
          tr.appendChild(getTD(drawRows[code].dateList[date].registerData, 'register'));
          difference = drawRows[code].dateList[date].bankData - drawRows[code].dateList[date].registerData;
          tr.appendChild(getTD(difference, 'difference'));
          bankSum += drawRows[code].dateList[date].bankData;
          registerSum += drawRows[code].dateList[date].registerData;
          differenceSum += difference;
        }
      }
    }
  }
  elements.sumBank.innerText = bankSum.toString();
  elements.sumRegister.innerText = registerSum.toString();
  elements.sumDifference.innerHTML = differenceSum.toString();
});

function filterHandler() {
  let bankSum = 0, registerSum = 0, differenceSum = 0, display, bank, register, difference;
  for (const td of elements.tableBody.childNodes) {
    bank = td.querySelector('[data-name="bank"]').innerText;
    register = td.querySelector('[data-name="register"]').innerText;
    difference = td.querySelector('[data-name="difference"]').innerText;
    if (td.querySelector('[data-name="date"]').innerText.indexOf(elements.filterDate.value) + 1 &&
      td.querySelector('[data-name="code"]').innerText.indexOf(elements.filterCode.value) + 1 &&
      td.querySelector('[data-name="title"]').innerText.indexOf(elements.filterTitle.value) + 1 &&
      bank.indexOf(elements.filterBank.value) + 1 &&
      register.indexOf(elements.filterRegister.value) + 1 &&
      difference.indexOf(elements.filterDifference.value) + 1) {
      display = 'table-row';
      bankSum += parseFloat(bank);
      registerSum += parseFloat(register);
      differenceSum += parseFloat(difference)
    } else {
      display = 'none';
    }
    td.style.display = display;
    elements.sumBank.innerText = bankSum.toString();
    elements.sumRegister.innerText = registerSum.toString();
    elements.sumDifference.innerHTML = differenceSum.toString();
  }
}

elements.filterDate.addEventListener('input', filterHandler);
elements.filterCode.addEventListener('input', filterHandler);
elements.filterTitle.addEventListener('input', filterHandler);
elements.filterBank.addEventListener('input', filterHandler);
elements.filterRegister.addEventListener('input', filterHandler);
elements.filterDifference.addEventListener('input', filterHandler);
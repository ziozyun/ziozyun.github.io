const elements = {
  bank: document.getElementById('bank'),
  register: document.getElementById('register'),
  calculate: document.getElementById('calculate'),
  tableBody: document.getElementById('table-body'),
  sumBank: document.getElementById('sum-bank'),
  sumRegister: document.getElementById('sum-register'),
  sumDifference: document.getElementById('sum-difference')
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

function getTD(value) {
  const td = document.createElement('td');
  td.innerText = value;
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
      date: 8, title: 14, code: 15, sum: 21
    }),
    registerData: parseExcelString(elements.register.value, {
      date: 2, title: 9, code: 7, sum: 11
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
          tr.appendChild(getTD(date));
          tr.appendChild(getTD(code));
          tr.appendChild(getTD(drawRows[code].title));
          tr.appendChild(getTD(drawRows[code].dateList[date].bankData));
          tr.appendChild(getTD(drawRows[code].dateList[date].registerData));
          difference = drawRows[code].dateList[date].bankData - drawRows[code].dateList[date].registerData;
          tr.appendChild(getTD(difference));
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
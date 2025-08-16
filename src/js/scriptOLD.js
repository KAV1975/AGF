"use strict";

// РАСЧЕТ НА 7 ЛЕТ

//ПЕРЕМЕННЫЕ

// 1. Переменные для ввода значений

let square = 1000, //плошадь Помещения вводимое значение. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА ОТРЕЗОК [700;1500] И ЧИСЛОВОЙ ТИП
  rentalRate = 500, //  арендная ставка руб за м² в мес. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП
  loanAmount = 0, // Сумма кредита. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП
  interestRate = 0, // Процентная ставка. Важно: при вводе учитывать % или число!. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП
  loanPeriod = 0; // Срок кредита в мес. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И <= 84 и ЧИСЛОВОЙ ТИП
let keyRate = 0.2; /* Ключевая ставка. Впринципе можно брать с внешнего источника. Если ввод. Важно: при вводе учитывать % или число!. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП*/

//2. Переменные (наша сатистика и базовая модель)

const price = 14000; // Базовая цена на 1-й год
const discountForOld = 500; // Скидка на цену Продления
const utility = 2160 / 12; //Коммуналка руб на м² в мес
const crm = 297440 / 12; //СКУД, CRM, Мобифитнес руб на м² в мес
const cleaning = 1380 / 12; //Клининг в мес
const aho = 231360 / 14 / 12; //Клининг в мес. В расчете добавить в Клининг. Индексация уже по сумме
const household = 1181730.676 / 14 / 12; // Текущие хозяйственные расходы в мес
const exploitation = (270 + 60) / 12; // Эксплуатация инж сетей и здания в мес
const security = 1646707.6 / 14 / 12; // Охрана и улица
const simulatorRepairs = 0.014; //Ремонт тренажеров. Доля от поступления по картам
const it = 5050353 / 14 / 12; //ИТ, телефония, интернет месяц
const acquiring = 0.015; //Эквайринг от выручки карт
const bank = 0.007; // Банковское обслуживание от выручки карт
const ticketOffice = 398200 / 14 / 12; // Кассовое оборудование в мес
const staff = 20000; // Обучение и подбор персонала месяц
const marketing = 0.021; // Реклама. Доля от выручки по картам
const payback = 0.044; // Возвраты. Доля от выручки по картам
const plastic = 0.002; // Пластикове карты. Доля от выручки по картам
const insurance = 30; //Страховка м² в год Платеж один раз в год
const copyright = 70 / 12; //Авторские права руб на м² в мес
const coefPrice = 1.03; // коэффициент увелечения базовой цены по годам
const coefRent = 1.07; //Коэффициент ежегодной индексации Аренды
const coefUtility = 1.05; //Коэффициент ежегодной индексации Коммуналки
const coefCrm = 1.05; //Коэффициент ежегодной индексации CRM
const coefCleaning = 1.05; //Коэффициент ежегодной индексации Клининг
const coefHousehold = 1.05; //Коэффициент ежегодной индексации Текщих хозов
const partOld = 0.4; //Доля продлений
const partCoach = 0.04; //Доля поступления по Тренерам от выручки картам. По "новой схеме".
const monthNumber = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // номера месяцев для цикла, технический массив
const dayInMonth = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30]; //начало с декабря индекс 0 -> декабрь
// Базовый план для модели расчетов ЗП
const basePlan = {
  1: 3170000,
  2: 2533000,
  3: 2770000,
  4: 1823000,
  5: 1868000,
  6: 1337000,
  7: 1570000,
  8: 2436000,
  9: 2359000,
  10: 3112000,
  11: 2345000,
  12: 3068000,
};

const mrot2025 = 22440;
const coefFOT = 1.03;
const countAdmin = 3;
const countMOP = 4;

//ФУНКЦИИ

// Формула округления с определенной кратностью вниз
const roundingWithMultiplicityFloor = function (num, mult) {
  return Math.floor(num / mult) * mult;
};

// Формула округления с определенной кратностью ввверх
const roundingWithMultiplicityCeil = function (num, mult) {
  return Math.ceil(num / mult) * mult;
};

// Формула округления с определенной кратностью
const roundingWithMultiplicity = function (num, mult) {
  return Math.round(num / mult) * mult;
};

//Коэффициент количества продаж от площади. Аргумент = площадь помещения
function salesRatio(square) {
  let ratio = 0;
  if (square && Number.isInteger(square)) {
    if (square > 0 && square <= 1100) {
      ratio = 2.4;
    } else if (square > 1100 && square <= 1500) {
      ratio = 4 * 10 ** -6 * square ** 2 - 0.0124 * square + 11.449;
    } else if (square > 1500) {
      ratio = 19.78 * square ** -0.324;
    }
  }
  return ratio;
}

// Расчет Премии выполнения по Управам
function upravBonusPlan(partPlan) {
  let bonus = 0;
  if (partPlan >= 0.8 && partPlan <= 1) {
    bonus = 165000 * partPlan - 115000;
  } else if (partPlan > 1) {
    bonus = 50000 + 6897; //50 тр + премия "15-е число"
  }
  return bonus;
}

// Расчет Премии Перевыполнения по Управам
function upravBonusOverPlan(partPlan, delta) {
  let bonus = 0;
  if (partPlan > 1) {
    bonus = 11494 + 5747 * Math.floor(delta / 10 ** 5);
  }
  return bonus;
}

// Расчет Премии Перевыполнения по Маркетологам

function marketologBonusPlan(partPlan) {
  let bonus = 0;
  if (partPlan >= 0.8 && partPlan < 1) {
    bonus = 178000 * partPlan - 107900;
  } else if (partPlan >= 1) {
    bonus = 70100;
  }
  return bonus;
}

//Квартальная Премия Управ и Маркетолог
function bonusQ(partQ) {
  let bonus = 0;
  if (partQ >= 1) {
    bonus = 30000;
  }
  return bonus;
}

//Годовая Премия  Маркетолог
function bonusY(partY) {
  let bonus = 0;
  if (partY >= 1) {
    bonus = 120000;
  }
  return bonus;
}

//Премия с продаж МОП
function bonusMOP(sale) {
  let bonus = 0;
  let KPI = 6000;
  if (sale >= 120000 && sale < 240000) {
    bonus = 660 + (sale - 120000) * 0.03;
  } else if (sale >= 240000 && sale < 360000) {
    bonus = 6000 + (sale - 240000) * 0.03;
  } else if (sale >= 360000 && sale < 480000) {
    bonus = KPI + 6000 + (sale - 360000) * 0.03;
  } else if (sale >= 480000 && sale < 700000) {
    bonus = KPI + 10320 + (sale - 480000) * 0.03;
  } else if (sale >= 700000 && sale < 800000) {
    bonus = KPI + 13320 + (sale - 480000) * 0.045;
  } else if (sale >= 800000 && sale < 960000) {
    bonus = KPI + 15320 + (sale - 480000) * 0.055;
  } else if (sale >= 960000) {
    bonus = KPI + 15320 + (sale - 480000) * 0.07;
  }
  return bonus;
}

// расчет зарплатных фондов
function fundsFOT(fot) {
  let fund = 0;
  if (fot > mrot2025) {
    fund = (fot - mrot2025) * 0.15 + mrot2025 * 0.3;
  } else if (fot > 0 && fot <= mrot2025) {
    fund = fot * 0.3;
  }
  return fund;
}

// Расчет ануитетного платежа
function annuity(loanAmount, interestRate, loanPeriod) {
  let annuityPay = 0;
  let interestRateM = interestRate / 12; // процентная ставка в месяц
  if (loanPeriod > 0 && interestRate > 0) {
    annuityPay =
      (loanAmount * interestRateM * (1 + interestRateM) ** loanPeriod) /
      ((1 + interestRateM) ** loanPeriod - 1);
  } else if (loanPeriod > 0 && interestRate == 0) {
    annuityPay = loanAmount / loanPeriod;
  }
  return annuityPay;
}

// Расчет процентов в месяце
function interestMonth(amount_, interestRate, numberMonth) {
  return (amount_ * interestRate * dayInMonth[numberMonth % 12]) / 365;
}

//----------------------------------------------------------------------------

// ИНВЕСТИЦИИ В ОТКРЫТИЕ
//Стоимости инвестиций постатейно (объект, для возможности быстрых корректировок, при необходимости)
const investment = {
  constructionInstallationWorks: 10500 * square,
  electrical: 4300 * square,
  waterAndSewage: 2900 * square,
  ventilationAndConditioning: 5800 * square,
  automaticFireAlarmSystem: 1600 * square,
  accessControlManagementSystemAndCRM: 10 ** 6,
  acousticsVideoAndcomputerNetworks:
    square < 1000 ? 1.2 * 10 ** 6 : 1200 * square,
  lockerRoomFurniture: 0.1 * 1.25 * 5000 * salesRatio(square) * square,
  furnitureSalesDepartment: square <= 1000 ? 2 * 10 ** 5 : 200 * square,
  furnitureReception: square <= 1000 ? 2 * 10 ** 5 : 200 * square,
  furnitureBar: square <= 1000 ? 2 * 10 ** 5 : 200 * square,
  equipment:
    square <= 1000
      ? 1.5 * 10 ** 7
      : 45155 * square - 4365 * square * Math.log(square),
  advertisementConstruction: square <= 1000 ? 5 * 10 ** 5 : 500 * square,
  other: 5 * 10 ** 5,
  startupServices:
    square <= 1000 ? 1.2 * 10 ** 7 : 3240 * square + 8.856 * 10 ** 6,
};

// Расчет суммы инвестиций
let sumInvestments = 0;
for (let key in investment) {
  sumInvestments += investment[key];
}

//-------------------------------------------------------------------------

// ПРИХОД

// Цены карт по годам на Новые карты
const priceNew = { 1: price };
for (let i = 2; i <= 7; i++) {
  priceNew[i] = roundingWithMultiplicityFloor(
    price * coefPrice ** (i - 1),
    100
  );
}

// Цены карт по годам на Продления
const priceOld = { 1: 14000, 2: price - discountForOld };
for (let i = 3; i <= 7; i++) {
  priceOld[i] = priceNew[i - 1] - discountForOld;
}

// коэффициент сезоннности. Для расчета количества продаж по месяцам

const coeffSeason = {
  1: 296.2 / 2669.2,
  2: 236.7 / 2669.2,
  3: 258.8 / 2669.2,
  4: 170.3 / 2669.2,
  5: 181 / 2669.2,
  6: 129.5 / 2669.2,
  7: 152.1 / 2669.2,
  8: 227.6 / 2669.2,
  9: 220.4 / 2669.2,
  10: 290.8 / 2669.2,
  11: 219.1 / 2669.2,
  12: 286.7 / 2669.2,
};

// Количество продаж по годам
const countClientYear = {
  1: salesRatio(square) * square,
  2: roundingWithMultiplicityCeil(salesRatio(square) * square * 1.1, 100),
};

for (let i = 3; i <= 7; i++) {
  countClientYear[i] = countClientYear[2];
}

// Количество продаж Новые/старые по месяцам
const countClientMonth = {};
for (let i = 1; i <= 12; i++) {
  countClientMonth[i] = { new_: countClientYear[1] * coeffSeason[i], old: 0 };
}

for (let i = 13; i <= 7 * 12; i++) {
  countClientMonth[i] = {
    new_:
      countClientYear[Math.ceil(i / 12)] * coeffSeason[monthNumber[i % 12]] -
      (countClientMonth[i - 12]["new_"] + countClientMonth[i - 12]["old"]) *
        partOld,
    old:
      (countClientMonth[i - 12]["new_"] + countClientMonth[i - 12]["old"]) *
      partOld, // доля продлений от количества продаж в этом месяце год назад
  };
}

//-------------------------------------------------------------------------------

// ВЫРУЧКА

// По картам мес
const earningsCardMonth = {};
for (let i = 1; i <= 84; i++) {
  if (i % 12 != 5 && i % 12 != 6 && i % 12 != 7) {
    earningsCardMonth[i] =
      countClientMonth[i]["new_"] * priceNew[Math.ceil(i / 12)] +
      countClientMonth[i]["old"] * priceOld[Math.ceil(i / 12)];
  } else if (i % 12 == 5 || i % 12 == 6 || i % 12 == 7) {
    earningsCardMonth[i] =
      countClientMonth[i]["new_"] * (priceNew[Math.ceil(i / 12)] - 500) +
      countClientMonth[i]["old"] * priceOld[Math.ceil(i / 12)];
  }
}

// По кратам год
const earningsCardYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  earningsCardYear[Math.ceil(m / 12)] += earningsCardMonth[m];
}

// По Тренерам мес
const CoachInMonth = {};
for (let i = 1; i <= 84; i++) {
  CoachInMonth[i] = earningsCardMonth[i] * partCoach;
}

// По тренерам год
const CoachInYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  CoachInYear[Math.ceil(m / 12)] += CoachInMonth[m];
}

// Аренда вход мес
const RentInMonth = {};
for (let i = 1; i <= 8; i++) {
  RentInMonth[i] = 10 ** 4;
}
for (let i = 9; i <= 84; i++) {
  RentInMonth[i] = 1.5 * 10 ** 4;
}

// Аренда вход год
const RentInYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  RentInYear[Math.ceil(m / 12)] += RentInMonth[m];
}

//Прочие поступления мес
const otherInMonth = {};
for (let i = 1; i <= 84; i++) {
  otherInMonth[i] = 5000;
}

// Прочее вход год
const otherInYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  otherInYear[Math.ceil(m / 12)] += otherInMonth[m];
}

// Общая выручка по месяцам
const earningsMonth = {};
for (let i = 1; i <= 84; i++) {
  earningsMonth[i] =
    earningsCardMonth[i] + CoachInMonth[i] + RentInMonth[i] + otherInMonth[i];
}

// ОБЩАЯ ВЫРУЧКА ПО ГОДАМ
const earningsYear = {};
for (let i = 1; i <= 7; i++) {
  earningsYear[i] =
    earningsCardYear[i] + CoachInYear[i] + RentInYear[i] + otherInYear[i];
}

//--------------------------------------------------------------------------

//РАСХОДЫ ОПЕРАЦИОННЫЕ

// Арендная плата месяц
const rentOutMonth = {};
for (let i = 1; i <= 84; i++) {
  rentOutMonth[i] = square * rentalRate * coefRent ** (Math.ceil(i / 12) - 1);
}

// Арендная плата год
const rentOutYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  rentOutYear[Math.ceil(m / 12)] += rentOutMonth[m];
}

// Коммуналка месяц
const utilityMonth = {};
for (let i = 1; i <= 84; i++) {
  utilityMonth[i] = square * utility * coefUtility ** (Math.ceil(i / 12) - 1);
}

// Коммуналка год
const utilityYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  utilityYear[Math.ceil(m / 12)] += utilityMonth[m];
}

// CRM, СКУД, Мобифитнес месяц
const crmMonth = {};
for (let i = 1; i <= 84; i++) {
  crmMonth[i] = crm * coefCrm ** (Math.ceil(i / 12) - 1);
}

// CRM, СКУД, Мобифитнес  год
const crmYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  crmYear[Math.ceil(m / 12)] += crmMonth[m];
}

// Клининг + АХО месяц
const cleaningMonth = {};
for (let i = 1; i <= 84; i++) {
  cleaningMonth[i] =
    (cleaning * square + aho) * coefCleaning ** (Math.ceil(i / 12) - 1);
}

// Клининг + АХО год
const cleaningYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  cleaningYear[Math.ceil(m / 12)] += cleaningMonth[m];
}

// Текущие хозы месяц
const householdMonth = {};
for (let i = 1; i <= 84; i++) {
  householdMonth[i] = household * coefHousehold ** (Math.ceil(i / 12) - 1);
}

// Текущие хозы год
const householYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  householYear[Math.ceil(m / 12)] += householdMonth[m];
}

// Эксплуатация здания, сетей, улица и охрана мес
const exploitationMonth = {};
for (let i = 1; i <= 84; i++) {
  exploitationMonth[i] = exploitation * square + security;
}

// Эксплуатация здания, сетей, улица и охрана год
const exploitationYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  exploitationYear[Math.ceil(m / 12)] += exploitationMonth[m];
}

// Ремонт и ТО тренажеров + мелкие закупки расходки месяц
const simulatorRepairsMonth = {};
for (let i = 1; i <= 84; i++) {
  simulatorRepairsMonth[i] = simulatorRepairs * earningsCardMonth[i];
}

// Ремонт и ТО тренажеров + мелкие закупки расходки год
const simulatorRepairsYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  simulatorRepairsYear[Math.ceil(m / 12)] += simulatorRepairsMonth[m];
}

// ИТ, телефония, интернет месяц
const itMonth = {};
for (let i = 1; i <= 84; i++) {
  itMonth[i] = it;
}

// ИТ, телефония, интернет год
const itYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  itYear[Math.ceil(m / 12)] += itMonth[m];
}

// Эквайринг месяц
const acquiringMonth = {};
for (let i = 1; i <= 84; i++) {
  acquiringMonth[i] = acquiring * earningsCardMonth[i];
}

// Эквайрин год
const acquiringYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  acquiringYear[Math.ceil(m / 12)] += acquiringMonth[m];
}

// Банковское обслуживание и кассы месяц
const bankMonth = {};
for (let i = 1; i <= 84; i++) {
  bankMonth[i] = bank * earningsCardMonth[i] + ticketOffice;
}

// Банковское обслуживание и кассы  год
const bankYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  bankYear[Math.ceil(m / 12)] += bankMonth[m];
}

// Обучение и подбор персонала месяц
const staffMonth = {};
for (let i = 1; i <= 84; i++) {
  staffMonth[i] = staff;
}

// Обучение и подбор персонала год
const staffYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  staffYear[Math.ceil(m / 12)] += staffMonth[m];
}

// Реклама месяц
const marketingMonth = {};
for (let i = 1; i <= 84; i++) {
  marketingMonth[i] = marketing * earningsCardMonth[i];
}

// Реклама год
const marketingYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  marketingYear[Math.ceil(m / 12)] += marketingMonth[m];
}

// Возвраты месяц
const paybackMonth = {};
for (let i = 1; i <= 84; i++) {
  paybackMonth[i] = payback * earningsCardMonth[i];
}

// Возвраты год
const paybackYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  paybackYear[Math.ceil(m / 12)] += paybackMonth[m];
}

// Пластиковые карты месяц
const plasticMonth = {};
for (let i = 1; i <= 84; i++) {
  plasticMonth[i] = plastic * earningsCardMonth[i];
}

// Пластиковые карты  год
const plasticYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  plasticYear[Math.ceil(m / 12)] += plasticMonth[m];
}

//Авторские права месяц
const copyrightMonth = {};
for (let i = 1; i <= 84; i++) {
  copyrightMonth[i] = copyright * square;
}

// Авторские права год
const copyrightYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  copyrightYear[Math.ceil(m / 12)] += copyrightMonth[m];
}

//Страховка по месяцам. Платеж один раз в год
const insuranceMonth = {};
for (let i = 1; i <= 84; i++) {
  if (i % 12 == 1) {
    insuranceMonth[i] = insurance * square;
  } else {
    insuranceMonth[i] = 0;
  }
}

// Страховка год. Платеж один раз в год
const insuranceYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  insuranceYear[Math.ceil(m / 12)] += insuranceMonth[m];
}

//Прочие расходы месяц
const otherMonth = {};
for (let i = 1; i <= 84; i++) {
  otherMonth[i] = 10 ** 4;
}

// Прочие расходы  год
const otherYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  otherYear[Math.ceil(m / 12)] += otherMonth[m];
}

//------------------------------------------------------------------------------

//РАСЧЕТЫ ФОТ
// Базовый план для расчета ФОТ в модели
for (let i = 13; i <= 24; i++) {
  basePlan[i] = roundingWithMultiplicityCeil(basePlan[i - 12] * 1.19, 1000);
}

for (let i = 25; i <= 36; i++) {
  basePlan[i] = roundingWithMultiplicityCeil(basePlan[i - 12] * 1.01, 1000);
}

for (let i = 37; i <= 84; i++) {
  basePlan[i] = basePlan[i - 12];
}

// Выполнение базового плана, для расчета ФОТ
const partOverPlan = {};
for (let i = 1; i <= 84; i++) {
  partOverPlan[i] = earningsCardMonth[i] / basePlan[i];
}

// Сумма перевыполнения базового плана, для расчета ФОТ
const deltaPlan = {};
for (let i = 1; i <= 84; i++) {
  if (earningsCardMonth[i] > basePlan[i]) {
    deltaPlan[i] = earningsCardMonth[i] - basePlan[i];
  } else {
    deltaPlan[i] = 0;
  }
}

// Выполнение квартальные для расчета премии квартальной
const partQ = {};
for (let i = 1; i <= 84; i++) {
  if (i != 1 && (i % 12 == 1 || i % 12 == 4 || i % 12 == 7 || i % 12 == 10)) {
    partQ[i] =
      (earningsCardMonth[i - 3] +
        earningsCardMonth[i - 2] +
        earningsCardMonth[i - 1]) /
      (basePlan[i - 3] + basePlan[i - 2] + basePlan[i - 1]);
  } else {
    partQ[i] = 0;
  }
}

// Выполнение годовое для расчета премии квартальной
const partY = {};
for (let i = 1; i <= 84; i++) {
  if (i != 1 && i % 12 == 1) {
    let temp1 = 0,
      temp2 = 0;
    for (let j = i - 12; j < i; j++) {
      temp1 += earningsCardMonth[j];
      temp2 += basePlan[j];
    }
    partY[i] = temp1 / temp2;
  } else if (i == 84) {
    let temp1 = 0,
      temp2 = 0;
    for (let j = 72; j <= 84; j++) {
      temp1 += earningsCardMonth[j];
      temp2 += basePlan[j];
    }
    partY[i] = temp1 / temp2;
  } else {
    partY[i] = 0;
  }
}

// Управы месяц
const upravMonth = {};
for (let i = 1; i <= 84; i++) {
  upravMonth[i] =
    44000 +
    upravBonusPlan(partOverPlan[i]) +
    upravBonusOverPlan(partOverPlan[i], deltaPlan[i]) +
    10000 / 0.87 +
    RentInMonth[i] * 0.1 +
    bonusQ(partQ[i]); //44 тр = 35 000 р (Оклад) + 8 621 р (KPI), 10000/0.87 за текучесть
}

//Управы год
const upravYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  upravYear[Math.ceil(m / 12)] += upravMonth[m];
}

//Бухгалтер месяц
const buhMonth = {};
for (let i = 1; i <= 84; i++) {
  buhMonth[i] = (50000 * coefFOT ** (Math.ceil(i / 12) - 1)) / 0.87;
}

//Бухгалтер год
const buhYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  buhYear[Math.ceil(m / 12)] += buhMonth[m];
}

// Маркетолог месяц
const marketologMonth = {};
for (let i = 1; i <= 84; i++) {
  marketologMonth[i] =
    29000 +
    marketologBonusPlan(partOverPlan[i]) +
    bonusQ(partQ[i]) +
    bonusY(partY[i]);
}

//Маркетолог год
const marketologYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  marketologYear[Math.ceil(m / 12)] += marketologMonth[m];
}

// Админы месяц
const adminMonth = {};
for (let i = 1; i <= 84; i++) {
  adminMonth[i] =
    ((182.61 + 27.39) * 164 + 3000) *
    coefFOT ** (Math.ceil(i / 12) - 1) *
    countAdmin;
}

//Админы год
const adminYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  adminYear[Math.ceil(m / 12)] += adminMonth[m];
}

// МОПы месяц
const mopMonth = {};
for (let i = 1; i <= 84; i++) {
  mopMonth[i] =
    (mrot2025 + bonusMOP(earningsCardMonth[i] / countMOP)) * 1.15 * countMOP;
}

//МОПы год
const mopYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  mopYear[Math.ceil(m / 12)] += mopMonth[m];
}

//ЗП месяц (начисление)
const fotMonth = {};

for (let i = 1; i <= 84; i++) {
  fotMonth[i] =
    upravMonth[i] +
    buhMonth[i] +
    marketologMonth[i] +
    adminMonth[i] +
    mopMonth[i];
}

//ЗП год (начисление)
const fotYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  fotYear[Math.ceil(m / 12)] += fotMonth[m];
}

//Фонды ЗП месяц
const fundsMonth = {};
for (let i = 1; i <= 84; i++) {
  fundsMonth[i] =
    fundsFOT(upravMonth[i]) +
    fundsFOT(buhMonth[i]) +
    fundsFOT(marketologMonth[i]) +
    fundsFOT(adminMonth[i] / countAdmin) * countAdmin +
    fundsFOT(mopMonth[i] / countMOP) * countMOP;
}

//Фонды ЗП год
const fundsYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  fundsYear[Math.ceil(m / 12)] += fundsMonth[m];
}

//---------------------------------------------------------------

// ИТОГО РАСХОДЫ ОПЕРАЦИОННЫЕ

// Расходы месяц
const operatingExpensesMonth = {};
for (let i = 1; i <= 84; i++) {
  operatingExpensesMonth[i] =
    rentOutMonth[i] +
    utilityMonth[i] +
    crmMonth[i] +
    cleaningMonth[i] +
    householdMonth[i] +
    exploitationMonth[i] +
    simulatorRepairsMonth[i] +
    itMonth[i] +
    acquiringMonth[i] +
    bankMonth[i] +
    staffMonth[i] +
    marketingMonth[i] +
    paybackMonth[i] +
    plasticMonth[i] +
    copyrightMonth[i] +
    insuranceMonth[i] +
    otherMonth[i] +
    fotMonth[i] +
    fundsMonth[i];
}

// Расходы год

const operatingExpensesYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  operatingExpensesYear[Math.ceil(m / 12)] += operatingExpensesMonth[m];
}

//-----------------------------------------------------------------
//РАСЧЕТЫ ПО КРЕДИТУ
// Сумма ануитентного платежа

const annuityPayment = annuity(loanAmount, interestRate, loanPeriod);
const interestPayment = {};
const bodyOfDutyPayment = {};
const bodyOfDuty = {};
if (loanPeriod > 1) {
  interestPayment[1] = interestMonth(loanAmount, interestRate, 1);
  bodyOfDutyPayment[1] = annuityPayment - interestPayment[1];
  bodyOfDuty[1] = loanAmount - bodyOfDutyPayment[1];

  for (let i = 2; i < loanPeriod; i++) {
    interestPayment[i] = interestMonth(bodyOfDuty[i - 1], interestRate, i);
    bodyOfDutyPayment[i] = annuityPayment - interestPayment[i];
    bodyOfDuty[i] = bodyOfDuty[i - 1] - bodyOfDutyPayment[i];
  }

  interestPayment[loanPeriod] = interestMonth(
    bodyOfDuty[loanPeriod - 1],
    interestRate,
    loanPeriod
  );
  bodyOfDutyPayment[loanPeriod] = bodyOfDuty[loanPeriod - 1];
  bodyOfDuty[loanPeriod] =
    bodyOfDuty[loanPeriod - 1] - bodyOfDutyPayment[loanPeriod];
} else if (loanPeriod == 1) {
  interestPayment[1] = interestMonth(loanAmount, interestRate, 1);
  bodyOfDutyPayment[1] = loanAmount;
  bodyOfDuty[1] = loanAmount - bodyOfDutyPayment[1];
} else {
  for (let i = 1; i <= 84; i++) {
    interestPayment[i] = 0;
    bodyOfDutyPayment[i] = 0;
    bodyOfDuty[i] = 0;
  }
}

const interestPaymentYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  interestPaymentYear[Math.ceil(m / 12)] += interestPayment[m];
}

const bodyOfDutyPaymentYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  bodyOfDutyPaymentYear[Math.ceil(m / 12)] += bodyOfDutyPayment[m];
}

//---------------------------------------------------------------

/* РАСЧЕТ НАЛОГА. Расчет по УСН. По более выгодному варианту Д*6% или (Д-Р)*15%*/

const taxes_6 = {}; // вариант Д*6%
const taxes_15 = {}; // вариант (Д-Р)*15%
const taxesMonth = {}; // выбранный вариант
for (let i = 1; i <= 84; i++) {
  if (i % 12 == 0) {
    let in_ = 0,
      out_ = 0,
      out_interest = 0;
    for (let j = i - 11; j <= i; j++) {
      in_ += earningsMonth[j];
      out_ += operatingExpensesMonth[j];
      out_interest += interestPayment[j];
    }
    if ((in_ - out_ - out_interest) * 0.15 < in_ * 0.01) {
      taxes_15[i] = in_ * 0.01;
    } else {
      taxes_15[i] = (in_ - out_ - out_interest) * 0.15;
    }
    taxes_6[i] = in_ * 0.06;
  } else if (i % 12 != 0) {
    taxes_15[i] = 0;
    taxes_6[i] = 0;
  }
}
// Выбор варианта с наименьшой суммой оплат за весь период

// получение сумм
const optionTaxes_6 = Object.values(taxes_6).reduce((accumulator, value) => {
  return accumulator + value;
}, 0);
const optionTaxes_15 = Object.values(taxes_15).reduce((accumulator, value) => {
  return accumulator + value;
}, 0);

//сравнение и выбор

if (optionTaxes_6 <= optionTaxes_15) {
  Object.assign(taxesMonth, taxes_6);
} else {
  Object.assign(taxesMonth, taxes_15);
}

//Налоги год

const taxesYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  taxesYear[Math.ceil(m / 12)] += taxesMonth[m];
}

//-------------------------------------------------------------------

// ИТОГИ
//CF по месяцам
const cfMonth = {};
for (let i = 1; i <= 84; i++) {
  cfMonth[i] =
    earningsMonth[i] -
    (operatingExpensesMonth[i] +
      interestPayment[i] +
      bodyOfDutyPayment[i] +
      taxesMonth[i]);
}

//CF по годам
const cfYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  cfYear[Math.ceil(m / 12)] += cfMonth[m];
}

//CCF по месяцам

const ccfMonth = { 1: cfMonth[1] };
for (let i = 2; i <= 84; i++) {
  ccfMonth[i] = ccfMonth[i - 1] + cfMonth[i];
}

//CCF по годам
const ccfYear = { 1: cfYear[1] };
for (let i = 2; i <= 7; i++) {
  ccfYear[i] = ccfYear[i - 1] + cfYear[i];
}

//------------------------------------------------------------------------

//Показатели модели

//Кассовый разрыв
let cashGap = "НЕТ",
  cashGapNumberMonth = "НЕТ";
for (let i = 1; i <= 84; i++) {
  if (ccfMonth[i] < 0) {
    cashGap = ccfMonth[i];
    cashGapNumberMonth = i;
    break;
  }
}

//CCF с инвестиционным периодом для расчета окупаемости
let paybackPeriodMonth = "В течение 7-ми лет не окупается";
let paybackPeriodYear = "В течение 7-ми лет не окупается";
const ccfWithInvestMonth = { 0: -sumInvestments };
for (let i = 1; i <= 84; i++) {
  ccfWithInvestMonth[i] =
    ccfWithInvestMonth[i - 1] + cfMonth[i] + bodyOfDutyPayment[i];
}

//Срок окупаемости
for (let i = 1; i <= 84; i++) {
  if (ccfWithInvestMonth[i] >= 0) {
    paybackPeriodMonth = i; //номер месяца окупаемости
    paybackPeriodYear = parseFloat((i / 12).toFixed(1)); //окупаемость в годах
    break;
  }
}

//Дисконтированный период окупаемости. БЕЗ ДОП ИНВЕСТИЦИЙ В ПЕРИОДАХ >=1

const cfWithInvestYear = { 0: -sumInvestments };
for (let i = 1; i <= 7; i++) {
  cfWithInvestYear[i] = cfYear[i] + bodyOfDutyPaymentYear[i];
}

const dccf = { 0: cfWithInvestYear[0] };
for (let i = 1; i <= 7; i++) {
  dccf[i] = dccf[i - 1] + cfWithInvestYear[i] / (1 + keyRate) ** i;
}

let discountedPaybackPeriod = "В течение 7-ми лет не окупается";
for (let i = 1; i <= 84; i++) {
  if (dccf[i] >= 0) {
    discountedPaybackPeriod = i; //номер года окупаемости
    break;
  }
}

// ДЛЯ ПиУ. Округление с кратностью 10⁵
// let length_ = Object.keys(cfYear).length;

//ВЫРУЧКА
const earnings = {};
for (let i = 1; i <= 7; i++) {
  earnings[i] = roundingWithMultiplicity(earningsYear[i], 10 ** 5);
}

// ОПЕРАЦИОННЫН РАСХОДЫ
const operatingExpenses = {};
for (let i = 1; i <= 7; i++) {
  operatingExpenses[i] = roundingWithMultiplicity(
    operatingExpensesYear[i],
    10 ** 5
  );
}

//Валовая прибыль
const grossProfit = {};
for (let i = 1; i <= 7; i++) {
  grossProfit[i] = earnings[i] - operatingExpenses[i];
}

//Рентабельность по Валовой прибыли
const profitabilityGP = {};
for (let i = 1; i <= 7; i++) {
  profitabilityGP[i] = grossProfit[i] / earnings[i];
}

// Проценты interestPaymentYear
const interest = {};
for (let i = 1; i <= 7; i++) {
  interest[i] = roundingWithMultiplicity(interestPaymentYear[i], 10 ** 5);
}

// Налоги
const taxes = {};
for (let i = 1; i <= 7; i++) {
  taxes[i] = roundingWithMultiplicity(taxesYear[i], 10 ** 5);
}

// Чистая прибыль
const netProfit = {};
for (let i = 1; i <= 7; i++) {
  netProfit[i] = grossProfit[i] - interest[i] - taxes[i];
}

//Рентабельность по Чистой прибыли
const profitabilityNP = {};
for (let i = 1; i <= 7; i++) {
  profitabilityNP[i] = netProfit[i] / earnings[i];
}

// Ренатбальность инвестиций

//Средняя рентабельность инвестиций по периоду 7 лет
const profitabilityInvestments =
  Object.values(netProfit).reduce((accumulator, value) => {
    return accumulator + value;
  }, 0) /
  sumInvestments /
  7;

// Рентабельность инвестиций по годам
const profitabilityI = {};
for (let i = 1; i <= 7; i++) {
  profitabilityI[i] = netProfit[i] / sumInvestments;
}

//Выручка за весь период
const sumEarnings = Object.values(earnings).reduce((accumulator, value) => {
  return accumulator + value;
}, 0);

// Операционные расходы за весть период
const sumOperatingExpenses = Object.values(operatingExpenses).reduce(
  (accumulator, value) => {
    return accumulator + value;
  },
  0
);

// Валовая прибыль и рентабельность ао ВП за весь период
const sumGrossProfit = sumEarnings - sumOperatingExpenses;
const meanProfitabilityGP = sumGrossProfit / sumEarnings;

// Проценты и налоги за весь период
const sumInterest = Object.values(interest).reduce((accumulator, value) => {
  return accumulator + value;
}, 0);

const sumTaxes = Object.values(taxes).reduce((accumulator, value) => {
  return accumulator + value;
}, 0);

//Чистая прибыль и рентабельность по ЧП за весь период
const sumNetProfit = sumGrossProfit - sumInterest - sumTaxes;
const meanProfitabilityNT = sumNetProfit / sumEarnings;

//Расчет депозита на сумму Инвестиций для сравнения

const depositMonth = {};
for (let i = 1; i <= 84; i++) {
  depositMonth[i] = interestMonth(sumInvestments, keyRate, i);
}

const depositYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
for (let m = 1; m <= 84; m++) {
  depositYear[Math.ceil(m / 12)] += depositMonth[m];
}

const sumDeposit = Object.values(depositYear).reduce((accumulator, value) => {
  return accumulator + value;
}, 0);

//-----------------------------------------------------
//ВВОДИМ РЕЗУЛЬТАТЫ В ПОЛЯ НА САЙТ
//document.getElementById(".out1").innerHTML = sumInvestments;

// document.getElementById("number1").addEventListener("input", function () {
//   document.querySelector(".out1").innerHTML = sumInvestments;
// });

// document.getElementById("number1").addEventListener("input", function () {
//   document.querySelector(".out1").innerHTML =
//     2 * document.getElementById("number1").value;
// });

//---------------------------------------------------

// console.log(sumGrossProfit);
// console.log(meanProfitabilityGP);
// console.log();
// console.log(sumNetProfit);
// console.log(meanProfitabilityNT);
// console.log();
// console.log(sumDeposit);
// console.log("PP = ", paybackPeriodYear);
// console.log("DPP = ", discountedPaybackPeriod);
// console.log(operatingExpensesYear);
//-------------------------------------------------------------------------

// Проверочная. Сумму по периоду в объекте
// let s = 0;
// for (let key in profitabilityNP) {
//   s += profitabilityNP[`${key}`];
// }

// console.log(s);

// let s2 = 0;
// for (let key in operatingExpensesMonth) {
//   s2 += operatingExpensesMonth[`${key}`];
// }

// console.log(s2);

// let n = 5;
// console.log(countClientMonth[n]);
// console.log(earningsCardMonth[n]);
// console.log(priceNew[Math.ceil(n / 12)]);
// console.log(priceOld[Math.ceil(n / 12)]);

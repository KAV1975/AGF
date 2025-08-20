"use strict";
/*
let square -плошадь Помещения вводимое значение. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА ОТРЕЗОК [700;1500] И ЧИСЛОВОЙ ТИП
  rentalRate -  арендная ставка руб за м² в мес. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП
  loanAmount -Сумма кредита. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП
  interestRate - Процентная ставка. Важно: при вводе учитывать % или число!. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП
  loanPeriod - Срок кредита в мес. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И <= 84 и ЧИСЛОВОЙ ТИП
let keyRate -Ключевая ставка. Впринципе можно брать с внешнего источника. Если ввод. Важно: при вводе учитывать % или число!. ПРИ ВВОДЕ НАПИСАТЬ ПРОВЕРКУ НА >= 0 И ЧИСЛОВОЙ ТИП
  */

//Вспомагательные функции

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

//ЗАДАЕМ ГРАНИЦЫ ДОПУСТИМЫХ ПЛОЩАДЕЙ И КЛЮЧЕВУЮ СТАВКУ (в перпективе брать в WEB)
const left_ = 700;
const right_ = 2500;
const keyRate_ = 0.18;

// ФУНКЦИЯ МОДЕЛИ
function modelAGF(
  square = left_,
  rentalRate = 0,
  loanAmount = 0,
  interestRate = 0,
  loanPeriod = 0,
  checkbox = false, //Проверка галки для учета амортизации, по умолчанию не учитываем
  keyRate = keyRate_
) {
  const flag = square >= left_ && square <= right_ ? true : false; // Для условия проверки интервала Площади
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

  // ТЕХНИЧЕСКИЕ ОБЪЕКТЫ, ДЛЯ ПОДСТАНОВКИ ПО УСЛОВИЮ
  const techObject1 = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }; // технически для подстановки, если Площадь не введена или равна 0. Где целые
  const techObject2 = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }; // технически для подстановки, если Площадь не введена или равна 0. Где дробные

  //Коэффициент количества продаж от площади. Аргумент = площадь помещения
  function salesRatio(square) {
    let ratio = 0;
    if (square) {
      if (square > 0 && square <= 1100 && flag) {
        ratio = 2.4;
      } else if (square > 1100 && square <= 1500) {
        ratio = 4 * 10 ** -6 * square ** 2 - 0.0124 * square + 11.449;
      } else if (square > 1500 && flag) {
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
    if (amount_ >= 0 && interestRate >= 0 && numberMonth >= 0) {
      return (amount_ * interestRate * dayInMonth[numberMonth % 12]) / 365;
    } else {
      return 0;
    }
  }

  //----------------------------------------------------------------------------

  // ИНВЕСТИЦИИ В ОТКРЫТИЕ
  //Стоимости инвестиций постатейно (объект, для возможности быстрых корректировок, при необходимости)
  const investment = {
    constructionInstallationWorks: [
      flag ? 10500 * square : 0,
      "СМР (Проектирование, Отделочные работы)",
    ],
    electrical: [flag ? 4300 * square : 0, "Электроснабжения"],
    waterAndSewage: [flag ? 2900 * square : 0, "Водоснабжение и канализация"],
    ventilationAndConditioning: [
      flag ? 5800 * square : 0,
      "Вентиляция и кондиционирование",
    ],
    automaticFireAlarmSystem: [flag ? 1600 * square : 0, "АПС и СОУЭ"],
    accessControlManagementSystemAndCRM: [flag ? 10 ** 6 : 0, "СКУД и CRM"],
    acousticsVideoAndcomputerNetworks: [
      flag ? (square < 1000 ? 1.2 * 10 ** 6 : 1200 * square) : 0,
      "Акустика, видеонаблюдение и СКС",
    ],
    lockerRoomFurniture: [
      flag ? 0.1 * 1.25 * 5000 * salesRatio(square) * square : 0,
      "Мебель раздевалки",
    ],
    furnitureSalesDepartment: [
      flag ? (square <= 1000 ? 2 * 10 ** 5 : 200 * square) : 0,
      "Мебель отдела продаж",
    ],
    furnitureReception: [
      flag ? (square <= 1000 ? 2 * 10 ** 5 : 200 * square) : 0,
      "Меебль рецепции",
    ],
    furnitureBar: [
      flag ? (square <= 1000 ? 2 * 10 ** 5 : 200 * square) : 0,
      "Мебель бара",
    ],
    equipment: [
      flag
        ? square <= 1000
          ? 1.5 * 10 ** 7
          : 45155 * square - 4365 * square * Math.log(square)
        : 0,
      "Оборудование",
    ],
    advertisementConstruction: [
      flag ? (square <= 1000 ? 5 * 10 ** 5 : 500 * square) : 0,
      "Рекламная вывеска",
    ],
    other: [flag ? 5 * 10 ** 5 : 0, "Наполнение клуба"],
    startupServices: [
      flag
        ? square <= 1000
          ? 1.2 * 10 ** 7
          : 3240 * square + 8.856 * 10 ** 6
        : 0,
      "Услуги МДК",
    ],
  };

  // Расчет суммы инвестиций
  let sumInvestments = 0;
  for (let key in investment) {
    sumInvestments += investment[key][0];
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
    if (square >= 0 && rentalRate >= 0 && flag) {
      rentOutMonth[i] =
        square * rentalRate * coefRent ** (Math.ceil(i / 12) - 1);
    } else {
      rentOutMonth[i] = 0;
    }
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

  // ЗП (начисления) + фонды. Год. Для ДДС

  //Фонды ЗП год
  const fotAndFundsYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (let m = 1; m <= 7; m++) {
    fotAndFundsYear[m] = fotYear[m] + fundsYear[m];
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
  if (loanPeriod > 1 && loanAmount >= 0 && interestRate >= 0) {
    interestPayment[1] = interestMonth(loanAmount, interestRate, 1);
    bodyOfDutyPayment[1] = annuityPayment - interestPayment[1];
    bodyOfDuty[1] = loanAmount - bodyOfDutyPayment[1];

    if (loanPeriod >= 84) {
      for (let i = 2; i < loanPeriod; i++) {
        interestPayment[i] = interestMonth(bodyOfDuty[i - 1], interestRate, i);
        bodyOfDutyPayment[i] = annuityPayment - interestPayment[i];
        bodyOfDuty[i] = bodyOfDuty[i - 1] - bodyOfDutyPayment[i];
      }
    } else if (loanPeriod < 84) {
      for (let i = 2; i < loanPeriod; i++) {
        interestPayment[i] = interestMonth(bodyOfDuty[i - 1], interestRate, i);
        bodyOfDutyPayment[i] = annuityPayment - interestPayment[i];
        bodyOfDuty[i] = bodyOfDuty[i - 1] - bodyOfDutyPayment[i];
      }
      for (let i = loanPeriod + 1; i <= 84; i++) {
        interestPayment[i] = 0;
        bodyOfDutyPayment[i] = 0;
      }
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
  const optionTaxes_15 = Object.values(taxes_15).reduce(
    (accumulator, value) => {
      return accumulator + value;
    },
    0
  );

  //сравнение и выбор
  let flagTaxes = false; // флаг для выбранного варианта УСН, используем далее при расчете NOPAT
  if (optionTaxes_6 <= optionTaxes_15) {
    Object.assign(taxesMonth, taxes_6);
    flagTaxes = true; // если Д*6% выгоднее
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
  if (flag) {
    for (let i = 1; i <= 84; i++) {
      if (ccfMonth[i] < 0) {
        cashGap = Math.round(ccfMonth[i]);
        cashGapNumberMonth = i;
        break;
      }
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

  const ccfWithInvestYear = { 0: cfWithInvestYear[0] }; // Для графика срока окупаемости
  for (let i = 1; i <= 7; i++) {
    ccfWithInvestYear[i] = ccfWithInvestYear[i - 1] + cfWithInvestYear[i];
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

  // Амортизация. Срок использования 7 лет.
  //Амортизация по годам

  const depreciationYear = { ...techObject1 };
  if (checkbox) {
    for (let i = 1; i <= 7; i++) {
      depreciationYear[i] =
        sumInvestments >= 0
          ? roundingWithMultiplicity(sumInvestments / 7, 10 ** 1)
          : 0;
    }
  }

  //Сумма Амортизации за 7 лет
  const sumDepreciation = roundingWithMultiplicity(
    Object.values(depreciationYear).reduce((accumulator, value) => {
      return accumulator + value;
    }, 0),
    10 ** 1
  );

  //Валовая прибыль
  const grossProfit = {};
  for (let i = 1; i <= 7; i++) {
    grossProfit[i] = earnings[i] - operatingExpenses[i] - depreciationYear[i];
  }

  //Рентабельность по Валовой прибыли
  const profitabilityGP = {};
  for (let i = 1; i <= 7; i++) {
    profitabilityGP[i] = grossProfit[i] / earnings[i];
  }

  // Проценты interestPaymentYear
  const interest = {};
  for (let i = 1; i <= 7; i++) {
    if (interestPaymentYear[i]) {
      interest[i] = roundingWithMultiplicity(interestPaymentYear[i], 10 ** 5);
    } else {
      interest[i] = 0;
    }
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
  //NOPAT для расчет Рентабельности инвестиций. NOPAT Прибыль до уплаты % и налоогов и налог расчитывается "как бы без учета %"
  const NOPATYear = {};
  for (let i = 1; i <= 7; i++) {
    if (flagTaxes) {
      NOPATYear[i] = grossProfit[i] - earningsYear[i] * 0.06;
    } else {
      NOPATYear[i] = grossProfit[i] * (1 - 0.15);
    }
  }

  //Средняя рентабельность инвестиций по периоду 7 лет,  По методологии NOPAT
  const meanProfitabilityI =
    Object.values(NOPATYear).reduce((accumulator, value) => {
      return accumulator + value;
    }, 0) /
    sumInvestments /
    7;

  // Рентабельность инвестиций по годам,  По методологии NOPAT
  const profitabilityI = {};
  for (let i = 1; i <= 7; i++) {
    profitabilityI[i] = NOPATYear[i] / sumInvestments;
  }

  // Ренатбальность Собственного капитала
  const OwnerContribution =
    loanAmount < sumInvestments ? sumInvestments - loanAmount : 0; //Взнос Собственника

  //Средняя рентабельность Собственного капитала по периоду 7 лет
  const meanROE =
    OwnerContribution > 0
      ? Object.values(netProfit).reduce((accumulator, value) => {
          return accumulator + value;
        }, 0) /
        OwnerContribution /
        7
      : 0;

  // Рентабельность Собственного капитала по годам
  const ROEYear = {};
  for (let i = 1; i <= 7; i++) {
    ROEYear[i] = OwnerContribution > 0 ? netProfit[i] / OwnerContribution : 0;
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
  const sumGrossProfit = sumEarnings - sumOperatingExpenses - sumDepreciation;
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

  //Расчет депозита на сумму Собственных средств для сравнения
  const interestDeposit = keyRate - 0.02; //Проценты по депозиту = ключевая ставка минус 2 пп
  const interestDepositYear = {};
  for (let i = 1; i <= 7; i++) {
    interestDepositYear[i] = interestDeposit ?? 0;
  }

  const depositMonth = {};
  for (let i = 1; i <= 84; i++) {
    depositMonth[i] = interestMonth(OwnerContribution, interestDeposit, i);
  }

  const depositYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (let m = 1; m <= 84; m++) {
    depositYear[Math.ceil(m / 12)] += depositMonth[m];
  }

  const sumDeposit = Object.values(depositYear).reduce((accumulator, value) => {
    return accumulator + value;
  }, 0);

  //---------------------------------------------------------------------------------------

  // ДЛЯ ТАБЛИЦЫ ДДС

  // Операционные доходы и расходы. Для Таблицы ДДС

  //earnings: [flag ? earningsYear : techObject1, "Операционные поступления"],
  //    expenses: [flag ? operatingExpensesYear : techObject1, "Операционные расходы",],
  const operating = {
    // earnings: [
    //   { 1: " ", 2: " ", 3: " ", 4: " ", 5: " ", 6: " ", 7: " " },
    //   "Операционные поступления",
    // ],
    cards: [
      flag
        ? Object.assign({ 0: 0 }, earningsCardYear)
        : { 0: 0, ...techObject1 },
      "Поступления по картам",
    ],
    coachs: [
      flag ? Object.assign({ 0: 0 }, CoachInYear) : { 0: 0, ...techObject1 },
      "Поступления по тренерам",
    ],
    rentIn: [
      flag ? Object.assign({ 0: 0 }, RentInYear) : { 0: 0, ...techObject1 },
      "Поступления по Аренде",
    ],
    otherIn: [
      flag ? Object.assign({ 0: 0 }, otherInYear) : { 0: 0, ...techObject1 },
      "Прочие поступления",
    ],
    // expenses: [
    //   { 1: " ", 2: " ", 3: " ", 4: " ", 5: " ", 6: " ", 7: " " },
    //   "Операционные расходы",
    // ],
    rentOut: [
      flag ? Object.assign({ 0: 0 }, rentOutYear) : { 0: 0, ...techObject1 },
      "Аренда помещения",
    ],
    fot: [
      flag
        ? Object.assign({ 0: 0 }, fotAndFundsYear)
        : { 0: 0, ...techObject1 },
      "Фонд оплаты труда (ФОТ)",
    ],
    utility: [
      flag ? Object.assign({ 0: 0 }, utilityYear) : { 0: 0, ...techObject1 },
      "Коммунальные платежи",
    ],
    payback: [
      flag ? Object.assign({ 0: 0 }, paybackYear) : { 0: 0, ...techObject1 },
      "Возвраты карт",
    ],
    cleaning: [
      flag ? Object.assign({ 0: 0 }, cleaningYear) : { 0: 0, ...techObject1 },
      "Клининг",
    ],
    marketing: [
      flag ? Object.assign({ 0: 0 }, marketingYear) : { 0: 0, ...techObject1 },
      "Маркетинг",
    ],
    acquiring: [
      flag ? Object.assign({ 0: 0 }, acquiringYear) : { 0: 0, ...techObject1 },
      "Эквайринг",
    ],
    exploitation: [
      flag
        ? Object.assign({ 0: 0 }, exploitationYear)
        : { 0: 0, ...techObject1 },
      "Эксплуатация инж. сетей, помещения, охрана",
    ],
    simulatorRepairs: [
      flag
        ? Object.assign({ 0: 0 }, simulatorRepairsYear)
        : { 0: 0, ...techObject1 },
      "ТО и ремонт тренажеров. Расходный инвентарь",
    ],
    it: [
      flag ? Object.assign({ 0: 0 }, itYear) : { 0: 0, ...techObject1 },
      "IT (телефония, Интернет, ПО, расходники ИТ)",
    ],
    crm: [
      flag ? Object.assign({ 0: 0 }, crmYear) : { 0: 0, ...techObject1 },
      "Софт, приложения, crm",
    ],
    bank: [
      flag ? Object.assign({ 0: 0 }, bankYear) : { 0: 0, ...techObject1 },
      "Банковское обслуживание",
    ],
    staff: [
      flag ? Object.assign({ 0: 0 }, staffYear) : { 0: 0, ...techObject1 },
      "Обучение и подбор персонала",
    ],
    household: [
      flag ? Object.assign({ 0: 0 }, householYear) : { 0: 0, ...techObject1 },
      "Текущие хозяйственные",
    ],
    plastic: [
      flag ? Object.assign({ 0: 0 }, plasticYear) : { 0: 0, ...techObject1 },
      "Пластиковые карты",
    ],
    copyright: [
      flag ? Object.assign({ 0: 0 }, copyrightYear) : { 0: 0, ...techObject1 },
      "Авторские права",
    ],
    insurance: [
      flag ? Object.assign({ 0: 0 }, insuranceYear) : { 0: 0, ...techObject1 },
      "Страхование",
    ],
    other: [
      flag ? Object.assign({ 0: 0 }, otherYear) : { 0: 0, ...techObject1 },
      "Прочие непредвиденные расходы",
    ],
    taxes: [
      flag ? Object.assign({ 0: 0 }, taxesYear) : { 0: 0, ...techObject1 },
      "Налоговые платежи",
    ],
    ccFOA: [{ 0: 0 }, "ЧДП от операционной деятельности"],
  };

  // Заполняем ЧДП от операционной деятельности

  for (let i = 1; i <= 7; i++) {
    operating.ccFOA[0][i] = flag
      ? earningsYear[i] - operatingExpensesYear[i] - taxesYear[i]
      : 0;
  }

  // ФИНАНСОВЫЙ БЛОК ДЛЯ ДДС

  const credit = {
    ownerIn: [
      Object.assign({ 0: OwnerContribution }, techObject1),
      "Взнос Собственника",
    ],
    dutyIn: [
      Object.assign({ 0: loanAmount ?? 0 }, techObject1),
      "Сумма кредита",
    ],
    dutyOut: [
      flag
        ? Object.assign({ 0: 0 }, bodyOfDutyPaymentYear)
        : { 0: 0, ...techObject1 },
      "Выплаты тела долга",
    ],
    interestOut: [
      flag
        ? Object.assign({ 0: 0 }, interestPaymentYear)
        : { 0: 0, ...techObject1 },
      "Выплаты процентов",
    ],
    cfFinance: [{ 0: 0, ...techObject1 }, "ЧДП от финансовой деятельности"],
  };

  //Заполняем Итоги по фин блоку
  for (let i = 0; i <= 7; i++) {
    credit.cfFinance[0][i] =
      credit.ownerIn[0][i] +
      credit.dutyIn[0][i] -
      credit.dutyOut[0][i] -
      credit.interestOut[0][i];
  }

  //ЧТД инвестиционной деятельности

  const inv = {
    cfInv: [
      { 0: flag ? -sumInvestments : 0, ...techObject1 },
      "ЧДП от инвестиционной деятельности",
    ],
  };

  //Чистый денежный поток
  const cf = {
    cf: [
      flag ? { 0: 0, ...techObject1 } : { 0: 0, ...techObject1 },
      "Итоговый денежный поток по всем видам деятельности",
    ],
  };

  //Заполняем Итоги по ИТОГУ
  for (let i = 0; i <= 7; i++) {
    cf.cf[0][i] =
      operating.ccFOA[0][i] + credit.cfFinance[0][i] + inv.cfInv[0][i];
  }

  //Накопленный денежный поток
  const ccf = {
    ccf: [{ 0: cf.cf[0][0], ...techObject1 }, "НАКОПЛЕННЫЙ ДЕНЕЖНЫЙ ПОТОК"],
  };
  for (let i = 1; i <= 7; i++) {
    ccf.ccf[0][i] = ccf.ccf[0][i - 1] + cf.cf[0][i];
  }

  //------------------------------------------------------------------------------------------------------

  // ВОЗВРАЩАЕМЫЙ ОБЪЕКТ

  const modelIndicators = {
    sumInvestments: flag ? roundingWithMultiplicity(sumInvestments, 100) : 0, //инвестиции округление до целых с кратностью 100
    investment: investment, //Объект Инвестиции для Таблицы Инвестиции
    paybackPeriodYear: flag ? paybackPeriodYear : 0.0,
    discountedPaybackPeriod: flag ? discountedPaybackPeriod : 0.0,
    meanProfitabilityI: flag ? meanProfitabilityI : 0.0,
    meanROE: flag ? meanROE : 0.0,
    meanProfitabilityNT: flag ? meanProfitabilityNT : 0.0,
    earnings: flag ? earnings : techObject1,
    operatingExpenses: flag ? operatingExpenses : techObject1,
    grossProfit: flag ? grossProfit : techObject1,
    profitabilityGP: flag ? profitabilityGP : techObject2,
    interest: flag ? interest : techObject1,
    taxes: flag ? taxes : techObject1,
    netProfit: flag ? netProfit : techObject1,
    profitabilityNP: flag ? profitabilityNP : techObject2,
    profitabilityI: flag ? profitabilityI : techObject2,
    ROEYear: flag ? ROEYear : techObject2,
    sumEarnings: flag ? sumEarnings : 0,
    sumOperatingExpenses: flag ? sumOperatingExpenses : 0,
    sumGrossProfit: flag ? sumGrossProfit : 0,
    meanProfitabilityGP: flag ? meanProfitabilityGP : 0.0,
    sumInterest: flag ? sumInterest : 0,
    sumTaxes: flag ? sumTaxes : 0,
    sumNetProfit: flag ? sumNetProfit : 0,
    depositYear: flag ? depositYear : techObject1,
    sumDeposit: flag ? sumDeposit : 0,
    ccfWithInvestYear: flag ? ccfWithInvestYear : techObject1, //для графика окупаемости
    keyRate: keyRate,
    meanTaxes_6: flag ? optionTaxes_6 / 7 : 0,
    meanTaxes_15: flag ? optionTaxes_15 / 7 : 0,
    operating: operating, //Объект Операционный блок по годам, с названиями статей
    credit: credit, //Объект Финансовый блок, с названиями статей
    inv: inv, //ЧДП от инвестиционной деятельности, с названиями статей
    cf: cf, //ЧДП, с названиями статей
    ccf: ccf, //Накопленный денежный поток
    depreciationYear: depreciationYear, //Амортизация по годам
    sumDepreciation: sumDepreciation, //Сумма Амортизации
    interestDepositYear: interestDepositYear, // Ставка по депозиту
    OwnerContribution: OwnerContribution, // Соственные средства
    cashGap: cashGap, // Сумма кассового разрыва, если есть, если нет -> "НЕТ"
  };
  return modelIndicators;
}

//-------------------------------------------------

// График 1. Окупаемость проекта

//данные для базовой картинки графика
const data = {
  инвест: 0,
  "1 год": 0,
  "2 год": 0,
  "3 год": 0,
  "4 год": 0,
  "5 год": 0,
  "6 год": 0,
  "7 год": 0,
};

// уравнение первого порядка. Просто для картинки, смысловой нагрузки не имеет
let x_i = 0;
for (let key in data) {
  data[key] = (80 * x_i) / 7 - 50;
  x_i++;
}

const ctx = document.getElementById("myChart").getContext("2d");
const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: Object.keys(data),
    datasets: [
      {
        label: "Окупаемость",
        data: Object.values(data),
        radius: 0,
        borderWidth: 3,
        tension: 0.4, // Сглаживание (0 = нет, 1 = макс.)
        borderColor: "black", // Пример цвета
        fill: false, // Не заливать область под линией
      },
      {
        label: "Ноль",
        data: [0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: "rgb(255, 99, 132)",
        radius: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0, // Оставить прямую линию
      },
    ],
  },

  options: {
    plugins: {
      title: {
        display: true,
        text: "Окупаемость проекта",
        font: {
          family: "Times New Roman",
          size: 16,
          weight: "bold",
        },
      },
      legend: {
        display: false,
        position: "right",
      },
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: function (context) {
            return context.tick.value < 0 ? "red" : "black";
          },
          callback: function (value) {
            // Форматирование чисел с разрядностью и отрицательными значениями
            return new Intl.NumberFormat("ru-RU", {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
        afterBuildTicks: function (scale) {
          // Принудительно включаем отрицательные значения в шкалу
          const ticks = scale.ticks;
          const min = Math.min(...ticks.map((t) => t.value));
          if (min >= 0) {
            // Добавляем отрицательные значения, если их нет
            ticks.push({ value: -20000000 });
            ticks.push({ value: -40000000 });
            ticks.sort((a, b) => a.value - b.value);
          }
          return ticks;
        },
      },
      x: {
        beginAtZero: true,
      },
    },
  },
});

// Функция замены данных в Графике 1
function updateChart(chart, dataNew_1, dataNew_2 = [0, 0, 0, 0, 0, 0, 0, 0]) {
  chart.data.datasets[0].data = Object.values(dataNew_1);
  chart.data.datasets[1].data = Object.values(dataNew_2);
  chart.update();
}

//--------------------------------------------------------------------------
// Заполняем данные для Диаграммы от 700 до 2500 м² с шагом 100 м²
const data1 = {};

for (let i = left_; i <= right_; i += 100) {
  data1[i] = modelAGF(i)["sumInvestments"];
}

// Диаграмма. Сумма инвсетиций в зависиомсти от площади
const ctx1 = document.getElementById("myChart1").getContext("2d");

//Рисунок штриховки
const patternCanvas = document.createElement("canvas");
patternCanvas.width = 10;
patternCanvas.height = 10;
const patternCtx = patternCanvas.getContext("2d");

// Рисуем черные диагональные линии
patternCtx.strokeStyle = "black";
patternCtx.lineWidth = 1;
patternCtx.beginPath();
patternCtx.moveTo(0, 0);
patternCtx.lineTo(10, 10);
patternCtx.stroke();
patternCtx.moveTo(0, 5);
patternCtx.lineTo(5, 10);
patternCtx.stroke();

const pattern = ctx1.createPattern(patternCanvas, "repeat");

const myChart1 = new Chart(ctx1, {
  type: "bar",
  data: {
    labels: Object.keys(data1),
    datasets: [
      {
        label: "Сумма инвестиций",
        data: Object.values(data1),
        borderWidth: 2,
        borderColor: "black",
        backgroundColor: pattern, // Применяем паттерн
      },
    ],
  },

  options: {
    plugins: {
      title: {
        display: true,
        text: "Сумма инвестиций от площади помещения",
        font: {
          family: "Times New Roman",
          size: 16,
          weight: "bold",
        },
      },
      legend: {
        display: false,
        position: "right",
      },
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Сумма инвестиций, руб",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Площадь помещения, м²",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
    },
  },
});

//График 2. Анализ рентабельности мнвестиций от площади, при заданной Арендендной ставке
// Данные для шаблона от 700 до 2500 м² с шагом 100 м²

const data2 = {};
const data2_2 = {};

for (let i = left_; i <= right_; i += 100) {
  (data2[i] =
    (modelAGF(i)["sumNetProfit"] / 7 / modelAGF(i)["sumInvestments"]) * 100),
    (data2_2[i] = keyRate_ * 100);
}

const ctx2 = document.getElementById("myChart2").getContext("2d");
const myChart2 = new Chart(ctx2, {
  type: "line",
  data: {
    labels: Object.keys(data2),
    datasets: [
      {
        label: "Рентабельность инвестиций",
        data: Object.values(data2),
        radius: 0,
        borderWidth: 3,
        tension: 0.4, // Сглаживание (0 = нет, 1 = макс.)
        borderColor: "black", //цвет кривой
        fill: false, // Не заливать область под линией
      },
      {
        label: "Ключевая ставка",
        data: Object.values(data2_2),
        borderColor: "rgb(255, 99, 132)",
        radius: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0, // Оставить прямую линию
      },
    ],
  },

  options: {
    plugins: {
      title: {
        display: true,
        text: "Анализ рентабельности инвестиций от Площади.",
        font: {
          family: "Times New Roman",
          size: 16,
          weight: "bold",
        },
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: {
            family: "Times New Roman",
            size: 10,
          },
          padding: 20, // Отступ между элементами легенды
          // usePointStyle: true, // Использовать стиль точки вместо линии
        },
      },
    },
    responsive: true, // уточнить функционал!!!!
    borderWidth: 2,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Показатель эффективности, %",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Площадь помещения, м²",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
    },
  },
});

//График 3. Анализ рентабельности инвестиций от Арендендной ставке, при заданной площади
// Данные для шаблона от 0 до 1200  с шагом 50 руб/ м² в мес

const data3 = {};
const data3_2 = {};

for (let i = 0; i <= 1200; i += 50) {
  (data3[i] =
    (modelAGF(left_, i)["sumNetProfit"] /
      7 /
      modelAGF(left_, i)["sumInvestments"]) *
    100),
    (data3_2[i] = keyRate_ * 100);
}

const ctx3 = document.getElementById("myChart3").getContext("2d");
const myChart3 = new Chart(ctx3, {
  type: "line",
  data: {
    labels: Object.keys(data3),
    datasets: [
      {
        label: "Рентабельность инвестиций",
        data: Object.values(data3),
        radius: 0,
        borderWidth: 3,
        tension: 0.4, // Сглаживание (0 = нет, 1 = макс.)
        borderColor: "black", //цвет кривой
        fill: false, // Не заливать область под линией
      },
      {
        label: "Ключевая ставка",
        data: Object.values(data3_2),
        borderColor: "rgb(255, 99, 132)",
        radius: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0, // Оставить прямую линию
      },
    ],
  },

  options: {
    plugins: {
      title: {
        display: true,
        text: "Анализ рентабельности инвестиций от Арендной ставки.",
        font: {
          family: "Times New Roman",
          size: 16,
          weight: "bold",
        },
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: {
            family: "Times New Roman",
            size: 10,
          },
          padding: 20, // Отступ между элементами легенды
          // usePointStyle: true, // Использовать стиль точки вместо линии
        },
      },
    },
    responsive: true, // уточнить функционал!!!!
    borderWidth: 2,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Показатель эффективности, %",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Арендная ставка, руб/м² в месяц",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
    },
  },
});

//График 4. Анализ варианта налогообложения УСН от площади,
// Данные для шаблона от 700 до 2500 м² с шагом 100 м²

const data4 = {};
const data4_2 = {};

for (let i = left_; i <= right_; i += 100) {
  (data4[i] = modelAGF(i)["meanTaxes_6"]),
    (data4_2[i] = modelAGF(i)["meanTaxes_15"]);
}

const ctx4 = document.getElementById("myChart4").getContext("2d");
const myChart4 = new Chart(ctx4, {
  type: "line",
  data: {
    labels: Object.keys(data4),
    datasets: [
      {
        label: "Доходы * 6%",
        data: Object.values(data4),
        radius: 0,
        borderWidth: 3,
        tension: 0.4, // Сглаживание (0 = нет, 1 = макс.)
        borderColor: "black", //цвет кривой
        fill: false, // Не заливать область под линией
      },
      {
        label: "(Доходы - расходы)*15%",
        data: Object.values(data4_2),
        borderColor: "grey",
        radius: 0,
        borderWidth: 3,
        // borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  },

  options: {
    plugins: {
      title: {
        display: true,
        text: "Сравнение вариантов налогообложения (УСН) ",
        font: {
          family: "Times New Roman",
          size: 16,
          weight: "bold",
        },
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: {
            family: "Times New Roman",
            size: 10,
          },
          padding: 20, // Отступ между элементами легенды
          // usePointStyle: true, // Использовать стиль точки вместо линии
        },
      },
    },
    responsive: true, // уточнить функционал!!!!
    borderWidth: 2,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Средняя сумма налогов в год (период 7 лет)",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Площадь помещения, м²",
          font: {
            family: "Times New Roman",
            size: 12,
            // weight: "bold",
          },
        },
      },
    },
  },
});

//-------------------------------------------------------------

// ОБРАБОТКА ВВОДА НА САЙТЕ

//  ФУНКЦИЯ, ЧТО ДЕЛАЕМ ПРИ СОБЫТИИ "РАСЧЕТ" ИЛИ ENTER
function calculate() {
  const square = Number(document.getElementById("number1").value);
  const rentalRate = Number(document.getElementById("number2").value);

  const loanPeriod = Number(document.getElementById("number4").value);
  const interestRate = Number(document.getElementById("number5").value) / 100;

  // Сумма кредита вводится как строка, для разделения разрядов, конвертируем в числовой тип для расчетов
  const inputElement = document.getElementById("number3");
  const loanAmount = parseFloat(inputElement.dataset.rawValue || 0);
  // const loanAmount = Number(document.getElementById("number3").value);
  const checkbox = document.getElementById("myCheckbox"); //получаем состояние галки по учету амортизации
  const model = modelAGF(
    square,
    rentalRate,
    loanAmount,
    interestRate,
    loanPeriod,
    checkbox.checked
  );

  // Выводим сумму инвестиций
  document.querySelector("#out1").innerText =
    model["sumInvestments"].toLocaleString("ru-RU");

  // Выводим среднюю рентабельность Инвестиций за 7 лет
  if (model["meanProfitabilityI"] >= 0) {
    document.querySelector("#out2").innerText = `${(
      model["meanProfitabilityI"] * 100
    ).toFixed(2)} %`;
    document.querySelector("#out2").className = "black";
  } else {
    document.querySelector("#out2").innerText = "убыток";
    document.querySelector("#out2").className = "red";
  }

  // Выводим сумму Собственных средств
  document.querySelector("#out6").innerText = roundingWithMultiplicity(
    model["OwnerContribution"],
    10 ** 2
  ).toLocaleString("ru-RU");

  // Выводим среднюю рентабельность капитала за 7 лет
  if (model["meanROE"] >= 0) {
    document.querySelector("#out3").innerText = `${(
      model["meanROE"] * 100
    ).toFixed(2)} %`;
    document.querySelector("#out3").className = "black";
  } else {
    document.querySelector("#out3").innerText = "убыток";
    document.querySelector("#out3").className = "red";
  }

  // Выводим период окупаемости (не дисконтированный)
  if (model["paybackPeriodYear"] == "В течение 7-ми лет не окупается") {
    document.querySelector("#out4").innerText = model["paybackPeriodYear"];
    document.querySelector("#out4").className = "red";
  } else if (model["paybackPeriodYear"] > 0) {
    document.querySelector(
      "#out4"
    ).innerText = `${model["paybackPeriodYear"]} года`;
    // document.querySelector("#out4").classList.remove("red");
    document.querySelector("#out4").className = "black";
  }

  // Выводим Прирост денежных средств
  document.querySelector("#out7").innerText = roundingWithMultiplicity(
    model["ccf"].ccf[0][7],
    10 ** 3
  ).toLocaleString("ru-RU");

  // // Выводим наличие кассового разрыва
  if (model["cashGap"] < 0) {
    document.querySelector("#out8").innerText = `${roundingWithMultiplicity(
      model["cashGap"],
      10 ** 2
    ).toLocaleString("ru-RU")}  руб`;
    document.querySelector("#out8").className = "red";
  } else {
    document.querySelector("#out8").innerText = model["cashGap"];
    // document.querySelector("#out8").classList.remove("red");
    document.querySelector("#out8").className = "black";
  }

  // Выводим период окупаемости дисконтированный
  // if (model["discountedPaybackPeriod"] == "В течение 7-ми лет не окупается") {
  //   document.querySelector("#out5").innerText =
  //     model["discountedPaybackPeriod"];
  //   document.querySelector("#out5").className = "red";
  // } else if (model["discountedPaybackPeriod"] > 0) {
  //   document.querySelector(
  //     "#out5"
  //   ).innerText = `${model["discountedPaybackPeriod"]} года`;
  //   document.querySelector("#out5").className = "black";
  // }

  //Заполнение Таблицы ПиУ (ps: название на сайте "Прогноз финансовых результатов и анализ рентабельности на 7 лет")

  const emtyRow = getRowIndexInTbody("empty-row-spacer") + 1; //получаем индекс пустой строки
  const lastRow = getRowIndexInTbody("last-row") + 1; //получаем индекс последней строки

  const valueForTablePAL = {
    1: model["earnings"],
    2: model["operatingExpenses"],
    3: model["depreciationYear"],
    4: model["grossProfit"],
    5: model["profitabilityGP"],
    6: model["interest"],
    7: model["taxes"],
    8: model["netProfit"],
    9: model["profitabilityNP"],
    11: model["profitabilityI"],
    12: model["ROEYear"],
    13: model["interestDepositYear"],
    14: model["netProfit"],
    15: model["depositYear"],
  };

  valueForTablePAL[1][0] = model["sumEarnings"];
  valueForTablePAL[2][0] = model["sumOperatingExpenses"];
  valueForTablePAL[3][0] = model["sumDepreciation"];
  valueForTablePAL[4][0] = model["sumGrossProfit"];
  valueForTablePAL[5][0] = model["meanProfitabilityGP"];
  valueForTablePAL[6][0] = model["sumInterest"];
  valueForTablePAL[7][0] = model["sumTaxes"];
  valueForTablePAL[8][0] = model["sumNetProfit"];
  valueForTablePAL[9][0] = model["meanProfitabilityNT"];
  valueForTablePAL[11][0] = model["meanProfitabilityI"];
  valueForTablePAL[12][0] = model["meanROE"];
  valueForTablePAL[13][0] = model["interestDepositYear"][1];
  valueForTablePAL[14][0] = model["sumNetProfit"];
  valueForTablePAL[15][0] = model["sumDeposit"];

  let Table1 = document.getElementById("ProfitAndLoss");

  for (let i = 1; i < emtyRow; i++) {
    for (let j = 1; j <= 8; j++) {
      if (i == 5 || i == emtyRow - 1) {
        if (valueForTablePAL[i][j - 1] >= 0) {
          Table1.rows.item(i).cells[j].innerText = `${Math.round(
            valueForTablePAL[i][j - 1] * 100
          )} %`; //.toFixed(0)
          Table1.rows.item(i).cells[j].classList.remove("red");
        } else {
          Table1.rows.item(i).cells[j].innerText = "убыток";
          Table1.rows.item(i).cells[j].classList.add("red");
        }
      } else {
        Table1.rows.item(i).cells[j].innerText =
          valueForTablePAL[i][j - 1].toLocaleString("ru-RU");
        if (valueForTablePAL[i][j - 1] < 0) {
          Table1.rows.item(i).cells[j].classList.add("red");
        } else {
          Table1.rows.item(i).cells[j].classList.remove("red");
        }
      }
    }
  }

  for (let i = emtyRow + 1; i < lastRow; i++) {
    for (let j = 1; j <= 8; j++) {
      if (i == emtyRow + 1 || i == emtyRow + 2 || i == emtyRow + 3) {
        if (valueForTablePAL[i][j - 1] >= 0) {
          Table1.rows.item(i).cells[j].innerText = `${Math.round(
            valueForTablePAL[i][j - 1] * 100
          )} %`; //.toFixed(0)
          Table1.rows.item(i).cells[j].classList.remove("red");
        } else {
          Table1.rows.item(i).cells[j].innerText = "убыток";
          Table1.rows.item(i).cells[j].classList.add("red");
        }
      } else {
        Table1.rows.item(i).cells[j].innerText = Math.round(
          valueForTablePAL[i][j - 1]
        ).toLocaleString("ru-RU");
        if (valueForTablePAL[i][j - 1] < 0) {
          Table1.rows.item(i).cells[j].classList.add("red");
        } else {
          Table1.rows.item(i).cells[j].classList.remove("red");
        }
      }

      // Table1.rows.item(14).cells[i].innerText =
      //   valueForTablePAL[8][i - 1].toLocaleString("ru-RU");
      // Table1.rows.item(15).cells[i].innerText = roundingWithMultiplicity(
      //   valueForTablePAL[13][i - 1],
      //   10 ** 5
      // ).toLocaleString("ru-RU");
      // if (valueForTablePAL[8][i - 1] < 0) {
      //   Table1.rows.item(15).cells[i].classList.add("red");
      // } else {
      //   Table1.rows.item(15).cells[i].classList.remove("red");
      // }
    }
  }
  Table1.rows.item(lastRow).cells[1].innerText = `${model["keyRate"] * 100} %`;

  updateChart(myChart, Object.values(model["ccfWithInvestYear"])); // Обновляем График Окупаемости

  // Вывод таблицы ИНВЕСТИЦИИ  на страницу
  document.getElementById("invest").innerHTML = createInvestmentTable(
    model["investment"],
    square,
    model["sumInvestments"]
  );

  // Вывод таблицы cashFlow (ДДС)  на страницу
  document.getElementById("cashFlow").innerHTML = createCashFlowTable(
    model["ccf"],
    model["operating"],
    model["credit"],
    model["inv"],
    model["cf"]
  );

  //Данные для графика Анализа рентабельности  инвестиций от площади (площадь перебераем [700;2500], остальные параметры заданы моделью)

  const dataNew2 = {};
  const dataNew2_2 = {};

  for (let i = left_; i <= right_; i += 100) {
    dataNew2[i] =
      (modelAGF(
        i,
        rentalRate,
        loanAmount,
        interestRate,
        loanPeriod,
        checkbox.checked
      )["sumNetProfit"] /
        7 /
        modelAGF(
          i,
          rentalRate,
          loanAmount,
          interestRate,
          loanPeriod,
          checkbox.checked
        )["sumInvestments"]) *
      100;
    dataNew2_2[i] = model["keyRate"] * 100;
  }

  updateChart(myChart2, dataNew2, dataNew2_2); // Обновляем График Анализа рентабельности инвестиций от площади

  //Данные для графика Анализа рентабельности инвестиций от Арендной ставки (ставку перебераем [0;1200], остальные параметры заданы моделью)

  const dataNew3 = {};
  const dataNew3_2 = {};

  for (let i = 0; i <= 1200; i += 50) {
    dataNew3[i] =
      (modelAGF(
        square,
        i,
        loanAmount,
        interestRate,
        loanPeriod,
        checkbox.checked
      )["sumNetProfit"] /
        7 /
        modelAGF(
          square,
          i,
          loanAmount,
          interestRate,
          loanPeriod,
          checkbox.checked
        )["sumInvestments"]) *
      100;
    dataNew3_2[i] = model["keyRate"] * 100;
  }

  updateChart(myChart3, dataNew3, dataNew3_2); // Обновляем График Анализа рентабельности инвестиций от Арендной ставки

  //Данные для графика Выбора варианта налогообложения

  const dataNew4 = {};
  const dataNew4_2 = {};

  for (let i = left_; i <= right_; i += 100) {
    dataNew4[i] = modelAGF(
      i,
      rentalRate,
      loanAmount,
      interestRate,
      loanPeriod,
      checkbox.checked
    )["meanTaxes_6"];
    dataNew4_2[i] = modelAGF(
      i,
      rentalRate,
      loanAmount,
      interestRate,
      loanPeriod
    )["meanTaxes_15"];
  }

  updateChart(myChart4, dataNew4, dataNew4_2); // Обновляем График Выбора налогообложения
}

//----------------------------------------------------------------

//ВЫВОДИМ ПОДСКАЗКУ, ЕСЛИ ПЛОЩАДЬ ВНЕ ОТРЕЗКА [700;2500]

const input_ = document.getElementById("number1");
const tooltip = document.querySelector(".tooltiptext");

input_.addEventListener("input", function () {
  const value = parseInt(this.value);

  if (input_ && (isNaN(value) || value < 700 || value > 2500)) {
    tooltip.classList.add("show");
    input_.classList.add("error");
  } else {
    tooltip.classList.remove("show");
    input_.classList.remove("error");
  }
});

// Скрываем подсказку при клике вне поля ввода
document.addEventListener("keydown", function (event) {
  if (event.key == "Escape") {
    tooltip.classList.remove("show");
  }
});

// Ввод суммы кредита с разделителями разрядов

document.getElementById("number3").addEventListener("input", function (e) {
  // Получаем введённое значение и удаляем все нецифровые символы (кроме точки для десятичных)
  const rawValue = this.value.replace(/[^\d.]/g, "");

  // Сохраняем "чистое" число в data-атрибут (преобразуем в число)
  this.dataset.rawValue = rawValue ? parseFloat(rawValue) : 0;

  // Форматируем отображение с разделителями разрядов
  this.value = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
});
//----------------------------------------------------------------------

document.querySelector(".btn").addEventListener("click", calculate); // При нажатии конопки "РАССЧИТАТЬ"
// При нажатии ENTER
document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    calculate();
  }
});

//----------------------------------------------------------
//ФУНКЦИИ ДОБАВЛЕНИЕ ТАБЛИЦЫ ИНВЕСТИЦИЙ.

// Форматирование числа с разделителями тысяч
function formatNumber(num) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(num));
}

// СОЗДАНИЕ HTML-ТАБЛИЦ С РЕЗУЛЬТАТАМИ

// Таблица расчета инвестиций
function createInvestmentTable(investment, square_base, sumInvestments) {
  const square =
    square_base >= left_ && square_base <= right_ ? square_base : 0;
  let html = `
    <div class="table-container">
        <table id="invest" border="1">
            <caption class="table-caption">Расчет инвестиций для площади ${square} м²</caption>
            <thead>
                <tr>
                    <th>Статья расходов</th>
                    <th>Сумма (руб)</th>
                </tr>
            </thead>
            <tbody>
    `;

  // Добавляем строки для каждой статьи расходов
  for (let key in investment) {
    html += `
            <tr>
                <td>${investment[key][1]}</td>
                <td style="text-align: right;">${formatNumber(
                  investment[key][0]
                )}</td>
            </tr>
        `;
  }

  // Добавляем итоговую строку
  html += `
            <tr style="font-weight: bold;">
                <td>ИТОГО:</td>
                <td style="text-align: right;">${formatNumber(
                  sumInvestments
                )}</td>
            </tr>
            </tbody>
        </table>
    `;

  return html;
}

// ТАБЛИЦА ДДС

// Отрицательные значения в красный цвет
function getNegativeClass(value) {
  return (value ?? 0) < 0 ? "red" : "";
}

function createCashFlowTable(ccf, ...incomeElems) {
  //собираем переданные элементы в массив

  let html = `
    <div class="table-container">
        <table class="table" id="cashFlow">
            <caption class="table-caption">Движение денежных средств</caption>
            <thead class="table-fields">
                <tr>
                    <th>Наименование</th>
                    <th>инвест</th>
                    <th>1-й год</th>
                    <th>2-й год</th>
                    <th>3-й год</th>
                    <th>4-й год</th>
                    <th>5-й год</th>
                    <th>6-й год</th>
                    <th>7-й год</th>
                </tr>
            </thead>
            <tbody>
    `;

  // Добавляем строки для каждой статьи roundingWithMultiplicity(num, mult)

  for (let income of incomeElems) {
    const keys = Object.keys(income);

    let lastElemKeys = keys[keys.length - 1];

    for (let i = 0; i < keys.length - 1; i++) {
      let key = keys[i];
      html += `
            <tr>
                <td class="table-fields__name ">${income[key][1]}</td>
                <td  class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][0], 10 ** 2) ?? 0
                )}</td>
                <td  class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][1], 10 ** 2) ?? 0
                )}</td>
                <td  class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][2], 10 ** 2) ?? 0
                )}</td>
                <td  class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][3], 10 ** 2) ?? 0
                )}</td>
                <td  class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][4], 10 ** 2) ?? 0
                )}</td>
                <td  class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][5], 10 ** 2) ?? 0
                )}</td>
                <td  class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][6], 10 ** 2) ?? 0
                )}</td>
                <td class="cell">${formatNumber(
                  roundingWithMultiplicity(income[key][0][7], 10 ** 2) ?? 0
                )}</td>
            </tr>
        `;
    }

    html += `
            <tr>
                <td class="table-fields__name cell__total">${
                  income[lastElemKeys][1]
                }</td>
                <td  class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][0]
                )}"> ${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][0], 10 ** 4) ?? 0
    )}</td>
                <td  class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][1]
                )}">${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][1], 10 ** 5) ?? 0
    )}</td>
                <td  class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][2]
                )}">${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][2], 10 ** 5) ?? 0
    )}</td>
                <td  class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][3]
                )}">${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][3], 10 ** 5) ?? 0
    )}</td>
                <td  class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][4]
                )}">${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][4], 10 ** 5) ?? 0
    )}</td>
                <td  class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][5]
                )}">${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][5], 10 ** 5) ?? 0
    )}</td>
                <td  class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][6]
                )}">${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][6], 10 ** 5) ?? 0
    )}</td>
                <td class="cell cell__total ${getNegativeClass(
                  income[lastElemKeys][0][7]
                )}">${formatNumber(
      roundingWithMultiplicity(income[lastElemKeys][0][7], 10 ** 5) ?? 0
    )}</td>
            </tr>
        `;
  }

  // Добавляем Итоговую строку
  html += `
              <tr>
                  <td class="table-fields__name cell__total">${ccf["ccf"][1]}</td>`;

  // Создаем ячейки в цикле
  for (let i = 0; i < 8; i++) {
    const value = ccf["ccf"][0][i] ?? 0;
    const negativeClass = value < 0 ? "red" : "";
    html += `<td class="cell cell__total ${negativeClass}">${formatNumber(
      roundingWithMultiplicity(value, 10 ** 3)
    )}</td>`;
  }

  html += `
              </tr>
          </tbody>
          </table>`;

  return html;
}

// Поиск номера строки с заданной таблицы HTML. Нужно для Таблицы ПиУ (задолюался руками переделывать)))):

function getRowIndexInTbody(rowId) {
  const row = document.getElementById(rowId);
  if (!row || !row.parentNode) return -1;

  // Ищем ближайший tbody (на случай сложной структуры таблицы)
  const tbody = row.closest("tbody");
  const rows = tbody ? tbody.rows : row.parentNode.children;

  return Array.from(rows).indexOf(row);
}

//
// // Проверка состояния галки
// function isCheckboxChecked() {
//   return checkbox.checked;
// }
// const isChecked = getCheckboxStatus(); // возврат Булева значения по состоянию галки

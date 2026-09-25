/* ==========================================================================
   DigitalCron Tools - Unit Converters Suite JavaScript Engine
   Supports Length, Weight, Temperature, Area, Volume, Speed, Time,
   Pressure, Power & Digital Storage Converters
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initUnitConverters();
});

function initUnitConverters() {
  const converterTypeInput = document.getElementById('converter-type');
  if (!converterTypeInput) return;

  const type = converterTypeInput.value;
  const inputVal = document.getElementById('unit-input');
  const fromUnitSelect = document.getElementById('unit-from');
  const toUnitSelect = document.getElementById('unit-to');
  const swapBtn = document.getElementById('btn-swap-units');
  const copyBtn = document.getElementById('btn-copy-result');
  const copyTableBtn = document.getElementById('btn-copy-table');

  if (inputVal && fromUnitSelect && toUnitSelect) {
    inputVal.addEventListener('input', () => calculateConversion(type));
    fromUnitSelect.addEventListener('change', () => calculateConversion(type));
    toUnitSelect.addEventListener('change', () => calculateConversion(type));

    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const temp = fromUnitSelect.value;
        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = temp;
        calculateConversion(type);
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const resultVal = document.getElementById('unit-result')?.value || '';
        if (resultVal) {
          safeCopy(resultVal, 'Result copied to clipboard!');
          if (typeof showToast === 'function') {
            showToast('Conversion result copied to clipboard!');
          }
        }
      });
    }

    if (copyTableBtn) {
      copyTableBtn.addEventListener('click', () => {
        const rows = document.querySelectorAll('#breakdown-table-body tr');
        let text = '';
        rows.forEach(row => {
          const cols = row.querySelectorAll('td');
          if (cols.length >= 2) {
            text += `${cols[0].innerText.trim()}: ${cols[1].innerText.trim()}\n`;
          }
        });
        if (text) {
          safeCopy(text, 'Formula copied to clipboard!');
          if (typeof showToast === 'function') {
            showToast('Unit breakdown table copied!');
          }
        }
      });
    }

    // Initial calculation
    calculateConversion(type);
  }
}

// Unit Definitions & Conversion Factors (Relative to Base Unit)
const UNIT_DEFINITIONS = {
  length: {
    base: 'meter',
    units: {
      meter: { name: 'Meter (m)', factor: 1 },
      kilometer: { name: 'Kilometer (km)', factor: 1000 },
      centimeter: { name: 'Centimeter (cm)', factor: 0.01 },
      millimeter: { name: 'Millimeter (mm)', factor: 0.001 },
      mile: { name: 'Mile (mi)', factor: 1609.344 },
      yard: { name: 'Yard (yd)', factor: 0.9144 },
      foot: { name: 'Foot (ft)', factor: 0.3048 },
      inch: { name: 'Inch (in)', factor: 0.0254 },
      nautical_mile: { name: 'Nautical Mile (nmi)', factor: 1852 }
    }
  },

  weight: {
    base: 'kilogram',
    units: {
      kilogram: { name: 'Kilogram (kg)', factor: 1 },
      gram: { name: 'Gram (g)', factor: 0.001 },
      milligram: { name: 'Milligram (mg)', factor: 0.000001 },
      metric_ton: { name: 'Metric Ton (t)', factor: 1000 },
      pound: { name: 'Pound (lb)', factor: 0.45359237 },
      ounce: { name: 'Ounce (oz)', factor: 0.028349523125 },
      stone: { name: 'Stone (st)', factor: 6.35029318 }
    }
  },

  temperature: {
    custom: true,
    units: {
      celsius: { name: 'Celsius (°C)' },
      fahrenheit: { name: 'Fahrenheit (°F)' },
      kelvin: { name: 'Kelvin (K)' }
    }
  },

  area: {
    base: 'square_meter',
    units: {
      square_meter: { name: 'Square Meter (m²)', factor: 1 },
      square_kilometer: { name: 'Square Kilometer (km²)', factor: 1000000 },
      square_centimeter: { name: 'Square Centimeter (cm²)', factor: 0.0001 },
      square_millimeter: { name: 'Square Millimeter (mm²)', factor: 0.000001 },
      square_foot: { name: 'Square Foot (ft²)', factor: 0.09290304 },
      square_yard: { name: 'Square Yard (yd²)', factor: 0.83612736 },
      square_inch: { name: 'Square Inch (in²)', factor: 0.00064516 },
      square_mile: { name: 'Square Mile (mi²)', factor: 2589988.110336 },
      acre: { name: 'Acre (ac)', factor: 4046.8564224 },
      hectare: { name: 'Hectare (ha)', factor: 10000 }
    }
  },

  volume: {
    base: 'liter',
    units: {
      liter: { name: 'Liter (L)', factor: 1 },
      milliliter: { name: 'Milliliter (mL)', factor: 0.001 },
      cubic_meter: { name: 'Cubic Meter (m³)', factor: 1000 },
      gallon: { name: 'US Gallon (gal)', factor: 3.785411784 },
      quart: { name: 'US Quart (qt)', factor: 0.946352946 },
      pint: { name: 'US Pint (pt)', factor: 0.473176473 },
      cup: { name: 'US Cup (cup)', factor: 0.24 },
      fluid_ounce: { name: 'US Fluid Ounce (fl oz)', factor: 0.0295735295625 },
      cubic_foot: { name: 'Cubic Foot (ft³)', factor: 28.316846592 },
      cubic_inch: { name: 'Cubic Inch (in³)', factor: 0.016387064 }
    }
  },

  speed: {
    base: 'mps',
    units: {
      mps: { name: 'Meters / sec (m/s)', factor: 1 },
      kph: { name: 'Kilometers / hr (km/h)', factor: 0.2777777777777778 },
      mph: { name: 'Miles / hr (mph)', factor: 0.44704 },
      knot: { name: 'Knots (kn)', factor: 0.5144444444444445 },
      fps: { name: 'Feet / sec (ft/s)', factor: 0.3048 }
    }
  },

  time: {
    base: 'second',
    units: {
      nanosecond: { name: 'Nanosecond (ns)', factor: 1e-9 },
      microsecond: { name: 'Microsecond (µs)', factor: 1e-6 },
      millisecond: { name: 'Millisecond (ms)', factor: 0.001 },
      second: { name: 'Second (s)', factor: 1 },
      minute: { name: 'Minute (min)', factor: 60 },
      hour: { name: 'Hour (hr)', factor: 3600 },
      day: { name: 'Day (d)', factor: 86400 },
      week: { name: 'Week (wk)', factor: 604800 },
      month: { name: 'Month (mo)', factor: 2629800 },
      year: { name: 'Year (yr)', factor: 31557600 }
    }
  },

  pressure: {
    base: 'pascal',
    units: {
      pascal: { name: 'Pascal (Pa)', factor: 1 },
      kilopascal: { name: 'Kilopascal (kPa)', factor: 1000 },
      bar: { name: 'Bar (bar)', factor: 100000 },
      psi: { name: 'Pound / sq inch (PSI)', factor: 6894.757293168 },
      atm: { name: 'Atmosphere (atm)', factor: 101325 },
      torr: { name: 'Torr / mmHg', factor: 133.322368421 }
    }
  },

  power: {
    base: 'watt',
    units: {
      watt: { name: 'Watt (W)', factor: 1 },
      kilowatt: { name: 'Kilowatt (kW)', factor: 1000 },
      megawatt: { name: 'Megawatt (MW)', factor: 1000000 },
      horsepower: { name: 'Horsepower (hp)', factor: 745.6998715822702 },
      btu_hr: { name: 'BTU per hour (BTU/h)', factor: 0.29307107 },
      cal_sec: { name: 'Calorie / sec (cal/s)', factor: 4.184 }
    }
  },

  digital_storage: {
    base: 'byte',
    units: {
      bit: { name: 'Bit (b)', factor: 0.125 },
      byte: { name: 'Byte (B)', factor: 1 },
      kilobit: { name: 'Kilobit (Kb)', factor: 125 },
      kilobyte: { name: 'Kilobyte (KB)', factor: 1000 },
      megabit: { name: 'Megabit (Mb)', factor: 125000 },
      megabyte: { name: 'Megabyte (MB)', factor: 1000000 },
      gigabit: { name: 'Gigabit (Gb)', factor: 125000000 },
      gigabyte: { name: 'Gigabyte (GB)', factor: 1000000000 },
      terabyte: { name: 'Terabyte (TB)', factor: 1000000000000 },
      petabyte: { name: 'Petabyte (PB)', factor: 1000000000000000 }
    }
  }
};

function calculateConversion(type) {
  const inputEl = document.getElementById('unit-input');
  const fromEl = document.getElementById('unit-from');
  const toEl = document.getElementById('unit-to');
  const resultEl = document.getElementById('unit-result');
  const formulaEl = document.getElementById('conversion-formula');
  const tableBody = document.getElementById('breakdown-table-body');

  if (!inputEl || !fromEl || !toEl || !resultEl) return;

  const rawVal = parseFloat(inputEl.value);
  if (isNaN(rawVal)) {
    resultEl.value = '';
    if (formulaEl) formulaEl.innerText = 'Enter a valid numeric value';
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="2" class="p-4 text-center text-slate-400">Enter a value above to view full conversion breakdown</td></tr>';
    return;
  }

  const def = UNIT_DEFINITIONS[type];
  if (!def) return;

  const fromKey = fromEl.value;
  const toKey = toEl.value;

  let convertedValue = 0;
  let baseValue = 0;

  if (type === 'temperature') {
    convertedValue = convertTemperature(rawVal, fromKey, toKey);
    if (formulaEl) {
      formulaEl.innerText = getTemperatureFormula(rawVal, fromKey, toKey, convertedValue);
    }
  } else {
    const fromFactor = def.units[fromKey]?.factor || 1;
    const toFactor = def.units[toKey]?.factor || 1;

    baseValue = rawVal * fromFactor;
    convertedValue = baseValue / toFactor;

    if (formulaEl) {
      const fromName = def.units[fromKey]?.name || fromKey;
      const toName = def.units[toKey]?.name || toKey;
      formulaEl.innerText = `${formatNumber(rawVal)} ${fromName} = ${formatNumber(convertedValue)} ${toName}`;
    }
  }

  resultEl.value = formatNumber(convertedValue);

  // Render Full Breakdown Grid Table
  if (tableBody) {
    let rowsHtml = '';
    Object.keys(def.units).forEach(key => {
      const unitObj = def.units[key];
      let val = 0;

      if (type === 'temperature') {
        val = convertTemperature(rawVal, fromKey, key);
      } else {
        const fromFactor = def.units[fromKey]?.factor || 1;
        const targetFactor = unitObj.factor || 1;
        val = (rawVal * fromFactor) / targetFactor;
      }

      const isCurrentTo = key === toKey;
      rowsHtml += `
        <tr class="${isCurrentTo ? 'bg-indigo-500/10 dark:bg-indigo-500/20 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-900'} transition-colors border-b border-slate-200 dark:border-slate-800">
          <td class="px-4 py-3 text-left font-mono text-xs text-slate-800 dark:text-slate-200">
            ${unitObj.name} ${isCurrentTo ? '<span class="text-[#6366F1] ml-1">(Selected)</span>' : ''}
          </td>
          <td class="px-4 py-3 text-right font-mono text-xs text-[#6366F1] font-bold">
            ${formatNumber(val)}
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = rowsHtml;
  }
}

function convertTemperature(val, from, to) {
  if (from === to) return val;

  // Convert from input to Celsius first
  let celsius = val;
  if (from === 'fahrenheit') {
    celsius = (val - 32) * (5 / 9);
  } else if (from === 'kelvin') {
    celsius = val - 273.15;
  }

  // Convert Celsius to target
  if (to === 'celsius') return celsius;
  if (to === 'fahrenheit') return (celsius * 9 / 5) + 32;
  if (to === 'kelvin') return celsius + 273.15;

  return val;
}

function getTemperatureFormula(val, from, to, result) {
  const fromName = UNIT_DEFINITIONS.temperature.units[from]?.name || from;
  const toName = UNIT_DEFINITIONS.temperature.units[to]?.name || to;
  return `${formatNumber(val)} ${fromName} = ${formatNumber(result)} ${toName}`;
}

function formatNumber(num) {
  if (Math.abs(num) < 0.000001 && num !== 0) {
    return num.toExponential(6);
  }
  return Number(num.toFixed(6)).toString();
}

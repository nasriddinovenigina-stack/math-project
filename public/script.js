// Math Practice site logic.
// Each page is a single topic: problems are generated randomly,
// answers are checked immediately, and a running score is kept.

(function () {
  "use strict";

  const PROBLEMS_PER_ROUND = 5;

  // ---------- helpers ----------

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a || 1;
  }

  function nonZeroRandInt(min, max) {
    let v;
    do {
      v = randInt(min, max);
    } while (v === 0);
    return v;
  }

  function getLang() {
    return document.documentElement.lang === "ru" ? "ru" : "en";
  }

  function parseFractionOrDecimal(text) {
    text = String(text).trim();
    if (!text) return NaN;
    if (text.includes("/")) {
      const parts = text.split("/");
      if (parts.length !== 2) return NaN;
      const num = Number(parts[0].trim());
      const den = Number(parts[1].trim());
      if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return NaN;
      return num / den;
    }
    const val = Number(text);
    return Number.isFinite(val) ? val : NaN;
  }

  // ---------- problem generators ----------
  // Each generator returns an array of problem objects:
  // { question: string, checkAnswer(rawInput) -> boolean, correctAnswerText: string }

  function generateArithmeticProblems() {
    const problems = [];
    const ops = ["+", "-", "*"];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const op = ops[randInt(0, ops.length - 1)];
      let a, b, answer, symbol;
      if (op === "+") {
        a = randInt(1, 50);
        b = randInt(1, 50);
        answer = a + b;
        symbol = "+";
      } else if (op === "-") {
        a = randInt(1, 50);
        b = randInt(1, a); // avoid negative results
        answer = a - b;
        symbol = "−";
      } else {
        a = randInt(2, 12);
        b = randInt(2, 12);
        answer = a * b;
        symbol = "×";
      }
      problems.push({
        question: `${a} ${symbol} ${b} = ?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function fractionCheckAnswer(correctNum, correctDen) {
    return function checkAnswer(raw) {
      const text = String(raw).trim();
      if (!text) return false;
      let userNum, userDen;
      if (text.includes("/")) {
        const parts = text.split("/");
        if (parts.length !== 2) return false;
        userNum = Number(parts[0].trim());
        userDen = Number(parts[1].trim());
      } else {
        userNum = Number(text);
        userDen = 1;
      }
      if (!Number.isFinite(userNum) || !Number.isFinite(userDen) || userDen === 0) {
        return false;
      }
      // Cross-multiply to check the fraction is equivalent,
      // regardless of whether the user simplified it.
      return userNum * correctDen === correctNum * userDen;
    };
  }

  function fractionAnswerText(correctNum, correctDen) {
    return correctDen === 1 ? String(correctNum) : `${correctNum}/${correctDen}`;
  }

  function fracHtml(num, den) {
    return `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  }

  function generateFractionsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: adding fractions.
        const d1 = randInt(2, 10);
        const d2 = randInt(2, 10);
        const n1 = randInt(1, d1 - 1);
        const n2 = randInt(1, d2 - 1);

        // sum = n1/d1 + n2/d2 = (n1*d2 + n2*d1) / (d1*d2)
        const sumNum = n1 * d2 + n2 * d1;
        const sumDen = d1 * d2;
        const g = gcd(sumNum, sumDen);
        const correctNum = sumNum / g;
        const correctDen = sumDen / g;

        problems.push({
          question: `${n1}/${d1} + ${n2}/${d2} = ?`,
          questionHtml: `${fracHtml(n1, d1)} + ${fracHtml(n2, d2)} = ?`,
          checkAnswer: fractionCheckAnswer(correctNum, correctDen),
          correctAnswerText: fractionAnswerText(correctNum, correctDen),
          correctAnswerHtml: fracHtml(correctNum, correctDen),
        });
      } else {
        // Type 2: subtracting fractions (first fraction is always >= second).
        let d1 = randInt(2, 10);
        let d2 = randInt(2, 10);
        let n1 = randInt(1, d1 - 1);
        let n2 = randInt(1, d2 - 1);

        if (n1 * d2 < n2 * d1) {
          [d1, d2] = [d2, d1];
          [n1, n2] = [n2, n1];
        }

        // diff = n1/d1 - n2/d2 = (n1*d2 - n2*d1) / (d1*d2)
        const diffNum = n1 * d2 - n2 * d1;
        const diffDen = d1 * d2;
        const g = gcd(diffNum, diffDen);
        const correctNum = diffNum / g;
        const correctDen = diffDen / g;

        problems.push({
          question: `${n1}/${d1} − ${n2}/${d2} = ?`,
          questionHtml: `${fracHtml(n1, d1)} − ${fracHtml(n2, d2)} = ?`,
          checkAnswer: fractionCheckAnswer(correctNum, correctDen),
          correctAnswerText: fractionAnswerText(correctNum, correctDen),
          correctAnswerHtml: fracHtml(correctNum, correctDen),
        });
      }
    }
    return problems;
  }

  function generateAlgebraProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: ax + b = c
        const a = randInt(2, 9);
        const x = randInt(1, 12);
        const b = randInt(-10, 10);
        const c = a * x + b;
        const bText = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;

        problems.push({
          question:
            lang === "ru"
              ? `Решите уравнение: ${a}x ${bText} = ${c}`
              : `Solve for x: ${a}x ${bText} = ${c}`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === x;
          },
          correctAnswerText: String(x),
        });
      } else {
        // Type 2: a1*x + b1 = a2*x + b2, with a1 != a2.
        const x = randInt(1, 10);
        let a1 = randInt(1, 9);
        let a2 = randInt(1, 9);
        while (a2 === a1) a2 = randInt(1, 9);
        const b1 = randInt(-10, 10);
        const b2 = a1 * x + b1 - a2 * x;
        const b1Text = b1 >= 0 ? `+ ${b1}` : `− ${Math.abs(b1)}`;
        const b2Text = b2 >= 0 ? `+ ${b2}` : `− ${Math.abs(b2)}`;

        problems.push({
          question:
            lang === "ru"
              ? `Решите уравнение: ${a1}x ${b1Text} = ${a2}x ${b2Text}`
              : `Solve for x: ${a1}x ${b1Text} = ${a2}x ${b2Text}`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === x;
          },
          correctAnswerText: String(x),
        });
      }
    }
    return problems;
  }

  function generateFunctionsProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: evaluate f(x) at a given input.
        const a = nonZeroRandInt(-6, 6);
        const b = randInt(-10, 10);
        const x = randInt(-8, 8);
        const answer = a * x + b;
        const bText = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;

        problems.push({
          question:
            lang === "ru" ? `f(x) = ${a}x ${bText}. Найдите f(${x}).` : `f(x) = ${a}x ${bText}. Find f(${x}).`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      } else {
        // Type 2: find a and b in f(x) = ax + b from two points.
        const a = nonZeroRandInt(-8, 8);
        const b = randInt(-15, 15);
        const x1 = randInt(-6, 6);
        let x2 = randInt(-6, 6);
        while (x2 === x1) x2 = randInt(-6, 6);
        const y1 = a * x1 + b;
        const y2 = a * x2 + b;

        problems.push({
          question:
            lang === "ru"
              ? `Прямая проходит через точки (${x1}, ${y1}) и (${x2}, ${y2}). Найдите a и b в f(x) = ax + b.`
              : `A line passes through (${x1}, ${y1}) and (${x2}, ${y2}). Find a and b in f(x) = ax + b.`,
          checkAnswer(raw) {
            const parts = String(raw).trim().split(",").map((p) => Number(p.trim()));
            if (parts.length !== 2 || parts.some((p) => !Number.isFinite(p))) return false;
            return parts[0] === a && parts[1] === b;
          },
          correctAnswerText: `a = ${a}, b = ${b}`,
        });
      }
    }
    return problems;
  }

  function generateQuadraticProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: factor x² + bx + c = 0 (both roots are clean integers).
        const r1 = randInt(-8, 8);
        const r2 = randInt(-8, 8);
        const b = -(r1 + r2);
        const c = r1 * r2;
        const bText = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
        const cText = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        const correctSorted = [r1, r2].sort((x, y) => x - y);

        problems.push({
          question: lang === "ru" ? `x² ${bText} ${cText} = 0. Найдите x.` : `x² ${bText} ${cText} = 0. Find x.`,
          checkAnswer(raw) {
            const parts = String(raw).trim().split(",").map((p) => Number(p.trim()));
            if (parts.length !== 2 || parts.some((p) => !Number.isFinite(p))) return false;
            const sorted = parts.sort((x, y) => x - y);
            return sorted[0] === correctSorted[0] && sorted[1] === correctSorted[1];
          },
          correctAnswerText: correctSorted.join(", "),
        });
      } else {
        // Type 2: the quadratic formula, leading coefficient != 1 (one root is a
        // clean fraction — a is a power of 2 so m/a always terminates exactly).
        const a = Math.random() < 0.5 ? 2 : 4;
        let m = randInt(1, 3 * a);
        while (m % a === 0) m = randInt(1, 3 * a);
        const n = randInt(-6, 6);
        const b = -(a * n + m);
        const c = m * n;
        const bText = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
        const cText = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        const correctSorted = [m / a, n].sort((x, y) => x - y);

        problems.push({
          question:
            lang === "ru" ? `${a}x² ${bText} ${cText} = 0. Найдите x.` : `${a}x² ${bText} ${cText} = 0. Find x.`,
          checkAnswer(raw) {
            const parts = String(raw).trim().split(",").map((p) => parseFractionOrDecimal(p));
            if (parts.length !== 2 || parts.some((p) => !Number.isFinite(p))) return false;
            const sorted = parts.slice().sort((x, y) => x - y);
            return Math.abs(sorted[0] - correctSorted[0]) < 1e-9 && Math.abs(sorted[1] - correctSorted[1]) < 1e-9;
          },
          correctAnswerText: correctSorted.join(", "),
        });
      }
    }
    return problems;
  }

  function generateParabolaProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = nonZeroRandInt(-3, 3);
      const vertexX = randInt(-6, 6);
      const b = -2 * a * vertexX;
      const c = randInt(-10, 10);
      const bText = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
      const cText = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;

      problems.push({
        question:
          lang === "ru"
            ? `Для y = ${a}x² ${bText} ${cText} найдите x-координату вершины.`
            : `For y = ${a}x² ${bText} ${cText}, what is the x-coordinate of the vertex?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === vertexX;
        },
        correctAnswerText: String(vertexX),
      });
    }
    return problems;
  }

  function generateExponentsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: basic repeated multiplication.
        const base = randInt(2, 9);
        const exp = randInt(2, 4);
        const answer = Math.pow(base, exp);

        problems.push({
          question: `${base}^${exp} = ?`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      } else {
        // Type 2: multiplying powers with the same base (add the exponents).
        const base = randInt(2, 6);
        const exp1 = randInt(1, 4);
        const exp2 = randInt(1, Math.max(1, 6 - exp1));
        const answer = Math.pow(base, exp1 + exp2);

        problems.push({
          question: `${base}^${exp1} × ${base}^${exp2} = ?`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      }
    }
    return problems;
  }

  function generateOrderOfOperationsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(1, 10);
      const b = randInt(1, 10);
      const c = randInt(1, 10);
      const useParens = Math.random() < 0.5;
      let question, answer;
      if (useParens) {
        question = `(${a} + ${b}) × ${c} = ?`;
        answer = (a + b) * c;
      } else {
        question = `${a} + ${b} × ${c} = ?`;
        answer = a + b * c;
      }

      problems.push({
        question,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generatePercentagesProblems() {
    const problems = [];
    const lang = getLang();
    const PERCENTS = [5, 10, 20, 25, 50];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: find p% of a number.
        const p = PERCENTS[randInt(0, PERCENTS.length - 1)];
        const m = 100 / p;
        const k = randInt(1, 15);
        const n = k * m;

        problems.push({
          question: lang === "ru" ? `Найдите ${p}% от ${n}.` : `Find ${p}% of ${n}.`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === k;
          },
          correctAnswerText: String(k),
        });
      } else {
        // Type 2: reverse percentage — given the discounted price, find the original.
        const p = PERCENTS[randInt(0, PERCENTS.length - 1)];
        const m = 100 / p;
        const k = randInt(1, 15);
        const original = k * m;
        const salePrice = original - k;

        problems.push({
          question:
            lang === "ru"
              ? `После скидки ${p}% товар стоит ${salePrice}. Какой была первоначальная цена?`
              : `After a ${p}% discount, an item costs ${salePrice}. What was the original price?`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === original;
          },
          correctAnswerText: String(original),
        });
      }
    }
    return problems;
  }

  function generateSquareRootsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const x = randInt(2, 15);
      const n = x * x;

      problems.push({
        question: `√${n} = ?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === x;
        },
        correctAnswerText: String(x),
      });
    }
    return problems;
  }

  function generateAbsoluteValueProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: distance from 0.
        const n = nonZeroRandInt(-20, 20);
        const answer = Math.abs(n);

        problems.push({
          question: `|${n}| = ?`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      } else {
        // Type 2: solve |x - k| = n (distance from k, usually two solutions).
        const k = nonZeroRandInt(-8, 8);
        const n = randInt(1, 12);
        const kText = k >= 0 ? `− ${k}` : `+ ${Math.abs(k)}`;
        const correctSorted = [k + n, k - n].sort((x, y) => x - y);

        problems.push({
          question: lang === "ru" ? `|x ${kText}| = ${n}. Найдите x.` : `|x ${kText}| = ${n}. Find x.`,
          checkAnswer(raw) {
            const parts = String(raw).trim().split(",").map((p) => Number(p.trim()));
            if (parts.length !== 2 || parts.some((p) => !Number.isFinite(p))) return false;
            const sorted = parts.sort((x, y) => x - y);
            return sorted[0] === correctSorted[0] && sorted[1] === correctSorted[1];
          },
          correctAnswerText: correctSorted.join(", "),
        });
      }
    }
    return problems;
  }

  function generateNegativeNumbersProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: adding/subtracting negatives.
        const a = nonZeroRandInt(-20, 20);
        const b = nonZeroRandInt(-20, 20);
        const answer = a + b;
        const bText = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;

        problems.push({
          question: `${a} ${bText} = ?`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      } else if (Math.random() < 0.5) {
        // Type 2a: multiplying negatives.
        const a = nonZeroRandInt(-12, 12);
        const b = nonZeroRandInt(-12, 12);
        const answer = a * b;

        problems.push({
          question: `${a} × ${b} = ?`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      } else {
        // Type 2b: dividing negatives (constructed to divide evenly).
        const divisor = nonZeroRandInt(-12, 12);
        const quotient = nonZeroRandInt(-12, 12);
        const dividend = divisor * quotient;

        problems.push({
          question: `${dividend} ÷ ${divisor} = ?`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === quotient;
          },
          correctAnswerText: String(quotient),
        });
      }
    }
    return problems;
  }

  function generateGcfProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(6, 60);
      const b = randInt(6, 60);
      const answer = gcd(a, b);

      problems.push({
        question: lang === "ru" ? `НОД(${a}, ${b}) = ?` : `GCF(${a}, ${b}) = ?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateLcmProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      const answer = (a * b) / gcd(a, b);

      problems.push({
        question: lang === "ru" ? `НОК(${a}, ${b}) = ?` : `LCM(${a}, ${b}) = ?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateRatiosProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const unitPrice = randInt(1, 9) * 1000;
      const n1 = randInt(2, 9);
      let n2 = randInt(2, 9);
      while (n2 === n1) n2 = randInt(2, 9);
      const price1 = unitPrice * n1;
      const answer = unitPrice * n2;

      problems.push({
        question:
          lang === "ru"
            ? `${n1} предметов стоят ${price1} сум. Сколько будут стоить ${n2} предметов по той же цене?`
            : `${n1} items cost ${price1} so'm. How much do ${n2} items cost at the same price each?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateInequalitiesProblems() {
    const problems = [];
    const lang = getLang();
    const CMPS = ["<", ">", "≤", "≥"];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(2, 9);
      const xBoundary = randInt(-10, 10);
      const b = randInt(-10, 10);
      const c = a * xBoundary + b;
      const cmp = CMPS[randInt(0, CMPS.length - 1)];
      const bText = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;

      problems.push({
        question:
          lang === "ru"
            ? `${a}x ${bText} ${cmp} ${c}. Найдите значение x.`
            : `${a}x ${bText} ${cmp} ${c}. Find the value of x.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === xBoundary;
        },
        correctAnswerText: `x ${cmp} ${xBoundary}`,
      });
    }
    return problems;
  }

  function generateSystemsProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const xVal = randInt(-8, 8);
      const yVal = randInt(-8, 8);
      let a1, b1, a2, b2;
      do {
        a1 = randInt(1, 6);
        b1 = randInt(1, 6);
        a2 = randInt(1, 6);
        b2 = randInt(1, 6);
      } while (a1 * b2 - a2 * b1 === 0);
      const c1 = a1 * xVal + b1 * yVal;
      const c2 = a2 * xVal + b2 * yVal;

      problems.push({
        question:
          lang === "ru"
            ? `${a1}x + ${b1}y = ${c1} и ${a2}x + ${b2}y = ${c2}. Найдите x и y.`
            : `${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}. Find x and y.`,
        checkAnswer(raw) {
          const parts = String(raw).trim().split(",").map((p) => Number(p.trim()));
          if (parts.length !== 2 || parts.some((p) => !Number.isFinite(p))) return false;
          return parts[0] === xVal && parts[1] === yVal;
        },
        correctAnswerText: `x = ${xVal}, y = ${yVal}`,
      });
    }
    return problems;
  }

  function generateCirclesProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const r = randInt(2, 12);
      const isCircumference = Math.random() < 0.5;
      const raw = isCircumference ? 2 * 3.14 * r : 3.14 * r * r;
      const answer = Math.round(raw * 10) / 10;
      const question =
        lang === "ru"
          ? isCircumference
            ? `Радиус круга равен ${r}. Найдите длину окружности (используйте π ≈ 3,14).`
            : `Радиус круга равен ${r}. Найдите площадь (используйте π ≈ 3,14).`
          : isCircumference
          ? `A circle has a radius of ${r}. Find its circumference (use π ≈ 3.14).`
          : `A circle has a radius of ${r}. Find its area (use π ≈ 3.14).`;

      problems.push({
        question,
        checkAnswer(rawInput) {
          const val = Number(String(rawInput).trim());
          return Number.isFinite(val) && Math.abs(val - answer) < 0.05;
        },
        correctAnswerText: answer.toFixed(1),
      });
    }
    return problems;
  }

  function generateAverageProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const k = randInt(10, 30);
      const d1 = randInt(-5, 5);
      const d2 = randInt(-5, 5);
      const d3 = -(d1 + d2);
      const n1 = k + d1;
      const n2 = k + d2;
      const n3 = k + d3;

      problems.push({
        question:
          lang === "ru"
            ? `Найдите среднее арифметическое чисел ${n1}, ${n2}, ${n3}.`
            : `Find the average (mean) of ${n1}, ${n2}, ${n3}.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === k;
        },
        correctAnswerText: String(k),
      });
    }
    return problems;
  }

  function generateSlopeProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const x1 = randInt(-8, 8);
      const y1 = randInt(-8, 8);
      const run = randInt(1, 6);
      const x2 = x1 + run;
      const m = nonZeroRandInt(-6, 6);
      const y2 = y1 + m * run;

      problems.push({
        question:
          lang === "ru"
            ? `Точки (${x1}, ${y1}) и (${x2}, ${y2}). Найдите наклон.`
            : `Points (${x1}, ${y1}) and (${x2}, ${y2}). Find the slope.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === m;
        },
        correctAnswerText: String(m),
      });
    }
    return problems;
  }

  function generatePythagoreanProblems() {
    const problems = [];
    const lang = getLang();
    const TRIPLES = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [20, 21, 29],
      [9, 40, 41],
    ];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const triple = TRIPLES[randInt(0, TRIPLES.length - 1)];
      const k = randInt(1, 3);
      if (Math.random() < 0.5) {
        // Type 1: given both legs, find the hypotenuse.
        const legs = Math.random() < 0.5 ? [triple[0] * k, triple[1] * k] : [triple[1] * k, triple[0] * k];
        const c = triple[2] * k;

        problems.push({
          question:
            lang === "ru"
              ? `Прямоугольный треугольник имеет катеты ${legs[0]} и ${legs[1]}. Найдите гипотенузу c.`
              : `A right triangle has legs ${legs[0]} and ${legs[1]}. Find the hypotenuse c.`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === c;
          },
          correctAnswerText: String(c),
        });
      } else {
        // Type 2: given the hypotenuse and one leg, find the other leg.
        const knownIsFirst = Math.random() < 0.5;
        const knownLeg = (knownIsFirst ? triple[0] : triple[1]) * k;
        const missingLeg = (knownIsFirst ? triple[1] : triple[0]) * k;
        const c = triple[2] * k;

        problems.push({
          question:
            lang === "ru"
              ? `Прямоугольный треугольник имеет гипотенузу ${c} и один катет ${knownLeg}. Найдите второй катет.`
              : `A right triangle has hypotenuse ${c} and one leg ${knownLeg}. Find the other leg.`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === missingLeg;
          },
          correctAnswerText: String(missingLeg),
        });
      }
    }
    return problems;
  }

  function generateDecimalsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const precision = Math.random() < 0.5 ? 1 : 2;
      const scale = precision === 1 ? 10 : 100;
      const isAdd = Math.random() < 0.5;
      let aInt = randInt(scale, scale * 20);
      let bInt = randInt(scale, scale * 20);
      if (!isAdd && bInt > aInt) {
        [aInt, bInt] = [bInt, aInt];
      }
      const answerInt = isAdd ? aInt + bInt : aInt - bInt;
      const opSymbol = isAdd ? "+" : "−";

      problems.push({
        question: `${(aInt / scale).toFixed(precision)} ${opSymbol} ${(bInt / scale).toFixed(precision)} = ?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && Math.round(val * scale) === answerInt;
        },
        correctAnswerText: (answerInt / scale).toFixed(precision),
      });
    }
    return problems;
  }

  function generateProbabilityProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const favorable = randInt(1, 9);
      const other = randInt(1, 9);
      const total = favorable + other;

      problems.push({
        question:
          lang === "ru"
            ? `В мешке ${favorable} красных шариков и ${other} синих. Если вы наугад достанете один, какова вероятность, что он красный?`
            : `A bag has ${favorable} red marbles and ${other} blue marbles. If you pick one at random, what is the probability it's red?`,
        checkAnswer(raw) {
          const val = parseFractionOrDecimal(raw);
          return Number.isFinite(val) && Math.abs(val - favorable / total) < 0.0051;
        },
        correctAnswerText: `${favorable}/${total}`,
      });
    }
    return problems;
  }

  function generatePerimeterAreaProblems() {
    const problems = [];
    const lang = getLang();
    const SUBTYPES = ["rect-perimeter", "rect-area", "triangle-area"];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const subtype = SUBTYPES[randInt(0, SUBTYPES.length - 1)];

      if (subtype === "rect-perimeter" || subtype === "rect-area") {
        const length = randInt(2, 15);
        const width = randInt(2, 15);
        const answer = subtype === "rect-perimeter" ? 2 * length + 2 * width : length * width;
        const question =
          lang === "ru"
            ? subtype === "rect-perimeter"
              ? `Прямоугольник имеет длину ${length} и ширину ${width}. Найдите его периметр.`
              : `Прямоугольник имеет длину ${length} и ширину ${width}. Найдите его площадь.`
            : subtype === "rect-perimeter"
            ? `A rectangle has length ${length} and width ${width}. Find its perimeter.`
            : `A rectangle has length ${length} and width ${width}. Find its area.`;

        problems.push({
          question,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      } else {
        const height = randInt(1, 8) * 2;
        const base = randInt(2, 15);
        const answer = base * (height / 2);

        problems.push({
          question:
            lang === "ru"
              ? `Треугольник имеет основание ${base} и высоту ${height}. Найдите его площадь.`
              : `A triangle has a base of ${base} and a height of ${height}. Find its area.`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: String(answer),
        });
      }
    }
    return problems;
  }

  function generateMeanMedianModeProblems() {
    const problems = [];
    const lang = document.documentElement.lang === "ru" ? "ru" : "en";
    const LABELS = {
      en: { mean: "mean", median: "median", mode: "mode" },
      ru: { mean: "среднее", median: "медиану", mode: "моду" },
    };
    const QUESTION_TEMPLATE = {
      en: (values, label) => `Data set: ${values.join(", ")}. Find the ${label}.`,
      ru: (values, label) => `Набор данных: ${values.join(", ")}. Найдите ${label}.`,
    };
    const SUBTYPES = ["mean", "median", "mode"];

    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const subtype = SUBTYPES[randInt(0, SUBTYPES.length - 1)];
      let values, answer;

      if (subtype === "mean") {
        const m = randInt(50, 100);
        const d1 = randInt(-10, 10);
        const d2 = randInt(-10, 10);
        const d3 = randInt(-10, 10);
        const d4 = randInt(-10, 10);
        const d5 = -(d1 + d2 + d3 + d4);
        values = [m + d1, m + d2, m + d3, m + d4, m + d5];
        answer = m;
      } else if (subtype === "median") {
        values = [randInt(1, 50), randInt(1, 50), randInt(1, 50), randInt(1, 50), randInt(1, 50)];
        answer = values.slice().sort((a, b) => a - b)[2];
      } else {
        const modeVal = randInt(1, 50);
        const others = [];
        while (others.length < 3) {
          const candidate = randInt(1, 50);
          if (candidate !== modeVal && !others.includes(candidate)) {
            others.push(candidate);
          }
        }
        values = [modeVal, modeVal, others[0], others[1], others[2]];
        for (let j = values.length - 1; j > 0; j--) {
          const k = randInt(0, j);
          [values[j], values[k]] = [values[k], values[j]];
        }
        answer = modeVal;
      }

      problems.push({
        question: QUESTION_TEMPLATE[lang](values, LABELS[lang][subtype]),
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateLikeTermsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      const c = randInt(1, 9);
      const d = randInt(1, 9);
      const sumX = a + c;
      const sumY = b + d;

      problems.push({
        question: `${a}x + ${b}y + ${c}x + ${d}y = ?`,
        checkAnswer(raw) {
          const text = String(raw).trim().replace(/\s+/g, "");
          const xMatch = text.match(/([+-]?\d*)x/i);
          const yMatch = text.match(/([+-]?\d*)y/i);
          if (!xMatch || !yMatch) return false;
          const parseCoef = (s) => {
            if (s === "" || s === "+") return 1;
            if (s === "-") return -1;
            return Number(s);
          };
          const xCoef = parseCoef(xMatch[1]);
          const yCoef = parseCoef(yMatch[1]);
          return Number.isFinite(xCoef) && Number.isFinite(yCoef) && xCoef === sumX && yCoef === sumY;
        },
        correctAnswerText: `${sumX}x + ${sumY}y`,
      });
    }
    return problems;
  }

  function generateCoordinatePlaneProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const x = randInt(-10, 10);
      const y = randInt(-10, 10);
      const xSteps = Math.abs(x);
      const ySteps = Math.abs(y);
      const xDirWord = lang === "ru" ? (x >= 0 ? "вправо" : "влево") : x >= 0 ? "right" : "left";
      const yDirWord = lang === "ru" ? (y >= 0 ? "вверх" : "вниз") : y >= 0 ? "up" : "down";

      problems.push({
        question:
          lang === "ru"
            ? `Точка сдвинута от начала координат на ${xSteps} (${xDirWord}) по оси x и на ${ySteps} (${yDirWord}) по оси y. Найдите её координаты (x, y).`
            : `A point is ${xSteps} steps ${xDirWord} and ${ySteps} steps ${yDirWord} from the origin. What are its coordinates (x, y)?`,
        checkAnswer(raw) {
          const parts = String(raw).trim().split(",").map((p) => Number(p.trim()));
          if (parts.length !== 2 || parts.some((p) => !Number.isFinite(p))) return false;
          return parts[0] === x && parts[1] === y;
        },
        correctAnswerText: `(${x}, ${y})`,
      });
    }
    return problems;
  }

  function generatePolynomialsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const isAdd = Math.random() < 0.5;
      let a1, a2, sumA;
      do {
        a1 = randInt(1, 9);
        a2 = randInt(1, 9);
        sumA = isAdd ? a1 + a2 : a1 - a2;
      } while (sumA === 0);
      const b1 = randInt(-10, 10);
      const b2 = randInt(-10, 10);
      const sumB = isAdd ? b1 + b2 : b1 - b2;
      const b1Text = b1 >= 0 ? `+ ${b1}` : `− ${Math.abs(b1)}`;
      const b2Text = b2 >= 0 ? `+ ${b2}` : `− ${Math.abs(b2)}`;
      const sumBText = sumB >= 0 ? `+ ${sumB}` : `− ${Math.abs(sumB)}`;

      problems.push({
        question: `(${a1}x ${b1Text}) ${isAdd ? "+" : "−"} (${a2}x ${b2Text}) = ?`,
        checkAnswer(raw) {
          const text = String(raw).trim().replace(/\s+/g, "").replace(/−/g, "-");
          const xMatch = text.match(/([+-]?\d*)x/i);
          if (!xMatch) return false;
          const parseCoef = (s) => {
            if (s === "" || s === "+") return 1;
            if (s === "-") return -1;
            return Number(s);
          };
          const xCoef = parseCoef(xMatch[1]);
          if (!Number.isFinite(xCoef) || xCoef !== sumA) return false;
          const rest = (text.slice(0, xMatch.index) + text.slice(xMatch.index + xMatch[0].length)).trim();
          if (rest === "") return sumB === 0;
          const constMatch = rest.match(/^([+-]?\d+)$/);
          if (!constMatch) return false;
          return Number(constMatch[1]) === sumB;
        },
        correctAnswerText: `${sumA}x ${sumBText}`,
      });
    }
    return problems;
  }

  function generateVolumeProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const isBox = Math.random() < 0.5;
      let question, answer;
      if (isBox) {
        const l = randInt(2, 15);
        const w = randInt(2, 15);
        const h = randInt(2, 15);
        answer = l * w * h;
        question =
          lang === "ru"
            ? `Прямоугольный параллелепипед имеет длину ${l}, ширину ${w} и высоту ${h}. Найдите его объём.`
            : `A box has length ${l}, width ${w}, and height ${h}. Find its volume.`;
      } else {
        const side = randInt(2, 12);
        answer = side * side * side;
        question =
          lang === "ru"
            ? `Куб имеет длину стороны ${side}. Найдите его объём.`
            : `A cube has a side length of ${side}. Find its volume.`;
      }

      problems.push({
        question,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateScientificNotationProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const d1 = randInt(1, 9);
      const d2 = randInt(0, 9);
      const mantissa = d1 + d2 / 10;
      const n = randInt(3, 9);
      const number = Math.round(mantissa * Math.pow(10, n));
      const isNumberToNotation = Math.random() < 0.5;

      if (isNumberToNotation) {
        problems.push({
          question:
            lang === "ru" ? `Запишите ${number} в научной нотации.` : `Write ${number} in scientific notation.`,
          checkAnswer(raw) {
            const text = String(raw).trim().replace(/\s+/g, "").toLowerCase();
            let m = NaN;
            let exp = NaN;
            let match = text.match(/^(-?\d+(?:\.\d+)?)e(-?\d+)$/);
            if (match) {
              m = Number(match[1]);
              exp = Number(match[2]);
            } else {
              match = text.match(/^(-?\d+(?:\.\d+)?)[×x*]10\^?(-?\d+)$/);
              if (match) {
                m = Number(match[1]);
                exp = Number(match[2]);
              }
            }
            if (!Number.isFinite(m) || !Number.isFinite(exp)) return false;
            return Math.abs(m - mantissa) < 1e-9 && exp === n;
          },
          correctAnswerText: `${mantissa} × 10^${n}`,
        });
      } else {
        problems.push({
          question:
            lang === "ru"
              ? `Запишите ${mantissa} × 10^${n} обычным числом.`
              : `Write ${mantissa} × 10^${n} as a plain number.`,
          checkAnswer(raw) {
            const val = Number(String(raw).trim());
            return Number.isFinite(val) && val === number;
          },
          correctAnswerText: String(number),
        });
      }
    }
    return problems;
  }

  function generateRoundingProblems() {
    const problems = [];
    const lang = getLang();
    const PLACES = [10, 100, 1000];
    const PHRASE_EN = { 10: "to the nearest ten", 100: "to the nearest hundred", 1000: "to the nearest thousand" };
    const PHRASE_RU = {
      10: "до ближайшего десятка",
      100: "до ближайшей сотни",
      1000: "до ближайшей тысячи",
    };
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const place = PLACES[randInt(0, PLACES.length - 1)];
      const n = randInt(place * 2, place * 97);
      const answer = Math.round(n / place) * place;

      problems.push({
        question:
          lang === "ru" ? `Округлите ${n} ${PHRASE_RU[place]}.` : `Round ${n} ${PHRASE_EN[place]}.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generatePrimeFactorizationProblems() {
    const problems = [];
    const PRIME_POOL = [2, 3, 5, 7];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const count = randInt(2, 3);
      const factors = [];
      let n = 1;
      for (let k = 0; k < count; k++) {
        const p = PRIME_POOL[randInt(0, PRIME_POOL.length - 1)];
        factors.push(p);
        n *= p;
      }
      factors.sort((a, b) => a - b);

      problems.push({
        question: `${n} = ?`,
        checkAnswer(raw) {
          const text = String(raw).trim();
          if (!text) return false;
          const parts = text
            .split(/[×x*]/i)
            .map((s) => Number(s.trim()))
            .filter((v) => Number.isFinite(v));
          if (parts.length !== factors.length) return false;
          const sorted = [...parts].sort((a, b) => a - b);
          return sorted.every((v, idx) => v === factors[idx]);
        },
        correctAnswerText: factors.join("×"),
      });
    }
    return problems;
  }

  function generateMultiplyingFractionsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const d1 = randInt(2, 9);
      const n1 = randInt(1, d1 - 1);
      const d2 = randInt(2, 9);
      const n2 = randInt(1, d2 - 1);

      if (Math.random() < 0.5) {
        // Type 1: multiply fractions.
        const num = n1 * n2;
        const den = d1 * d2;
        const g = gcd(num, den);
        const sn = num / g;
        const sd = den / g;

        problems.push({
          question: `${n1}/${d1} × ${n2}/${d2} = ?`,
          checkAnswer: fractionCheckAnswer(sn, sd),
          correctAnswerText: fractionAnswerText(sn, sd),
        });
      } else {
        // Type 2: divide fractions.
        const num = n1 * d2;
        const den = d1 * n2;
        const g = gcd(num, den);
        const sn = num / g;
        const sd = den / g;

        problems.push({
          question: `${n1}/${d1} ÷ ${n2}/${d2} = ?`,
          checkAnswer: fractionCheckAnswer(sn, sd),
          correctAnswerText: fractionAnswerText(sn, sd),
        });
      }
    }
    return problems;
  }

  function generateUnitRateProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const rate = randInt(2, 20) * 500;
      const units = randInt(2, 9);
      const total = rate * units;

      problems.push({
        question:
          lang === "ru"
            ? `${units} кг стоят ${total} сум. Сколько стоит 1 кг?`
            : `${units} kg cost ${total} so'm. What is the price per kg?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === rate;
        },
        correctAnswerText: String(rate),
      });
    }
    return problems;
  }

  function yearsLabelRu(years) {
    if (years === 1) return "год";
    if (years >= 2 && years <= 4) return "года";
    return "лет";
  }

  function generateSimpleInterestProblems() {
    const problems = [];
    const lang = getLang();
    const RATES = [2, 4, 5, 10, 20];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const rate = RATES[randInt(0, RATES.length - 1)];
      const m = 100 / rate;
      const k = randInt(1, 15);
      const principal = k * m * 1000;
      const years = randInt(1, 5);
      const interest = k * 1000 * years;

      problems.push({
        question:
          lang === "ru"
            ? `Вклад ${principal} сум под ${rate}% простых годовых на ${years} ${yearsLabelRu(years)}. Сколько процентов будет заработано?`
            : `${principal} so'm invested at ${rate}% simple interest for ${years} year${years === 1 ? "" : "s"}. How much interest is earned?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === interest;
        },
        correctAnswerText: String(interest),
      });
    }
    return problems;
  }

  function generateSurfaceAreaProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const l = randInt(2, 12);
      const w = randInt(2, 12);
      const h = randInt(2, 12);
      const answer = 2 * (l * w + l * h + w * h);

      problems.push({
        question:
          lang === "ru"
            ? `Прямоугольный параллелепипед: длина ${l}, ширина ${w}, высота ${h}. Найдите площадь поверхности.`
            : `A rectangular prism has length ${l}, width ${w}, and height ${h}. Find its surface area.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateAnglesProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      if (Math.random() < 0.5) {
        // Type 1: complementary or supplementary angle.
        const total = Math.random() < 0.5 ? 90 : 180;
        const a = randInt(10, total - 10);
        const answer = total - a;
        const kindEn = total === 90 ? "complementary" : "supplementary";
        const kindRu = total === 90 ? "дополнительные" : "смежные";

        problems.push({
          question:
            lang === "ru"
              ? `Два угла — ${kindRu}, один из них ${a}°. Чему равен другой?`
              : `Two angles are ${kindEn}, one measures ${a}°. What is the other?`,
          checkAnswer(raw) {
            const val = Number(String(raw).replace("°", "").trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: `${answer}°`,
        });
      } else {
        // Type 2: triangle angle sum.
        let a, b;
        do {
          a = randInt(20, 120);
          b = randInt(20, 120);
        } while (a + b >= 170);
        const answer = 180 - a - b;

        problems.push({
          question:
            lang === "ru"
              ? `В треугольнике два угла равны ${a}° и ${b}°. Чему равен третий угол?`
              : `A triangle has two angles of ${a}° and ${b}°. What is the third angle?`,
          checkAnswer(raw) {
            const val = Number(String(raw).replace("°", "").trim());
            return Number.isFinite(val) && val === answer;
          },
          correctAnswerText: `${answer}°`,
        });
      }
    }
    return problems;
  }

  function generateFoilProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = nonZeroRandInt(-9, 9);
      const b = nonZeroRandInt(-9, 9);
      const bCoef = a + b;
      const c = a * b;
      const aText = a >= 0 ? `+ ${a}` : `− ${Math.abs(a)}`;
      const bText = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
      const absBCoef = Math.abs(bCoef);
      const bCoefText = bCoef === 0 ? "" : bCoef > 0 ? `+ ${absBCoef === 1 ? "" : absBCoef}x` : `− ${absBCoef === 1 ? "" : absBCoef}x`;
      const cText = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;

      problems.push({
        question: `(x ${aText})(x ${bText}) = ?`,
        checkAnswer(raw) {
          const parts = String(raw)
            .split(",")
            .map((s) => Number(s.trim()));
          if (parts.length !== 2) return false;
          const [p1, p2] = parts;
          return Number.isFinite(p1) && Number.isFinite(p2) && p1 === bCoef && p2 === c;
        },
        correctAnswerText: bCoefText ? `x² ${bCoefText} ${cText}` : `x² ${cText}`,
      });
    }
    return problems;
  }

  function generateDistanceFormulaProblems() {
    const problems = [];
    const lang = getLang();
    const TRIPLES = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [9, 12, 15],
    ];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const [legA, legB, hyp] = TRIPLES[randInt(0, TRIPLES.length - 1)];
      const swap = Math.random() < 0.5;
      const dx = swap ? legB : legA;
      const dy = swap ? legA : legB;
      const x1 = randInt(-6, 6);
      const y1 = randInt(-6, 6);
      const x2 = x1 + (Math.random() < 0.5 ? dx : -dx);
      const y2 = y1 + (Math.random() < 0.5 ? dy : -dy);

      problems.push({
        question:
          lang === "ru"
            ? `Найдите расстояние между точками (${x1}, ${y1}) и (${x2}, ${y2}).`
            : `Find the distance between (${x1}, ${y1}) and (${x2}, ${y2}).`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === hyp;
        },
        correctAnswerText: String(hyp),
      });
    }
    return problems;
  }

  function generateTrigonometryProblems() {
    const problems = [];
    const lang = getLang();
    const TRIPLES = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [9, 12, 15],
    ];
    const RATIOS = ["sin", "cos", "tan"];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const [opp, adj, hyp] = TRIPLES[randInt(0, TRIPLES.length - 1)];
      const ratio = RATIOS[randInt(0, RATIOS.length - 1)];
      let num, den, labelEn, labelRu;
      if (ratio === "sin") {
        num = opp;
        den = hyp;
        labelEn = "sine";
        labelRu = "синус";
      } else if (ratio === "cos") {
        num = adj;
        den = hyp;
        labelEn = "cosine";
        labelRu = "косинус";
      } else {
        num = opp;
        den = adj;
        labelEn = "tangent";
        labelRu = "тангенс";
      }
      const g = gcd(num, den);
      const sn = num / g;
      const sd = den / g;

      problems.push({
        question:
          lang === "ru"
            ? `В прямоугольном треугольнике противолежащий катет = ${opp}, прилежащий катет = ${adj}, гипотенуза = ${hyp}. Найдите ${labelRu} угла.`
            : `In a right triangle, opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${hyp}. Find the ${labelEn} of the angle.`,
        checkAnswer: fractionCheckAnswer(sn, sd),
        correctAnswerText: fractionAnswerText(sn, sd),
      });
    }
    return problems;
  }

  function generateLongDivisionProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const divisor = randInt(2, 9);
      const quotient = randInt(11, 99);
      const dividend = divisor * quotient;

      problems.push({
        question: `${dividend} ÷ ${divisor} = ?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === quotient;
        },
        correctAnswerText: String(quotient),
      });
    }
    return problems;
  }

  function generateDivisibilityRulesProblems() {
    const problems = [];
    const lang = getLang();
    const DIVISORS = [2, 3, 5, 9, 10];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const divisor = DIVISORS[randInt(0, DIVISORS.length - 1)];
      const n = randInt(100, 999);
      const answer = n % divisor === 0;

      problems.push({
        question: lang === "ru" ? `Делится ли ${n} на ${divisor}?` : `Is ${n} divisible by ${divisor}?`,
        checkAnswer(raw) {
          const text = String(raw).trim().toLowerCase();
          const yesValues = ["yes", "y", "true", "да", "д"];
          const noValues = ["no", "n", "false", "нет", "н"];
          if (yesValues.includes(text)) return answer === true;
          if (noValues.includes(text)) return answer === false;
          return false;
        },
        correctAnswerText: answer ? (lang === "ru" ? "да" : "yes") : lang === "ru" ? "нет" : "no",
      });
    }
    return problems;
  }

  function generateComparingFractionsDecimalsProblems() {
    const problems = [];
    const lang = getLang();
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const d = randInt(2, 10);
      const n = randInt(1, d - 1);
      const fracValue = n / d;
      const decTenths = randInt(1, 9);
      const decValue = decTenths / 10;
      const decText = lang === "ru" ? `0,${decTenths}` : `0.${decTenths}`;

      let answer;
      if (Math.abs(fracValue - decValue) < 1e-9) answer = "=";
      else if (fracValue > decValue) answer = ">";
      else answer = "<";

      problems.push({
        question: `${n}/${d}   ?   ${decText}`,
        questionHtml: `${fracHtml(n, d)} &nbsp;&nbsp;?&nbsp;&nbsp; ${decText}`,
        checkAnswer(raw) {
          return String(raw).trim() === answer;
        },
        correctAnswerText: answer,
      });
    }
    return problems;
  }

  function generateFractionDecimalPercentProblems() {
    const problems = [];
    const lang = getLang();
    const DENOMS = [2, 4, 5, 10, 20, 25, 50];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const d = DENOMS[randInt(0, DENOMS.length - 1)];
      const n = randInt(1, d - 1);
      const decimal = n / d;
      const percent = Math.round(decimal * 100);

      problems.push({
        question:
          lang === "ru"
            ? `Переведите ${n}/${d} в десятичную дробь и в проценты.`
            : `Convert ${n}/${d} to a decimal and a percentage.`,
        questionHtml:
          (lang === "ru" ? `Переведите ` : `Convert `) +
          fracHtml(n, d) +
          (lang === "ru" ? ` в десятичную дробь и в проценты.` : ` to a decimal and a percentage.`),
        checkAnswer(raw) {
          const parts = String(raw)
            .split(",")
            .map((s) => s.trim());
          if (parts.length !== 2) return false;
          const decVal = Number(parts[0]);
          const pctVal = Number(parts[1]);
          return (
            Number.isFinite(decVal) &&
            Number.isFinite(pctVal) &&
            Math.abs(decVal - decimal) < 1e-9 &&
            pctVal === percent
          );
        },
        correctAnswerText: `${decimal} = ${percent}%`,
      });
    }
    return problems;
  }

  function generateUnitConversionProblems() {
    const problems = [];
    const lang = getLang();
    const UNIT_PAIRS = [
      { small: "mm", large: "cm", factor: 10, smallRu: "мм", largeRu: "см" },
      { small: "cm", large: "m", factor: 100, smallRu: "см", largeRu: "м" },
      { small: "m", large: "km", factor: 1000, smallRu: "м", largeRu: "км" },
      { small: "mg", large: "g", factor: 1000, smallRu: "мг", largeRu: "г" },
      { small: "g", large: "kg", factor: 1000, smallRu: "г", largeRu: "кг" },
      { small: "ml", large: "l", factor: 1000, smallRu: "мл", largeRu: "л" },
    ];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const unit = UNIT_PAIRS[randInt(0, UNIT_PAIRS.length - 1)];
      const toLarge = Math.random() < 0.5;
      let value, answer, fromUnit, toUnit, fromUnitRu, toUnitRu;

      if (toLarge) {
        value = randInt(1, 9999);
        answer = value / unit.factor;
        fromUnit = unit.small;
        toUnit = unit.large;
        fromUnitRu = unit.smallRu;
        toUnitRu = unit.largeRu;
      } else {
        const kTenths = randInt(1, 999);
        value = kTenths / 10;
        answer = (kTenths * unit.factor) / 10;
        fromUnit = unit.large;
        toUnit = unit.small;
        fromUnitRu = unit.largeRu;
        toUnitRu = unit.smallRu;
      }

      problems.push({
        question:
          lang === "ru"
            ? `Переведите ${String(value).replace(".", ",")} ${fromUnitRu} в ${toUnitRu}.`
            : `Convert ${value} ${fromUnit} to ${toUnit}.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && Math.abs(val - answer) < 0.0001;
        },
        correctAnswerText:
          lang === "ru" ? `${String(answer).replace(".", ",")} ${toUnitRu}` : `${answer} ${toUnit}`,
      });
    }
    return problems;
  }

  const GENERATORS = {
    arithmetic: generateArithmeticProblems,
    "negative-numbers": generateNegativeNumbersProblems,
    "order-of-operations": generateOrderOfOperationsProblems,
    fractions: generateFractionsProblems,
    decimals: generateDecimalsProblems,
    gcf: generateGcfProblems,
    lcm: generateLcmProblems,
    percentages: generatePercentagesProblems,
    ratios: generateRatiosProblems,
    probability: generateProbabilityProblems,
    average: generateAverageProblems,
    "mean-median-mode": generateMeanMedianModeProblems,
    "like-terms": generateLikeTermsProblems,
    algebra: generateAlgebraProblems,
    inequalities: generateInequalitiesProblems,
    "coordinate-plane": generateCoordinatePlaneProblems,
    functions: generateFunctionsProblems,
    systems: generateSystemsProblems,
    slope: generateSlopeProblems,
    quadratic: generateQuadraticProblems,
    polynomials: generatePolynomialsProblems,
    parabola: generateParabolaProblems,
    "perimeter-area": generatePerimeterAreaProblems,
    volume: generateVolumeProblems,
    pythagorean: generatePythagoreanProblems,
    circles: generateCirclesProblems,
    "scientific-notation": generateScientificNotationProblems,
    exponents: generateExponentsProblems,
    "square-roots": generateSquareRootsProblems,
    "absolute-value": generateAbsoluteValueProblems,
    rounding: generateRoundingProblems,
    "prime-factorization": generatePrimeFactorizationProblems,
    "multiplying-fractions": generateMultiplyingFractionsProblems,
    "unit-rate": generateUnitRateProblems,
    "simple-interest": generateSimpleInterestProblems,
    "surface-area": generateSurfaceAreaProblems,
    angles: generateAnglesProblems,
    foil: generateFoilProblems,
    "distance-formula": generateDistanceFormulaProblems,
    trigonometry: generateTrigonometryProblems,
    "long-division": generateLongDivisionProblems,
    "divisibility-rules": generateDivisibilityRulesProblems,
    "comparing-fractions-decimals": generateComparingFractionsDecimalsProblems,
    "fraction-decimal-percent": generateFractionDecimalPercentProblems,
    "unit-conversion": generateUnitConversionProblems,
  };

  // ---------- UI string localization ----------
  // Every page is server-rendered in one language already (e.g. the "New
  // Problems" button label comes from the HTML template), so this only
  // covers strings this script generates dynamically at runtime.

  const STRINGS = {
    en: {
      check: "Check",
      placeholder: "answer",
      correct: "Correct!",
      wrong: (answer) => `Not quite. Answer: ${answer}`,
      score: (correct, total) => `Score: ${correct} / ${total}`,
    },
    ru: {
      check: "Проверить",
      placeholder: "ответ",
      correct: "Верно!",
      wrong: (answer) => `Неверно. Ответ: ${answer}`,
      score: (correct, total) => `Счёт: ${correct} / ${total}`,
    },
  };

  // ---------- init ----------

  document.addEventListener("DOMContentLoaded", () => {
    const topic = document.body.dataset.topic;
    const generateProblems = GENERATORS[topic];
    if (!generateProblems) return; // home page or unknown topic: nothing to wire up

    const lang = document.documentElement.lang === "ru" ? "ru" : "en";
    const strings = STRINGS[lang];

    const section = document.querySelector(`[data-practice="${topic}"]`);
    const list = section.querySelector(".problem-list");
    const scoreEl = section.querySelector(".score");
    const generateBtn = document.querySelector(`.generate-btn[data-topic="${topic}"]`);

    let score = { correct: 0, total: 0 };

    function updateScoreDisplay() {
      scoreEl.textContent = score.total > 0 ? strings.score(score.correct, score.total) : "";
    }

    function renderProblems() {
      list.innerHTML = "";
      const problems = generateProblems();
      score = { correct: 0, total: 0 };
      updateScoreDisplay();

      problems.forEach((problem) => {
        const row = document.createElement("div");
        row.className = "problem";

        const questionEl = document.createElement("span");
        questionEl.className = "problem-question";
        if (problem.questionHtml) {
          questionEl.innerHTML = problem.questionHtml;
        } else {
          questionEl.textContent = problem.question;
        }

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = strings.placeholder;
        input.autocomplete = "off";

        const checkBtn = document.createElement("button");
        checkBtn.className = "check-btn";
        checkBtn.textContent = strings.check;

        const feedback = document.createElement("span");
        feedback.className = "feedback";

        function submit() {
          if (checkBtn.disabled) return;
          const isCorrect = problem.checkAnswer(input.value);

          score.total += 1;
          if (isCorrect) {
            score.correct += 1;
            feedback.textContent = strings.correct;
            feedback.className = "feedback correct";
            row.classList.add("correct");
          } else {
            if (problem.correctAnswerHtml) {
              feedback.innerHTML = strings.wrong(problem.correctAnswerHtml);
            } else {
              feedback.textContent = strings.wrong(problem.correctAnswerText);
            }
            feedback.className = "feedback wrong";
            row.classList.add("wrong");
          }

          input.disabled = true;
          checkBtn.disabled = true;
          updateScoreDisplay();
        }

        checkBtn.addEventListener("click", submit);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") submit();
        });

        row.appendChild(questionEl);
        row.appendChild(input);
        row.appendChild(checkBtn);
        row.appendChild(feedback);
        list.appendChild(row);
      });
    }

    generateBtn.addEventListener("click", renderProblems);
    renderProblems();
  });

  // ---------- slideshow explanations ----------

  function initSlideshow(container) {
    const slides = Array.from(container.querySelectorAll(":scope > .slide"));
    const dots = Array.from(container.querySelectorAll(".dot"));
    const prevBtn = container.querySelector(".slide-prev");
    const nextBtn = container.querySelector(".slide-next");
    let current = 0;

    function render() {
      slides.forEach((s, i) => s.classList.toggle("active", i === current));
      dots.forEach((d, i) => d.classList.toggle("active", i === current));
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
    }

    prevBtn.addEventListener("click", () => {
      if (current > 0) {
        current -= 1;
        render();
      }
    });
    nextBtn.addEventListener("click", () => {
      if (current < slides.length - 1) {
        current += 1;
        render();
      }
    });
    dots.forEach((d, i) => {
      d.addEventListener("click", () => {
        current = i;
        render();
      });
    });

    container.addEventListener("keydown", (e) => {
      if (container.classList.contains("text-mode")) return;
      if (e.key === "ArrowRight") nextBtn.click();
      if (e.key === "ArrowLeft") prevBtn.click();
    });

    render();
  }

  function initViewToggle(block) {
    const toggleBtns = Array.from(block.querySelectorAll(".view-toggle-btn"));
    const slideshow = block.querySelector("[data-slideshow]");
    if (!toggleBtns.length || !slideshow) return;

    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        slideshow.classList.toggle("text-mode", btn.dataset.view === "text");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".explanation-block").forEach((block) => {
      initViewToggle(block);
      const slideshow = block.querySelector("[data-slideshow]");
      if (slideshow) {
        slideshow.setAttribute("tabindex", "0");
        initSlideshow(slideshow);
      }
    });
  });
})();

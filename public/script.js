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

  function generateFractionsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
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
        checkAnswer(raw) {
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
        },
        correctAnswerText: correctDen === 1 ? String(correctNum) : `${correctNum}/${correctDen}`,
      });
    }
    return problems;
  }

  function generateAlgebraProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(2, 9);
      const x = randInt(1, 12);
      const b = randInt(-10, 10);
      const c = a * x + b;
      const bText = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;

      problems.push({
        question: `Solve for x: ${a}x ${bText} = ${c}`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === x;
        },
        correctAnswerText: String(x),
      });
    }
    return problems;
  }

  function generateFunctionsProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = nonZeroRandInt(-6, 6);
      const b = randInt(-10, 10);
      const x = randInt(-8, 8);
      const answer = a * x + b;
      const bText = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;

      problems.push({
        question: `f(x) = ${a}x ${bText}. Find f(${x}).`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateQuadraticProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const r1 = randInt(-8, 8);
      const r2 = randInt(-8, 8);
      const b = -(r1 + r2);
      const c = r1 * r2;
      const bText = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
      const cText = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
      const correctSorted = [r1, r2].sort((x, y) => x - y);

      problems.push({
        question: `x² ${bText} ${cText} = 0. Find x.`,
        checkAnswer(raw) {
          const parts = String(raw).trim().split(",").map((p) => Number(p.trim()));
          if (parts.length !== 2 || parts.some((p) => !Number.isFinite(p))) return false;
          const sorted = parts.sort((x, y) => x - y);
          return sorted[0] === correctSorted[0] && sorted[1] === correctSorted[1];
        },
        correctAnswerText: correctSorted.join(", "),
      });
    }
    return problems;
  }

  function generateParabolaProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = nonZeroRandInt(-3, 3);
      const vertexX = randInt(-6, 6);
      const b = -2 * a * vertexX;
      const c = randInt(-10, 10);
      const bText = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
      const cText = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;

      problems.push({
        question: `For y = ${a}x² ${bText} ${cText}, what is the x-coordinate of the vertex?`,
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
    const PERCENTS = [5, 10, 20, 25, 50];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const p = PERCENTS[randInt(0, PERCENTS.length - 1)];
      const m = 100 / p;
      const k = randInt(1, 15);
      const n = k * m;

      problems.push({
        question: `Find ${p}% of ${n}.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === k;
        },
        correctAnswerText: String(k),
      });
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
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
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
    }
    return problems;
  }

  function generateNegativeNumbersProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
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
    }
    return problems;
  }

  function generateGcfProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(6, 60);
      const b = randInt(6, 60);
      const answer = gcd(a, b);

      problems.push({
        question: `GCF(${a}, ${b}) = ?`,
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
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      const answer = (a * b) / gcd(a, b);

      problems.push({
        question: `LCM(${a}, ${b}) = ?`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === answer;
        },
        correctAnswerText: String(answer),
      });
    }
    return problems;
  }

  function generateAverageProblems() {
    const problems = [];
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const k = randInt(10, 30);
      const d1 = randInt(-5, 5);
      const d2 = randInt(-5, 5);
      const d3 = -(d1 + d2);
      const n1 = k + d1;
      const n2 = k + d2;
      const n3 = k + d3;

      problems.push({
        question: `Find the average (mean) of ${n1}, ${n2}, ${n3}.`,
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
    for (let i = 0; i < PROBLEMS_PER_ROUND; i++) {
      const x1 = randInt(-8, 8);
      const y1 = randInt(-8, 8);
      const run = randInt(1, 6);
      const x2 = x1 + run;
      const m = nonZeroRandInt(-6, 6);
      const y2 = y1 + m * run;

      problems.push({
        question: `Points (${x1}, ${y1}) and (${x2}, ${y2}). Find the slope.`,
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
      const legs = Math.random() < 0.5 ? [triple[0] * k, triple[1] * k] : [triple[1] * k, triple[0] * k];
      const c = triple[2] * k;

      problems.push({
        question: `A right triangle has legs ${legs[0]} and ${legs[1]}. Find the hypotenuse c.`,
        checkAnswer(raw) {
          const val = Number(String(raw).trim());
          return Number.isFinite(val) && val === c;
        },
        correctAnswerText: String(c),
      });
    }
    return problems;
  }

  const GENERATORS = {
    arithmetic: generateArithmeticProblems,
    "negative-numbers": generateNegativeNumbersProblems,
    "order-of-operations": generateOrderOfOperationsProblems,
    fractions: generateFractionsProblems,
    gcf: generateGcfProblems,
    lcm: generateLcmProblems,
    percentages: generatePercentagesProblems,
    average: generateAverageProblems,
    algebra: generateAlgebraProblems,
    functions: generateFunctionsProblems,
    slope: generateSlopeProblems,
    quadratic: generateQuadraticProblems,
    parabola: generateParabolaProblems,
    pythagorean: generatePythagoreanProblems,
    exponents: generateExponentsProblems,
    "square-roots": generateSquareRootsProblems,
    "absolute-value": generateAbsoluteValueProblems,
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
        questionEl.textContent = problem.question;

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
            feedback.textContent = strings.wrong(problem.correctAnswerText);
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
})();

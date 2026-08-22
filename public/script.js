// Math Practice site logic.
// Everything runs client-side: problems are generated randomly,
// answers are checked immediately, and a running score is kept per topic.

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

  const GENERATORS = {
    arithmetic: generateArithmeticProblems,
    fractions: generateFractionsProblems,
    algebra: generateAlgebraProblems,
  };

  // ---------- score tracking ----------

  const scores = {
    arithmetic: { correct: 0, total: 0 },
    fractions: { correct: 0, total: 0 },
    algebra: { correct: 0, total: 0 },
  };

  function updateScoreDisplay(topic) {
    const section = document.getElementById(topic);
    const scoreEl = section.querySelector(".score");
    const { correct, total } = scores[topic];
    scoreEl.textContent = total > 0 ? `Score: ${correct} / ${total}` : "";
  }

  // ---------- rendering ----------

  function renderProblems(topic) {
    const section = document.getElementById(topic);
    const list = section.querySelector(".problem-list");
    list.innerHTML = "";

    const problems = GENERATORS[topic]();
    scores[topic] = { correct: 0, total: 0 };
    updateScoreDisplay(topic);

    problems.forEach((problem) => {
      const row = document.createElement("div");
      row.className = "problem";

      const questionEl = document.createElement("span");
      questionEl.className = "problem-question";
      questionEl.textContent = problem.question;

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "answer";
      input.autocomplete = "off";

      const checkBtn = document.createElement("button");
      checkBtn.className = "check-btn";
      checkBtn.textContent = "Check";

      const feedback = document.createElement("span");
      feedback.className = "feedback";

      function submit() {
        if (checkBtn.disabled) return;
        const isCorrect = problem.checkAnswer(input.value);

        scores[topic].total += 1;
        if (isCorrect) {
          scores[topic].correct += 1;
          feedback.textContent = "Correct!";
          feedback.className = "feedback correct";
          row.classList.add("correct");
        } else {
          feedback.textContent = `Not quite. Answer: ${problem.correctAnswerText}`;
          feedback.className = "feedback wrong";
          row.classList.add("wrong");
        }

        input.disabled = true;
        checkBtn.disabled = true;
        updateScoreDisplay(topic);
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

  // ---------- tab switching ----------

  function activateTab(topic) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.topic === topic);
    });
    document.querySelectorAll(".topic").forEach((section) => {
      section.classList.toggle("active", section.id === topic);
    });
  }

  // ---------- init ----------

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => activateTab(btn.dataset.topic));
    });

    document.querySelectorAll(".generate-btn").forEach((btn) => {
      btn.addEventListener("click", () => renderProblems(btn.dataset.topic));
    });

    // Generate an initial round of problems for every topic so the
    // practice section isn't empty on first load.
    Object.keys(GENERATORS).forEach(renderProblems);
  });
})();

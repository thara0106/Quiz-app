/* ========= FULL QUIZ APP LOGIC ========= */

/* ---------- Questions (add more here) ---------- */
const questions = [
  {
    question: "Which language runs in a web browser?",
    options: ["Java", "C", "Python", "JavaScript"],
    answer: 3,
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Central Style Sheets",
      "Cascading Style Sheets",
      "Cascading Simple Sheets",
      "Cars SUVs Sailboats",
    ],
    answer: 1,
  },
  {
    question: "What does HTML stand for?",
    options: [
      "Hypertext Markup Language",
      "Hypertext Markdown Language",
      "Hyperloop Machine Language",
      "Helicopters Terminals Motorboats Lamborghinis",
    ],
    answer: 0,
  },
];

/* ---------- DOM References ---------- */
const navHome = document.getElementById("navHome");
const navLogin = document.getElementById("navLogin");
const navQuiz = document.getElementById("navQuiz");
const navResult = document.getElementById("navResult");
const hamburger = document.getElementById("navHamburger");

const homeSection = document.getElementById("homeSection");
const loginSection = document.getElementById("loginSection");
const quizSection = document.getElementById("quizSection");
const resultSection = document.getElementById("resultSection");

const btnGoLogin = document.getElementById("btnGoLogin");
const btnLogin = document.getElementById("btnLogin");
const btnBackHome = document.getElementById("btnBackHome");

const inputName = document.getElementById("inputName");
const userDisplay = document.getElementById("userDisplay");

const questionText = document.getElementById("questionText");
const optionsDiv = document.getElementById("options");
const progressText = document.getElementById("progress");

const timeLeftEl = document.getElementById("timeLeft");

const btnRestart = document.getElementById("btnRestart");
const btnHome = document.getElementById("btnHome");
const btnDownloadCert = document.getElementById("btnDownloadCert");

const scoreText = document.getElementById("scoreText");
const percentageText = document.getElementById("percentageText");

const historyList = document.getElementById("historyList");

const certificateTemplate = document.getElementById("certificateTemplate");
const certNameEl = document.getElementById("certName");
const certScoreEl = document.getElementById("certScore");
const certDateEl = document.getElementById("certDate");

/* ---------- State ---------- */
let username = "";
let qIndex = 0;
let score = 0;
let timerId = null;
let timeLeft = 30;

/* ---------- Navigation ---------- */
function showSection(section) {
  [homeSection, loginSection, quizSection, resultSection].forEach((s) =>
    s.classList.remove("active")
  );
  section.classList.add("active");
}

navHome.addEventListener("click", () => showSection(homeSection));
navLogin.addEventListener("click", () => showSection(loginSection));
navQuiz.addEventListener("click", () => showSection(quizSection));
navResult.addEventListener("click", () => showSection(resultSection));
btnGoLogin.addEventListener("click", () => showSection(loginSection));
btnBackHome.addEventListener("click", () => showSection(homeSection));
hamburger.addEventListener("click", () => {
  const links = document.querySelector(".nav-links");
  if (links.style.display === "flex") links.style.display = "none";
  else links.style.display = "flex";
});

/* ---------- Login / Start ---------- */
btnLogin.addEventListener("click", () => {
  const name = inputName.value.trim();
  if (!name) {
    alert("Please enter your name");
    return;
  }
  username = name;
  startQuiz();
});

/* ---------- Quiz Flow ---------- */
function startQuiz() {
  qIndex = 0;
  score = 0;
  userDisplay.innerText = `User: ${username}`;
  inputName.value = username;
  showSection(quizSection);
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timerId);
  timeLeft = 30;
  timeLeftEl.innerText = timeLeft;

  const q = questions[qIndex];
  questionText.innerText = `${qIndex + 1}. ${q.question}`;
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = opt;
    btn.onclick = () => selectAnswer(i, btn);
    optionsDiv.appendChild(btn);
  });

  progressText.innerText = `Question ${qIndex + 1} of ${questions.length}`;

  timerId = setInterval(() => {
    timeLeft--;
    timeLeftEl.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      revealAndNext(null);
    }
  }, 1000);
}

function selectAnswer(selectedIndex, btnEl) {
  clearInterval(timerId);
  revealAndNext(selectedIndex, btnEl);
}

function revealAndNext(selectedIndex, btnEl) {
  const correctIndex = questions[qIndex].answer;
  const optionButtons = document.querySelectorAll(".option-btn");

  optionButtons.forEach((b, idx) => {
    b.disabled = true;
    if (idx === correctIndex) b.classList.add("correct");
    else b.classList.add("wrong");
  });

  if (selectedIndex === correctIndex) score++;

  setTimeout(() => {
    qIndex++;
    if (qIndex < questions.length) loadQuestion();
    else finishQuiz();
  }, 900);
}

/* ---------- Finish & History ---------- */
function finishQuiz() {
  clearInterval(timerId);
  showSection(resultSection);

  const total = questions.length;
  scoreText.innerText = `${username}, your score: ${score} / ${total}`;
  const pct = (score / total) * 100;
  percentageText.innerText = `Percentage: ${pct.toFixed(2)}%`;

  // Save to history (localStorage)
  const hist = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  hist.unshift({
    name: username,
    score,
    total,
    date: new Date().toLocaleString(),
  });
  localStorage.setItem("quizHistory", JSON.stringify(hist.slice(0, 20)));

  renderHistory();
}

/* ---------- Render History ---------- */
function renderHistory() {
  const hist = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  historyList.innerHTML = "";
  if (!hist.length) {
    historyList.innerHTML = "<li>No history yet</li>";
    return;
  }
  hist.forEach((item) => {
    const li = document.createElement("li");
    li.innerText = `${item.date} — ${item.name}: ${item.score}/${item.total}`;
    historyList.appendChild(li);
  });
}

/* ---------- Restart / Home ---------- */
btnRestart.addEventListener("click", () => {
  if (!username) return showSection(loginSection);
  startQuiz();
});
btnHome.addEventListener("click", () => showSection(homeSection));

/* ---------- Certificate PDF (html2pdf) ---------- */
btnDownloadCert.addEventListener("click", () => {
  if (!username) {
    alert("No user found");
    return;
  }
  // populate certificate
  certNameEl.innerText = username;
  certScoreEl.innerText = `Score: ${score} / ${questions.length}`;
  certDateEl.innerText = new Date().toLocaleDateString();

  // show template off-screen for capture
  certificateTemplate.style.display = "block";
  certificateTemplate.style.position = "absolute";
  certificateTemplate.style.left = "-9999px";
  certificateTemplate.style.top = "0";

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${username}_certificate.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  // render and save
  html2pdf()
    .set(opt)
    .from(certificateTemplate)
    .save()
    .then(() => {
      certificateTemplate.style.display = "none";
    })
    .catch((err) => {
      alert("Certificate generation failed: " + err);
      certificateTemplate.style.display = "none";
    });
});

/* ---------- Initial ---------- */
window.addEventListener("load", () => {
  // show home
  showSection(homeSection);
  renderHistory();
});

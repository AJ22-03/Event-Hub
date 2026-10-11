/* =============================================================================
   EventHub — quiz.js (Live Event Quiz & Trivia Arena Engine)
   Strictly implements the Quiz SRS specifications:
   - Accept & Validate user input (A, B, C, D)
   - Track running score & percentage
   - Provide immediate feedback (correct / incorrect reveal)
   - Timed quiz questions
   - Display final performance summary & badges
   ============================================================================= */

// Question bank structured as list of dictionaries as required by SRS Page 2
const QUIZ_DATA = {
  tech: [
    {
      question: "Which JavaScript library is open-source, lightweight (~40KB), and requires NO API key or billing setup?",
      options: [
        { key: "A", text: "Google Maps Platform API" },
        { key: "B", text: "Leaflet.js with OpenStreetMap" },
        { key: "C", text: "Mapbox GL Commercial Edition" },
        { key: "D", text: "Apple MapKit JS" }
      ],
      correct: "B",
      explanation: "Leaflet.js is completely open-source, free, and lightweight, making it ideal for event discovery platforms."
    },
    {
      question: "Which HTTP status code is returned by a REST API when a new event registration is successfully created?",
      options: [
        { key: "A", text: "200 OK" },
        { key: "B", text: "201 Created" },
        { key: "C", text: "204 No Content" },
        { key: "D", text: "302 Found" }
      ],
      correct: "B",
      explanation: "HTTP 201 Created specifically denotes that one or more new resources have been produced on the server."
    },
    {
      question: "What web storage technology allows EventHub to persist session tickets even when offline?",
      options: [
        { key: "A", text: "Session Cookies Only" },
        { key: "B", text: "HTML5 Web Storage (localStorage & sessionStorage)" },
        { key: "C", text: "DNS Cache" },
        { key: "D", text: "Web Worker Threads" }
      ],
      correct: "B",
      explanation: "HTML5 localStorage retains JSON strings across browser sessions without expiring automatically."
    },
    {
      question: "In relational database design, which constraint guarantees that each registered ticket code is unique?",
      options: [
        { key: "A", text: "CHECK Constraint" },
        { key: "B", text: "UNIQUE Constraint / Primary Key" },
        { key: "C", text: "FOREIGN KEY Constraint" },
        { key: "D", text: "NOT NULL Constraint" }
      ],
      correct: "B",
      explanation: "The UNIQUE constraint ensures no two records have duplicate values in a column."
    }
  ],
  music: [
    {
      question: "Which famous electronic dance music festival in India was originally founded in Goa?",
      options: [
        { key: "A", text: "Tomorrowland India" },
        { key: "B", text: "Sunburn Festival" },
        { key: "C", text: "Ultra Music Festival" },
        { key: "D", text: "Electric Daisy Carnival" }
      ],
      correct: "B",
      explanation: "Sunburn was inaugurated on Vagator beach, Goa, and grew to become Asia's premier EDM festival."
    },
    {
      question: "Which sound frequency range is typically handled by venue subwoofer speakers during a live concert?",
      options: [
        { key: "A", text: "20 Hz to 200 Hz (Deep Bass)" },
        { key: "B", text: "5,000 Hz to 20,000 Hz (High Treble)" },
        { key: "C", text: "1,000 Hz to 4,000 Hz (Midrange)" },
        { key: "D", text: "Above 22,000 Hz (Ultrasound)" }
      ],
      correct: "A",
      explanation: "Subwoofers reproduce the lowest audio frequencies, typically between 20 Hz and 200 Hz."
    }
  ],
  sports: [
    {
      question: "What is the official world standard distance of an Olympic full marathon?",
      options: [
        { key: "A", text: "21.0975 kilometers (Half Marathon)" },
        { key: "B", text: "42.195 kilometers (26.2 miles)" },
        { key: "C", text: "50.000 kilometers" },
        { key: "D", text: "35.500 kilometers" }
      ],
      correct: "B",
      explanation: "The standard distance is 42.195 km, established at the 1908 Olympic Games in London."
    },
    {
      question: "What is the name of the timing device attached to runner bibs in official marathons?",
      options: [
        { key: "A", text: "Barometric Altometer" },
        { key: "B", text: "RFID Timing Transponder Chip" },
        { key: "C", text: "Infrared Optical Sensor" },
        { key: "D", text: "GPS Beacon" }
      ],
      correct: "B",
      explanation: "RFID chips trigger electronic timing mats at the start, split intervals, and finish line."
    }
  ]
};

let activeQuizCategory = 'tech';
let currentQuestionIndex = 0;
let runningScore = 0;
let selectedOption = null;
let timerInterval = null;
let timeLeft = 20;

document.addEventListener('DOMContentLoaded', () => {
  EventHub.renderNavbar('quiz');
});

function selectCategory(cat) {
  activeQuizCategory = cat;
  document.querySelectorAll('.quiz-cat-card').forEach(card => card.classList.remove('active'));
  document.getElementById(`cat-${cat}`)?.classList.add('active');
}

function startQuiz() {
  currentQuestionIndex = 0;
  runningScore = 0;
  selectedOption = null;

  document.getElementById('quiz-welcome-screen').style.display = 'none';
  document.getElementById('quiz-results-screen').style.display = 'none';
  document.getElementById('quiz-active-screen').style.display = 'block';

  displayQuestion();
}

function displayQuestion() {
  const questions = QUIZ_DATA[activeQuizCategory] || QUIZ_DATA.tech;
  const q = questions[currentQuestionIndex];
  selectedOption = null;

  // Header Counters
  document.getElementById('question-counter').innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  document.getElementById('running-score-pill').innerText = `Score: ${runningScore * 10} pts`;

  // Question Text
  document.getElementById('question-text').innerText = q.question;

  // Options
  const optionsContainer = document.getElementById('quiz-options-container');
  optionsContainer.innerHTML = q.options.map(opt => `
    <button class="quiz-option-btn" id="opt-btn-${opt.key}" onclick="chooseOption('${opt.key}')">
      <span class="option-badge">${opt.key}</span>
      <span>${opt.text}</span>
    </button>
  `).join('');

  // Reset feedback & next button
  const feedback = document.getElementById('quiz-feedback-box');
  feedback.className = 'feedback-banner';
  feedback.style.display = 'none';

  const nextBtn = document.getElementById('btn-next-question');
  nextBtn.style.display = 'none';
  const submitBtn = document.getElementById('btn-submit-answer');
  submitBtn.style.display = 'inline-flex';
  submitBtn.disabled = true;

  // Start 20s countdown timer
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 20;
  const timerEl = document.getElementById('quiz-timer-seconds');
  if (timerEl) timerEl.innerText = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timerEl) timerEl.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      EventHub.showToast("Time's up for this question!", "warning");
      // Auto submit with empty
      submitAnswer();
    }
  }, 1000);
}

function chooseOption(key) {
  selectedOption = key;
  document.querySelectorAll('.quiz-option-btn').forEach(btn => btn.classList.remove('selected'));
  document.getElementById(`opt-btn-${key}`)?.classList.add('selected');

  const submitBtn = document.getElementById('btn-submit-answer');
  if (submitBtn) submitBtn.disabled = false;
}

function checkAnswer(userAnswer, correctAnswer) {
  return userAnswer === correctAnswer;
}

function submitAnswer() {
  clearInterval(timerInterval);
  const questions = QUIZ_DATA[activeQuizCategory];
  const q = questions[currentQuestionIndex];

  // Disable all option buttons
  document.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'default';
  });

  const feedback = document.getElementById('quiz-feedback-box');
  const isCorrect = checkAnswer(selectedOption, q.correct);

  // Highlight correct answer in green
  document.getElementById(`opt-btn-${q.correct}`)?.classList.add('correct');

  if (isCorrect) {
    runningScore++;
    feedback.className = 'feedback-banner correct';
    feedback.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Correct!</strong> +10 Points. ${q.explanation}`;
  } else {
    if (selectedOption) {
      document.getElementById(`opt-btn-${selectedOption}`)?.classList.add('incorrect');
    }
    feedback.className = 'feedback-banner incorrect';
    feedback.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Incorrect.</strong> The correct answer was <strong>${q.correct}</strong>. ${q.explanation}`;
  }
  feedback.style.display = 'block';

  document.getElementById('btn-submit-answer').style.display = 'none';
  const nextBtn = document.getElementById('btn-next-question');
  nextBtn.style.display = 'inline-flex';
  nextBtn.innerText = currentQuestionIndex + 1 === questions.length ? 'View Final Results' : 'Next Question &rarr;';
}

function nextQuestion() {
  const questions = QUIZ_DATA[activeQuizCategory];
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    displayFinalResults();
  }
}

function displayFinalResults() {
  clearInterval(timerInterval);
  document.getElementById('quiz-active-screen').style.display = 'none';
  const resultsScreen = document.getElementById('quiz-results-screen');
  resultsScreen.style.display = 'block';

  const questions = QUIZ_DATA[activeQuizCategory];
  const total = questions.length;
  const percentage = Math.round((runningScore / total) * 100);

  document.getElementById('res-total-score').innerText = `${runningScore * 10} / ${total * 10}`;
  document.getElementById('res-percentage').innerText = `${percentage}% Accuracy`;
  document.getElementById('res-correct-count').innerText = `${runningScore} of ${total} Questions Correct`;

  const badgeEl = document.getElementById('res-badge-title');
  const promoEl = document.getElementById('res-promo-box');

  if (percentage >= 80) {
    badgeEl.innerHTML = `<span class="badge badge-gold" style="font-size:1.1rem; padding:8px 20px;"><i class="fa-solid fa-award"></i> Gold Master Trivia Badge</span>`;
    promoEl.innerHTML = `
      <div style="background:rgba(212,175,55,0.15); border:1px solid var(--gold); border-radius:12px; padding:16px; margin:20px 0;">
        <h4 style="color:var(--gold-light); margin-bottom:4px;">🎉 Exclusive Reward Unlocked!</h4>
        <p style="font-size:0.9rem; color:var(--ivory);">Use promo code <strong style="color:var(--gold);">TRIVIA20</strong> at checkout for <strong>20% OFF</strong> your next event booking!</p>
      </div>
    `;
  } else if (percentage >= 50) {
    badgeEl.innerHTML = `<span class="badge badge-success" style="font-size:1rem; padding:6px 16px;"><i class="fa-solid fa-medal"></i> Silver Trivia Enthusiast</span>`;
    promoEl.innerHTML = `
      <div style="background:rgba(16,185,129,0.15); border:1px solid var(--success); border-radius:12px; padding:14px; margin:20px 0;">
        <p style="font-size:0.9rem; color:var(--ivory);">Use code <strong style="color:#6ee7b7;">EVENT10</strong> for <strong>10% OFF</strong> any upcoming ticket!</p>
      </div>
    `;
  } else {
    badgeEl.innerHTML = `<span class="badge badge-warning" style="font-size:1rem; padding:6px 16px;"><i class="fa-solid fa-certificate"></i> Participant Certificate</span>`;
    promoEl.innerHTML = `<p style="color:var(--text-secondary); margin:20px 0;">Keep exploring events to sharpen your trivia skills!</p>`;
  }
}

function restartQuiz() {
  document.getElementById('quiz-results-screen').style.display = 'none';
  document.getElementById('quiz-welcome-screen').style.display = 'block';
}

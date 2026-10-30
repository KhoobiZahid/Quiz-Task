var QUESTIONS = [
  {q:"What does HTML stand for?",o:["Hyper Text Markup Language","High Tech Modern Language","Hyper Transfer Markup Logic","Home Tool Markup Language"],a:0},
  {q:"Which CSS property changes the text colour?",o:["font-style","color","text-decoration","background"],a:1},
  {q:"Which tag creates a hyperlink in HTML?",o:["<link>","<href>","<a>","<url>"],a:2},
  {q:"Which keyword declares a block-scoped variable in JavaScript?",o:["var","int","let","dim"],a:2},
  {q:"What does the CSS box model place between content and border?",o:["Margin","Padding","Outline","Gap"],a:1},
  {q:"Which method adds an element to the end of a JavaScript array?",o:["push()","pop()","shift()","unshift()"],a:0},
  {q:"Which HTML tag holds the largest heading?",o:["<h6>","<head>","<h1>","<header>"],a:2},
  {q:"What does typeof null return in JavaScript?",o:["\"null\"","\"undefined\"","\"number\"","\"object\""],a:3},
  {q:"Which CSS display value makes a flex container?",o:["flex","block","inline","table"],a:0},
  {q:"Which API stores data in the browser with no expiry date?",o:["sessionStorage","cookies only","localStorage","history"],a:2}
];
var Q_TIME = 20, PASS = 60, KEY = "quizHighScore";

var $ = function(id){ return document.getElementById(id); };
var qs = [], answers = [], lefts = [], cur = 0, tick = null;

function shuffle(arr){
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function show(id){
  ["start","quiz","result"].forEach(function(s){ $(s).classList.toggle("hidden", s !== id); });
}
function getBest(){
  try { var v = localStorage.getItem(KEY); return v === null ? null : JSON.parse(v); }
  catch (e) { return null; }
}
function setBest(o){
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
}
function showBest(){
  var b = getBest();
  $("best").textContent = b ? b.score + " / " + b.total + " (" + b.pct + "%)" : "none yet";
}

function start(){
  qs = shuffle(QUESTIONS);
  answers = qs.map(function(){ return null; });
  cur = 0;
  lefts = qs.map(function(){ return Q_TIME; });
  show("quiz");
  render();
  clearInterval(tick);
  tick = setInterval(function(){
    if (lefts[cur] <= 0) return;
    lefts[cur]--;
    updateTimer();
    if (lefts[cur] === 0) {
      if (cur === qs.length - 1) submit();
      else { cur++; render(); }
    }
  }, 1000);
}
function updateTimer(){
  var t = $("timer"), s = lefts[cur];
  t.textContent = s > 0 ? "Time " + s + "s" : "Time up";
  t.classList.toggle("low", s <= 5);
}
function render(){
  var q = qs[cur];
  $("qnum").textContent = "Question " + (cur + 1) + " of " + qs.length;
  $("prog").style.width = ((cur + 1) / qs.length * 100) + "%";
  $("qtext").textContent = q.q;
  var box = $("opts");
  box.innerHTML = "";
  q.o.forEach(function(text, i){
    var b = document.createElement("button");
    b.className = "opt" + (answers[cur] === i ? " sel" : "");
    b.textContent = String.fromCharCode(65 + i) + ". " + text;
    if (lefts[cur] <= 0) b.disabled = true;
    else b.onclick = function(){ answers[cur] = i; render(); };
    box.appendChild(b);
  });
  $("prev").disabled = cur === 0;
  $("next").textContent = cur === qs.length - 1 ? "Submit" : "Next";
  updateTimer();
}
function next(){
  if (cur === qs.length - 1) {
    var un = answers.filter(function(a){ return a === null; }).length;
    if (un && !confirm(un + " question(s) unanswered. Submit anyway?")) return;
    submit();
  } else { cur++; render(); }
}
function prev(){ if (cur > 0) { cur--; render(); } }

function submit(){
  clearInterval(tick);
  var correct = 0, wrong = 0, none = 0;
  qs.forEach(function(q, i){
    if (answers[i] === null) none++;
    else if (answers[i] === q.a) correct++;
    else wrong++;
  });
  var total = qs.length;
  var pct = Math.round(correct / total * 100);
  $("pct").textContent = pct + "%";
  var st = $("status");
  var pass = pct >= PASS;
  st.textContent = pass ? "PASS" : "FAIL";
  st.className = "pill " + (pass ? "pass" : "fail");
  $("score").textContent = correct + " / " + total;
  $("nc").textContent = correct;
  $("ni").textContent = wrong;
  $("nu").textContent = none;

  var b = getBest();
  if (!b || correct > b.score) {
    setBest({score: correct, total: total, pct: pct});
    $("bestMsg").textContent = "New highest score saved!";
  } else {
    $("bestMsg").textContent = "Highest score: " + b.score + " / " + b.total + " (" + b.pct + "%)";
  }

  var rv = $("review");
  rv.innerHTML = "";
  qs.forEach(function(q, i){
    var d = document.createElement("div");
    var ok = answers[i] === q.a;
    d.className = "rev " + (ok ? "ok" : "bad");
    var h = document.createElement("b");
    h.textContent = (i + 1) + ". " + q.q;
    d.appendChild(h);
    var y = document.createElement("span");
    if (answers[i] === null) { y.className = "n"; y.textContent = "Your answer: not answered"; }
    else { y.className = ok ? "c" : "w"; y.textContent = "Your answer: " + q.o[answers[i]] + (ok ? " ✓" : " ✗"); }
    d.appendChild(y);
    if (!ok) {
      var c = document.createElement("span");
      c.className = "c";
      c.textContent = "Correct answer: " + q.o[q.a];
      d.appendChild(c);
    }
    rv.appendChild(d);
  });
  show("result");
  window.scrollTo(0, 0);
}

$("startBtn").onclick = start;
$("again").onclick = function(){ showBest(); show("start"); };
$("next").onclick = next;
$("prev").onclick = prev;
showBest();
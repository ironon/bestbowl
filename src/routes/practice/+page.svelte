<script lang="ts">
  import { onMount } from "svelte";
  import categories from "$lib/categories.json";
  import axios from "axios";
  import Question from "../../components/Question.svelte";
  import InfoButton from "../../components/InfoButton.svelte";
  import { requestServer } from "../../lib/backend";
  let activeText = "";
  let paused = false;
  let inbetween = false;
  let timer = -1;
  let buzz_timer = -1;
  let waitingForInput = false;
  let buzzed = false;
  let end_question_on_wrong = false;
  let buzz_text = "";
  let default_buzz_time = 8000;
  let cps = 70;
  let temp_answer = "";
  let question_thinking_time = 6000;
  let cardbal = 50;
  let cata = "";
  let score = 0;
  $: oldcards = cardbal;
  $: newcards = 100 - cardbal;
  let addCards = true;
  //@ts-ignore
  let cardsAv = 0;
  let cursor = 0;
  let prompted = false
  function startQuestion() {
    prompted = false
    paused = false;
    inbetween = false;
    timer = question_thinking_time;
    buzz_timer = 0;
    buzzed = false;
    buzz_text = "";
    // inbetween = fals
    // timer = 0
    // buzz_timer = 0
    cursor = 0;
  }

  function endQuestion() {
    console.log("ending question");
    paused = true;
    inbetween = true;
    timer = -1;
    buzz_timer = 0;
    buzzed = false;
    buzz_text = "";
  }
  async function getNewQuestion() {
    // alert("bruh")
    if (waitingForInput) {
      return;
    }
    // setTimeout(startQuestion, 300)
    startQuestion();
    //@ts-ignore
    let noReviews = false;
    let due_cards: any[] = await requestServer("/view_cards", { due: "true" });
    cardsAv = due_cards.length;
    if (due_cards.length == 0) {
      noReviews = true;
    }

    let is_old = Math.random() * 100 < cardbal;
    if (!is_old || noReviews) {
      let params = {
        limit: 1,
        add: addCards ? "true" : "false",
        // category: "[" + cataNumber + "]"
      };
      let cataNumber =
        Object.keys(categories)[Object.values(categories).indexOf(cata)];
      if (cataNumber != undefined) {
        //@ts-ignore
        params["category"] = "[" + cataNumber + "]";
      }

      console.log(requestServer);
      let api_response = await requestServer("/get_random_question", params);
      questions = [...api_response, ...questions];
      activeText = questions[0].properties.text;
      console.log(activeText);
      console.log(questions);
    } else {
      let sorted_by_dates = due_cards.sort((card1, card2) => {
        console.log(card1);
        return new Date(card1.card.due) > new Date(card2.card.due);
      });
      let question_to_repeat = sorted_by_dates[0]; // most overdue card
      questions = [question_to_repeat.question, ...questions];
      activeText = question_to_repeat.question.properties.text;
    }
    questions = questions.slice(0, Math.min(30, questions.length));
  }
  function startBuzzTimer() {
    setTimeout(getTick, 100);
  }

  function getTick() {
    buzz_timer = Math.max(buzz_timer - 100, 0);
    if (buzz_timer != 0) {
      setTimeout(getTick, 100);
    } else {
      gradeQuestion();
    }
  }

  function gradeQuestion() {
    // temp grading policy until i can get LLMs trained to do this for me
    console.log("waiting for grading");

    if (inbetween || !buzzed) {
      return;
    }

    waitingForInput = true;
    temp_answer = questions[0].properties.answer;
    buzzed = false;
    // buzz_text = "";

    // inbetween = true
  }
  function addToCursor(text: string) {
    questions[0].properties.text =
      questions[0].properties.text.slice(0, cursor) +
      text +
      questions[0].properties.text.slice(cursor);
    activeText = questions[0].properties.text;
  }
  function setQuestionCorrectness(correct: boolean) {
    waitingForInput = false;
    requestServer("/logQuestion", {
      uuid: questions[0].uuid,
      response: buzz_text,
      cursor: cursor,
      correct: correct ? "correct" : "incorrect",
      
    });
    if (correct) {
      questions[0].correct = true; //make sure not to save this accidently later this is just for GUI purposes
      if (timer != question_thinking_time) {
        score = 2; //user answered after question finished reading, assuming they got it right, that's a 2 (hard)
      } else if (activeText.length / 2 > cursor) {
        //
        score = 4; //user answered before halway through the question, thats a 4 (easy)
      } else {
        score = 3; //they finished between 50% and 100%, give them 3 (good)
      }

      inbetween = true;
      timer = 0;
      buzz_timer = 0;
      cursor = 9999;
      // cursor = 0;
    } else {
      addToCursor("❌");
      score = 1; // of course... if they get it wrong its a 1 (bozo lmao)
      inbetween = true;
      timer = 0;
      buzz_timer = 0;
      cursor = 9999;
    }
    console.log("PRACTICE");
    console.log(questions[0]);
    requestServer("/practice_card", {
      rating: score,
      card_uuid: questions[0].uuid,
    });
  }
  function promptUser() {
    
    if (prompted) {
      setQuestionCorrectness(false);
    }
    requestServer("/logQuestion", {
      uuid: questions[0].uuid,
      response: buzz_text,
      cursor: cursor,
      correct: "prompt"
     
    });
    buzzed = true
    buzz_timer = default_buzz_time
    prompted = true
    waitingForInput = false
    startBuzzTimer();
    setTimeout(() => {
      document.querySelector("#buzzinput").focus();
    }, 100);

  }
  function buzz() {
    if (buzzed || inbetween || waitingForInput) {
      return;
    }
    paused = true;
    buzzed = true;
    buzz_timer = default_buzz_time;
    startBuzzTimer();
    setTimeout(() => {
      document.querySelector("#buzzinput").focus();
    }, 100);
  }
  function updateTimer() {
    if (timer == 0) {
      inbetween = true;
      timer = 0;
      buzz_timer = 0;
      requestServer("/practice_card", {
        rating: 1,
        card_uuid: questions[0].uuid,
      });
      endQuestion();
    }
    return timer;
  }
  function setActiveText(text: string) {
    activeText = text;
  }
  let questions: any[] = [
    // { answer: "david", question: "who is the coolest person?" },
    // { question: "what chocolate is better?", answer: "dark chocolate." },
  ];
  let mobilePos = 0; //only used on mobile
  onMount(() => {
    let touchstartX = 0
    let touchendX = 0
        
    function checkDirection() {
        if (touchendX < touchstartX && Math.abs(touchendX - touchstartX) > 100) mobilePos = Math.min(2, mobilePos + 1)
        if (touchendX > touchstartX && Math.abs(touchendX - touchstartX) > 100) mobilePos = Math.max(-2, mobilePos - 1)
        
    }

    document.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX
    })

    document.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX
        checkDirection()
      })
      
    window.addEventListener("keydown", (event) => {
      // console.log(event.key)
      if (event.key == " ") {
        if (inbetween) {
          getNewQuestion();
        } else {
          buzz();
        }
      }
      if (event.key.toLocaleLowerCase() == "p") {
        paused = true;
      }
      if (event.key == "Enter") {
        if (!inbetween && buzzed) {
          gradeQuestion();
        } else if (inbetween) {
          getNewQuestion();
        }
      }
      if (waitingForInput) {
        // more temp grading policy
        if (event.key.toLocaleLowerCase() == "c") {
          // correct
          setQuestionCorrectness(true);
        } else if (event.key.toLocaleLowerCase() == "i") {
          setQuestionCorrectness(false);
        } else if (event.key.toLocaleLowerCase() == "p") {
          promptUser()
        }
      }
    });
    window.addEventListener("unload" , () => {
      localStorage.setItem("reading_speed", cps.toString())
      localStorage.setItem("buzz_time", default_buzz_time.toString())
      localStorage.setItem("thinking_time", question_thinking_time.toString())
      localStorage.setItem("cardbal", cardbal.toString())
      localStorage.setItem("addCards", addCards ? "true" : "false")
      


    })
    cps = parseInt(localStorage.getItem("reading_speed")) || cps
    default_buzz_time = parseInt(localStorage.getItem("buzz_time")) || default_buzz_time
    question_thinking_time = parseInt(localStorage.getItem("thinking_time")) || question_thinking_time
    cardbal = parseInt(localStorage.getItem("cardbal")) || cardbal
    addCards = localStorage.getItem("addCards") == "true"


    getNewQuestion();
  });

  function padZero(num: number) {
    if (num.toString().length == 1) {
      return num.toString() + ".0";
    }
    return num.toString();
  }
</script>

<div id="practice">
 
  <div id="leftest" style={mobilePos == -2 ? "display: flex;" : ""}></div>
  <div id="left" style={mobilePos == -1 ? "display: flex;" : ""}></div>
  <div id="center" style={mobilePos == 0 ? "display: grid;" : ""}>
    <div id="controlbar">
      <button id="pause" title="P to Pause" on:click={() => (paused = !paused)}
        >{paused ? "▶" : "⏸"}</button
      >
      <button id="buzz" title="Space to Buzz" on:click={buzz}>Buzz</button>
      <button
        id="next"
        style={!inbetween ? "background-color:aqua" : ""}
        on:click={getNewQuestion}>{inbetween ? "Next" : "Skip"}</button
      >
      <div id="buzzcontainer" style={!buzzed ? "visibility: hidden;" : ""}>
        <input type="text" autofocus bind:value={buzz_text} style={prompted ? "background-color: #eced8e" : ""} id="buzzinput" />
        <button id="submitbuzz" style={prompted ? "background-color: #eced8e" : ""} on:click={gradeQuestion}>-&gt</button>
      </div>
      <p id="timer" style={prompted ? "background-color: #eced8e; color: black" : ""}>
        {!buzzed
          ? padZero(timer / 1000) == -0.001
            ? 0.0
            : padZero(timer / 1000)
          : padZero(buzz_timer / 1000)}
      </p>
    </div>
    <div id="questions">
      {#each questions as q}
        <Question
          {activeText}
          {setActiveText}
          {updateTimer}
          text={q.properties.text}
          answer={q.properties.answer}
          bind:cps
          bind:index={cursor}
          bind:question_thinking_time={timer}
          {paused}
          {inbetween}
          correct={q.correct}
        ></Question>
      {/each}
      <div id="tempanswer">
        {temp_answer}
      </div>
    </div>
  </div>
  <div id="right" style={mobilePos == 1 ? "display: flex;" : ""}>
    <h2>Settings</h2>
    <div id="settings">
      <div id="same-line">
        <label for="questionspeed">Reading Speed</label>
        <input
          id="questionspeed"
          bind:value={cps}
          min="15"
          max="150"
          type="range"
        />
      </div>
      <div id="same-line">
        <label for="questionspeed">Buzz Time</label>
        <input
          id="questionspeed"
          bind:value={default_buzz_time}
          min="3000"
          max="20000"
          type="range"
        />
        <p>{Math.round(default_buzz_time/1000)}</p>
       
      </div>
      <div id="same-line">
        <label for="questionspeed">Thinking Time</label>
        <input
          id="questionspeed"
          bind:value={question_thinking_time}
          min="3000"
          max="20000"
          type="range"
        />
        <p>{Math.round(question_thinking_time/1000)}</p>
      </div>
      <div id="same-line">
        <label for="selectbox">Category</label>
        <select id="selectbox" bind:value={cata}>
          <option></option>
          {#each Object.keys(categories) as t}
            <option>{categories[t]}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
  <div id="rightmost" style={mobilePos == 2 ? "display: flex;" : ""}>
    <div style="display: flex; flex-direction: row;">
      <h2>SRS</h2>

      <InfoButton
        ><a href="https://en.wikipedia.org/wiki/Spaced_repetition"
          >Spaced Repitition System</a
        ></InfoButton
      >
    </div>
    <div id="srs-settings">
      <div id="oldbal">
        <p>{oldcards}% Old</p>
        <input type="range" min="0" max="100" step="5" bind:value={cardbal} />
        <p>{newcards}% New</p>
      </div>

      <label for="add"
        >Add new cards to deck?<input
          id="add"
          type="checkbox"
          bind:checked={addCards}
        /></label
      >
      <div id="cards">
        Cards to review today: <p>{cardsAv}</p>
      </div>
    </div>
    <div
      style="display: flex; flex-direction: row; justify-content: center; width: 100%;"
    >
      <InfoButton
        >If you don't know what this is, don't worry about it. Default settings
        are recommended for most people</InfoButton
      >
    </div>
  </div>
</div>

<style>
  
  #questionspeed {
    flex-shrink: 3;
    flex-basis: 1;
    min-width: 0px;
    margin-right: 1rem;
  }
  #tempanswer {
    display: flex;
    position:sticky; 
    min-height: 4rem;
    max-height: 12rem;
    bottom: 0;
    left: 0;
    background-color: gray;
    border: 3px solid black;
    color: black;
    width: 100%;
  }
  #oldbal {
    /* margin-top: 1rem; */
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #same-line {
    display: flex;
    justify-content: left;
    flex-direction: row;
    margin-bottom: 1rem;
    align-items: center;
  }
  #same-line {
    margin-right: 1rem;
  }

  #settings {
    width: 100%;
    margin-top: 1rem;
    justify-content: space-around;
    flex-direction: column;
    display: flex;
  }
  #settings label {
    width: min-content;
    margin-right: 1rem;
  }
  #cards {
    margin-left: 1rem;
    display: flex;
    align-items: center;
  }
  #cards p {
    font-weight: bold;
    color: green;
    font-size: large;
  }
  #oldbal p {
    text-align: center;
    margin-left: 0 !important;
  }
  #srs-settings {
    display: flex;
    flex-direction: column;
    min-width: 100%;
    /* margin-left: 1rem; */
    padding-top: 0;
    margin-top: 0;
  }
  #infosrs {
    font-style: italic;
    font-size: medium;
    margin-top: 0;
    margin-bottom: 0;
  }
  #rightmost,
  #right {
    padding: 0rem;
  }
  #rightmost p,
  label {
    margin-left: 1rem;
  }
  #right p,
  label {
    margin-left: 1rem;
  }
  #rightmost h2 {
    margin: 0;

    margin-left: 1rem;
  }
  #right h2 {
    margin: 0;

    margin-left: 1rem;
  }
  #practice {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  #practice > * {
    width: 15%;
    /* width:; */
    border-radius: 5px;
    border: 2px solid gray;
    height: 95%;
    flex-direction: column;
  }


  #center {
    width: 30%;
    display: grid;
  }
  #controlbar {
    grid-row: 1;
    grid-column: 1;
    width: 100%;
    /* grid-row-end: 10px; */
    grid-template-columns: 4rem 4rem auto 4rem;
    display: grid;
    margin-top: -4rem;
    padding: 0;
  }
  #pause {
    grid-row: 1;
    grid-column: 1;
    padding: 0.5rem;
    width: 3rem;
    /* text-align: ; */
    height: 3rem;
    color: white;
    margin: 0;
    /* font-size: 1.5rem; */
    /* font-size: xx-small; */
    margin-right: 0.5rem;
  }
  #next {
    grid-row: 1;
    grid-column: 3;
    height: 3rem;
    width: 4rem;
    margin-left: 1rem;
    padding: 0.5rem;
    background-color: rgb(195, 224, 147);
    color: black;
  }
  #buzz {
    grid-row: 1;
    grid-column: 2;
    height: 3rem;
    width: 4rem;
    padding: 0.5rem;
    background-color: rgb(221, 116, 116);
    color: black;

    /* font-size: xx-small; */
    /* font-size: small; */
  }
  #timer {
    grid-row: 1;
    grid-column: 4;
    width: 3rem;
    height: 3rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    margin-left: 0.5rem;
    border: 2px solid black;
    background-color: rgb(51, 49, 49);
  }
  #buzz:hover {
    background-color: rgb(170, 55, 55);
  }
  #buzzcontainer {
    /* width: 200%; */
    /* margin-left: 1rem; */

    height: 3rem;
    display: flex;
    width: auto;
    grid-column: 3;
    outline: none;
    grid-row: 1;
    display: flex;
    flex-direction: row;
    height: 3rem;
    color: black;
    /* font-size: 1rem; */
  }
  #buzzinput {
    /* width: 200%; */
    margin-left: 1rem;
    margin-right: 1rem;
    height: 100%;
    display: flex;
    width: 100%;

    outline: none;

    height: 3rem;
    color: black;
    /* font-size: 1rem; */
    padding-left: 1rem;
    background-color: rgb(194, 116, 116);
    border-color: rgb(97, 15, 15);
  }
  #submitbuzz {
    background-color: rgb(187, 127, 127);
    /* padding: 0; */
    text-wrap: nowrap;
    font-size: large;
    color: black;
    height: 3rem;
    width: 3rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #questions {
    grid-column: 1;
    grid-row: 1;
    height: 100%;
    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;
    /* padding-top: 1rem; */
    overflow-y: scroll;
  }
  @media only screen and (max-width: 1200px) {
    #practice > * {
      display: none;
      width: 90%;
    }
    #center {
      height: 90%;
      margin-top: 20%;
    }
  }
 
</style>

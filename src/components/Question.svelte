
<script lang="ts">
    export let text: string;
    export let cps //characters per secondd
    export let activeText;
    export let inbetween;
    export let answer;
    export let index
    export let paused: boolean;
    export let setActiveText: (text:string) => void;
    export let updateTimer: () => void;
    export let question_thinking_time = 6000
    export let correct: boolean
    let totalTime = text.length * cps
    let gone = false
    let real_text = ""
    
    let tick = 0
    function startEndTimer() {
    
        setTimeout(getTick, 100)
    }
    function getTick() {
        if (activeText != text) {
            return ""
        }
        if (!paused) {

            question_thinking_time = Math.max(question_thinking_time - 100, 0)
        }
        updateTimer()
        if (question_thinking_time > 0) {
            clearTimeout(tick)
            tick = setTimeout(getTick, 100)
        }
    }
    let typingTick = () => {
        if (paused != true) {

            index += 1
        }
        if (activeText == text) {

            setTimeout(typingTick, (1/parseInt(cps))*1000)
        }
    }
    typingTick()
    function get_mask(text:string, index: number) {
        if (activeText != text) {
            return ""
        }
        let i = index
        if (i >= text.length) {
            i = text.length
            // clearInterval(typing)
            if (!gone) {
                gone = true
                startEndTimer()
            }
        }
    
        return text.slice(0, i)
    }
    function becomeActive() {
        if (paused) {

            // end_index = text.length
            setActiveText(text)
        }
        
    }
    function getInsult() { //got question wrong
        let insults = ["WRONG", "INCORRECT 😭", "GET BETTER", "BOZO", "haha NEGGED", "imagine being wrong"]
        return insults[Math.floor(Math.random() * insults.length)]
    }
    function getDummy() {
        // THIS IS THE HACKIEST SOLUTION IVE EVER DONE IN MY LIFE OH MY GOD
        // the entire point of this function is that it only runs when the text inside the question changes, i dont know how to do that, besides reactive declarations.
        // bro if svelte was more optimized (maybe in the build version), it'd "realize" dummy is completely useless and would trim it, breaking my code entirely
        // this is hillarious omg
        gone = false 
        return dummy
    }
    //@ts-ignore
    $: dummy = getDummy(activeText)
    $: activeStyle = text == activeText ? "" : "opacity:0.2"
    $: real_text = get_mask(text, index)
    $: showAnswer = inbetween || (activeText != text)
    $: displayed = activeText == text ? real_text : text.slice(0,136) + "..."
</script>

<div id="question">
    <div id="sameline">

        {#if showAnswer}
        
        <p id="answer">{answer}</p>
        {/if}
        {#if correct}

        <p id="correct" style="">CORRECT</p>
        {:else if showAnswer} 
        <p id="correct" style="color: red">{getInsult()}</p>
        {/if}
    </div>
    <div id="invisibletext" style={activeStyle}>
        {text}
    </div>
    
    <p id="actualtext" style={activeStyle}>{displayed}</p>


</div>
<style>
    #sameline {
        grid-column: 1;
        grid-row: 1;
        display: grid;
        justify-content: space-around;
        grid-template-columns: 80% 20%;
        align-items: center;
    }
    #correct {
        grid-column: 2;
        grid-row: 1;
        width: 100%;
        text-align: left;
        color: green;
        height: 3rem;
        margin-left: 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;

    }
    #question {
        width: 90%;
        height: fit-content;
        display: grid;
        padding-top: 0.8rem;
        padding-bottom: 1rem;
        background-color: rgb(53, 51, 51);
        border-radius: 5px;
        padding-left: 1rem;
        padding-right: 1rem;
        margin-bottom: 1rem;
        margin-top: 1rem;
    }
    #answer {
        grid-column: 1;
        grid-row: 1;
        background-color: rgb(71, 70, 70);
        padding: 0.5rem;
        border-radius: 1rem;
        
    }
    #invisibletext {
        visibility: hidden;
        grid-column: 1;
        grid-row: 2;
        /* position: absolute; */
    }
    #actualtext {
       grid-column: 1;
       grid-row: 2;
       
    
    }
    #question * {
        margin-bottom: 0.5rem;
        margin-top: 0rem;
    }
</style>
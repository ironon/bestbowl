<script lang="ts">
// @ts-nocheck
    import axios from "axios"
    import categories from "$lib/categories.json"
    import subcategories from "$lib/subcategories.json"
    import tourneys from "$lib/tourneys.json"
    import { dataset_dev } from "svelte/internal";
    let searchinput = ""
    let cards = []
    let loading = false
    let API_URL = "http://127.0.0.1:5004"
    function displayNamesToUrlNames(name: String) {
        return name.toLowerCase().replace(" ", "_")
    }
    let url_params = {
        
    }
    
    function onSelectChanged(e){
        let param = e.target.parentNode.querySelector("#paramheader").innerText //im too good for svelte i prefer my html thank you very much (sarcasm)
        
        if (e.target.value == "") {
            delete url_params[displayNamesToUrlNames(param)]
            console.log(url_params)
            console.log("reseting")
            console.log(param)
            return
        }
        
        let paramUrlName = displayNamesToUrlNames(param)
        let val = e.target.value
        url_params[paramUrlName] = val

    }
    function turnPropNameIntoId(name: string, prop_name:string) {
        let re = null
        if (prop_name == "difficulty") {
            return parseInt(name)
        }

        if (prop_name == "subcategory") {

            Object.keys(subcategories).forEach((key) => {
                if (subcategories[key].name == name) {
                    re = parseInt(key)
                }
            })
            return re
        }
        if (prop_name == "tournament") {

            Object.keys(tourneys).forEach((key) => {
                if (tourneys[key].name == name) {
                    re = parseInt(key)
                }
            })
            return re
        }
        if (prop_name == "category") {
            Object.keys(categories).forEach((key) => {
                let val = categories[key]
                if (val == name) {
                    re = key
                }
            })
            return re
        } 
        console.error("Error: you passed in something dumb.")
}
        

    async function search() {
        let final_url_params = {

        }
        console.log("SEARCHING!")
        Object.keys(url_params).forEach(key => {
            if (url_params[key]){
                final_url_params[key] = "[" + turnPropNameIntoId(url_params[key], key) + "]" //im so great at this  || 6 months later -> what abomination is this what the actual frick
            }
            
        })
        final_url_params['limit'] = 80
        final_url_params['query'] = searchinput
        final_url_params['id'] = localStorage.getItem("api_key")
        loading = true
        let req = await axios.get(API_URL+'/search', {params: final_url_params})
        loading = false
        let data = req.data
        cards = [...data]
    }
</script>

<div id="search">
    <div id="widget">
        <input bind:value={searchinput} placeholder="Search for questions here!">
        <div id="params">
            <div id="parambox" on:change={onSelectChanged}>
                <p id="paramheader">Category</p>
                <select id="selectbox">
                    <option></option>
                    {#each Object.keys(categories) as t}
                     <option>{categories[t]}</option>   
                    {/each}
                </select>
            </div>
            <div id="parambox" on:change={onSelectChanged}>
                <p id="paramheader">Difficulty</p>
                <select id="selectbox">
                    <option></option>
                    <option>1 (Middle School)</option>
                    <option>2 (Easy High School)</option>
                    <option>3 (Regular High School)</option>
                    <option>4 (Hard High School)</option>
                    <option>5 (National High School)</option>
                    <option>6 (Easy College)</option>
                    <option>7 (Regular College)</option>
                    <option>8 (Hard College)</option>
                    <option>9 (Open)</option>

                </select>
            </div>
      
            <div id="parambox" on:change={onSelectChanged}>
                <p id="paramheader">Subcategory</p>
                <select id="selectbox">
                    <option></option>
                    {#each Object.keys(subcategories) as t}
                     <option>{subcategories[t]['name']}</option>   
                    {/each}
                </select>
            </div>
            <div id="parambox" on:change={onSelectChanged}>
                <p id="paramheader">Question Type</p>
                <select id="selectbox">
                    <option></option>
                    <option>Toss-up</option>
                    <option>Answer</option>
                </select>
            </div>
            <div id="parambox" on:change={onSelectChanged}>
                <p id="paramheader">Tournament</p>
                <select id="selectbox">
                    <option></option>
                    {#each Object.keys(tourneys) as t}
                    <option>{tourneys[t]['name']}</option>   
                   {/each}
                </select>
            </div>
        </div>
        <button id="searchbutton" on:click={search}>SEARCH!!!</button>
    </div>
    <div id="results">
        {#if loading}
            <p>Loading cards...this may take a second</p>
        {:else if cards.length == 0}
            <h2>No cards found!</h2>
            <p>"Well ain't that just dandy!!!"</p>
        {:else}
            {#each cards as card}
                <div id="searchresult">
                    <p>{card['properties']['text']}</p>
                    <h3>{card['properties']['answer']}</h3>
                    <!-- <p>{card["extra"]["subcategory_id"]}</p> -->
                    
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    input {
        width: 20rem;
        margin-bottom: 1rem;

    }
    #searchresult {
        width: 70%;
        box-shadow: 5px 5px 5px black;
        border: 3px solid black;
        margin-bottom: 1.5rem;
    
    }

    .hidden {
        visibility: hidden;
    }
    #searchbutton {
        padding: 1.5rem;
        margin-top: 1rem;
        background-color: rgb(50, 50, 50);
        border: 1px solid lightgray;
    }
    #search {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;
        
        height: 100%;
        /* transform: scale(1.1); */
    }
    select, input {
        padding: 0.4rem;
    }
    #widget {
        display: flex;
        flex-direction: column;
        align-items: center;

    }
    #results {
        margin-top: 4rem;
        min-height: 40%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #parambox {
        border: 1px solid lightgray;
        border-radius: 0.5rem;
        margin: 1rem;
        width: 17rem;
        display: flex;
        justify-content: center;
        flex-direction: column;
        background-color: rgb(50, 50, 50);
        /* padding: 0.4rem; */
    }
    #paramheader {
        color: white;
        opacity: 0.7;
        padding: 0.5rem;
        text-align: center;
        margin: 0;

    }
    #params {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: centerI;
        width: 100%;
        height: 100%;
    }
    #selectbox{
        margin: 1rem;
        margin-top: 0.8rem;
    }
      
  @media (prefers-color-scheme: light) {
    #parambox {
        background-color: rgb(251, 251, 251);
        color: white
    }
    #paramheader {
        color: black;
        opacity: 0.7;
        padding: 0.5rem;
        margin: 0;

    }
  }
</style>
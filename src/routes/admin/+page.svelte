<script lang="ts">
  import { API_URL } from "$lib/backend";

    // @ts-nocheck
        import axios from "axios"
        // let API_URL = API_URL
        
        async function deleteCards() {
            console.log("deleting cards")
            let url_params = {
                "id": localStorage.getItem("api_key")
            }
            let req = await axios.get(API_URL+'/delete_all_cards', {params:url_params})
        }
        
        async function addNoCard() {
            let url_params = {
                "id": localStorage.getItem("api_key")
            }
            await axios.get(API_URL+"/add_no_card", {params:url_params})
        }
        async function reindex() {
            let url_params = {
                "id": localStorage.getItem("api_key")
            }
            await axios.get(API_URL+"/reindex", {params:url_params})
        }

</script>

    <div id="admin-panel">
        <button on:click={deleteCards}>Delete All Cards</button>
        <button on:click={addNoCard}>Add nocard</button>
        <button on:click={reindex}>Reindex Database</button>
    </div>

    <style>
       
    </style>

<script lang="ts">
    import { onMount } from "svelte";
    import axios from "axios";
    import {API_URL} from "../lib/backend"
    
    let message = ""
    onMount(async () => {
        //@ts-ignore
        if (localStorage.getItem("api_key") == null) {
            let req = axios({
                method: 'get',
                url: API_URL+'/create_user?redirect=false',
            })
            let key = (await req).data
            //@ts-ignore
            localStorage.setItem("api_key", key)
            window.location.reload()
        }
        window.addEventListener('keydown', function(e) {
            if(e.keyCode == 32 && e.target == document.body) {
                e.preventDefault();
            }
        });
       
        
    })

</script>
<div class="default-layout">
    <header>
        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" height="1em" fill="currentColor" viewBox="0 0 512 512">
            <path d="M 496 256 Q 495 191 464 136 L 464 136 Q 432 81 376 48 Q 319 16 256 16 Q 193 16 136 48 Q 80 81 48 136 Q 17 191 16 256 Q 17 321 48 376 Q 80 431 136 464 Q 193 496 256 496 Q 319 496 376 464 Q 432 431 464 376 Q 495 321 496 256 L 496 256 Z M 0 256 Q 1 186 34 128 L 34 128 Q 68 70 128 34 Q 189 0 256 0 Q 323 0 384 34 Q 444 70 478 128 Q 511 186 512 256 Q 511 326 478 384 Q 444 442 384 478 Q 323 512 256 512 Q 189 512 128 478 Q 68 442 34 384 Q 1 326 0 256 L 0 256 Z M 240 176 Q 254 176 263 185 L 263 185 Q 272 194 272 208 Q 272 222 263 231 Q 254 240 240 240 Q 226 240 217 231 Q 208 222 208 208 Q 208 194 217 185 Q 226 176 240 176 L 240 176 Z M 256 208 Q 255 193 240 192 Q 225 193 224 208 Q 225 223 240 224 Q 255 223 256 208 L 256 208 Z M 112 176 Q 112 162 121 153 L 121 153 Q 130 144 144 144 Q 158 144 167 153 Q 176 162 176 176 Q 176 190 167 199 Q 158 208 144 208 Q 130 208 121 199 Q 112 190 112 176 L 112 176 Z M 144 192 Q 159 191 160 176 Q 159 161 144 160 Q 129 161 128 176 Q 129 191 144 192 L 144 192 Z M 240 80 Q 254 80 263 89 L 263 89 Q 272 98 272 112 Q 272 126 263 135 Q 254 144 240 144 Q 226 144 217 135 Q 208 126 208 112 Q 208 98 217 89 Q 226 80 240 80 L 240 80 Z M 256 112 Q 255 97 240 96 Q 225 97 224 112 Q 225 127 240 128 Q 255 127 256 112 L 256 112 Z" />
        </svg>
        <h2 id="bestbowltitle">BESTBOWL</h2>
    </header>
    <main>

        <slot/>
    </main>
    <div id="footer">
        <a href="/about">About</a>
        <a href="/">Home</a>
    </div>
</div>

<style>
    .default-layout {
        width: 100%;
        height: 100vh;
        padding: 0;
    }
    header {
        height: 10%;
        width: 100%;
        display: flex;
        justify-content: left;
        align-items: center;
        flex-direction: row;
        /* border-bottom: 2px solid lightgray; */
    }
    svg {
        transform: scale(3);
        margin-left: 4rem;
        margin-right: 2rem;
    }
    main {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        width: 100%;
        height: 80%;
    }
    #footer {
        bottom: 0;
        transform: scale(0.95); 
        /* i dont know how to get the stupid scroll bars to go away but this hack works^^ */
        left: 0;
        display: flex;
        position: fixed;
        border: 0px solid white;
        width: 100%;
        height: 2rem;
        padding: 0.2rem;
        margin: 0;
        display: flex;
        justify-content: space-around;
        

    }
</style>
<script lang="ts">
    import { onMount } from "svelte";
    import { WorldChart } from "./charts/wordChart";
    import { WordConverter } from "./charts/wordConverter";
    import * as data1 from './data.json';

    onMount(async () => {
        const worldChart = new WorldChart('.d3-container');
        //worldChart.draw(data1.default);

        await fetch(`http://localhost:8080/word/bad`)
            .then(r => r.json())
            .then(data => {
                console.log(WordConverter.toDatum(data))
                worldChart.draw(WordConverter.toDatum(data));
            });
    })

</script>

<main>
    <div class="d3-container">
    </div>
</main>

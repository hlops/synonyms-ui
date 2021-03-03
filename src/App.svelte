<script lang="ts">
    import { onMount } from "svelte";
    import { WorldChart } from "./charts/wordChart";
    import { WordConverter } from "./charts/wordConverter";

    onMount(async () => {
        const worldChart = new WorldChart('.d3-container');


        //worldChart.draw(data1.default);

        await fetch(`http://localhost:8080/word/attack`)
            .then(r => r.json())
            .then(data => {
                const datum = WordConverter.toDatum(data);
                worldChart.draw(datum);
                setTimeout(() => {
                    datum.children[1].children[1].value = 100;
                    worldChart.redraw(datum);
                }, 1000)
            });
    })

</script>

<main>
    <div class="d3-container">
    </div>
</main>

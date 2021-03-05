<script lang="ts">
    import _ from "lodash";
    import { onMount } from "svelte";
    import { WorldChart } from "./charts/wordChart";
    import { WordConverter } from "./charts/wordConverter";
    import { getWords } from "./data/store";
    import type { ResultOptions } from "./data/wordUtils";

    onMount(async () => {
        const worldChart = new WorldChart('.d3-container');

        const options: ResultOptions = {synonyms: true, similarTo: true, also: true};
        await getWords('known', options)
            .then(([data, ...promises]) => {
                Promise.all(promises).then(words => {
                    const datum = WordConverter.toDatum(data, _.reduce(words, (result, w) => {
                        result[w.word] = w.frequency;
                        return result
                    }, {}), options);
                    worldChart.draw(datum);
                })
            });
    })

</script>

<main>
    <div class="d3-container">
    </div>
</main>

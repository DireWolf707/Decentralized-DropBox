<script>
    import { createEventDispatcher } from "svelte/internal";

    let dispatch = createEventDispatcher();
    export let navArray;
    $: count = navArray.length - 1;
</script>

{#if navArray}
    <div class="mx-6 mt-8 text-lg flex">
    {#each navArray as nav, i}
        <button on:click="{()=>{dispatch('onFolderBackward',i+1)}}"
        class="{count == i ? 'font-bold' : ''} mx-2 hover:underline hover:underline-offset-1">
            {nav.get('name')}
        </button>
        /
    {/each}
    </div>
{/if}

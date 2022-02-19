<script>
    export let userName;
</script>

<div class="border rounded-b-lg bg-black mx-2 p-1">
    <div class="flex justify-between p-4 text-white font-semibold text-lg">
        <div>Decentralized DropBox</div>
        {#if userName}
            Hello {userName} !
        {/if}
    </div>
</div>
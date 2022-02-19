<script>
    import Moralis from 'moralis/dist/moralis.min.js';
    import { onMount,onDestroy } from "svelte";
    import { selectedAccount } from 'svelte-web3';

    let recentFiles=[];
    let favoriteFiles=[];
    let s1,s2;

    onMount(async ()=>{
        Moralis.LiveQuery.close();

        const q1 = new Moralis.Query('File');
        q1.descending('createdAt');
        q1.equalTo('fav',true);
        q1.equalTo('address',($selectedAccount).toLocaleLowerCase());
        favoriteFiles = await q1.find();

        s1 = await q1.subscribe();
        s1.on('open', async() => {
            console.log("sadsad");
        });
        s1.on('enter', async() => {
            favoriteFiles = await q1.find();
        });
        s1.on('leave', async() => {
            favoriteFiles = await q1.find();
        });

        const q2 = new Moralis.Query('File');
        q2.descending('createdAt');
        q2.equalTo('address',($selectedAccount).toLocaleLowerCase());
        q2.limit(7);
        recentFiles = await q2.find();

        s2 = await q2.subscribe();
        s2.on('create', async() => {
            recentFiles = await q2.find();
        });
    })

    onDestroy(()=>{
        s1.unsubscribe();
        s2.unsubscribe();
    })

    

</script>

<div class="font-extrabold text-4xl underline underline-offset-1">
    Files
</div>

<div class="mt-4">
    <div class="text-lg underline underline-offset-1">Recent</div>
    {#each recentFiles as file}
        <div class="ml-2">
            <a href="ipfs://{file.get("hash")}" target="_blank">{file.get('name')}</a>
        </div>
    {/each}
</div>

<div class="mt-4">
    <div class="text-lg underline underline-offset-1">Favorite</div>
    {#each favoriteFiles as file}
        <div class="ml-2">
            <a href="ipfs://{file.get("hash")}" target="_blank">{file.get('name')}</a>
        </div>
    {/each}
</div>
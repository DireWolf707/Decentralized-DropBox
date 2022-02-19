<script>
    import Moralis from 'moralis/dist/moralis.min.js';
    import { createEventDispatcher } from "svelte";
    import { selectedAccount } from 'svelte-web3';

    //export let contract;
    export let currFolder;
    let value;
    let subFolders;
    let dispatch = createEventDispatcher();

    $:onCurrFolderChnage(currFolder);
    const onCurrFolderChnage = async ()=>{
        subFolders = undefined;
        let _subFolders = [];
        let _temp = currFolder.get('subFolders');
        
        for (let i = 0; i < _temp.length; i++) {
            _subFolders.push(await _temp[i].fetch());
        }
        subFolders = _subFolders;

        // for (let i = 0; i < _temp.length; i++) {
        //     //_subFolders.push(await _temp[i].fetch());
        //     const q = new Moralis.Query('Folder');
        //     const result = await q.find(_temp[i].id);
        //     console.log(result)
        // }
    }

    const createFolder = async ()=>{
        const Folder = Moralis.Object.extend('Folder');
        const folder = new Folder();
        folder.set('files',[]);
        folder.set('subFolders',[]);
        folder.set('name',value);

        currFolder.add("subFolders", folder);
        await currFolder.save();
    }
</script>

<div>
    <button class="border p-2" on:click="{createFolder}">+ folder</button>
    <input type="text" bind:value
        class="border-2 p-2">

    ---FOLDERS---
    {#if subFolders}
    {#each subFolders as folder}
        <div>
            <button on:click="{()=>(dispatch('onFolderEnter',folder))}">{folder.get('name')}</button>
        </div>
    {/each}
    {/if}

</div>
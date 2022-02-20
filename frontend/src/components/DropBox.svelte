<script>
    import Moralis from 'moralis/dist/moralis.min.js';
    import { createEventDispatcher } from "svelte";
    import { selectedAccount } from 'svelte-web3';

    export let contract;
    export let currFolder;
    let newFolderName="";
    let newFile;
    let subFolders;
    let subFiles;
    let uploading=false;
    let dispatch = createEventDispatcher();

    $:onCurrFolderChnage(currFolder);
    const onCurrFolderChnage = async ()=>{
        subFiles = undefined;
        const q1 = new Moralis.Query('Folder');
        q1.equalTo('parent',currFolder);
        q1.descending("createdAt");
        subFolders = await q1.find();
        const q2 = new Moralis.Query('File');
        q2.equalTo('parent',currFolder);
        q2.descending("createdAt");
        subFiles = await q2.find();
    }

    const createFolder = async ()=>{
        const Folder = Moralis.Object.extend('Folder');
        const folder = new Folder();
        folder.set('name',newFolderName);
        folder.set('parent',currFolder);
        folder.set('address',($selectedAccount).toLowerCase());
        await folder.save();
        newFolderName="";
        onCurrFolderChnage();
    }

    const createFile = async ()=>{
        if (newFile.length == 0) {
            return;
        }
        uploading=true;
        //uploading
        const _file = newFile[0];
        const _newFile = new Moralis.File(_file.name,_file);
        await _newFile.saveIPFS({useMasterKey:true});
        const hash = _newFile.hash();
        //sending to ethereum
        try {
            await contract.methods.uploadFile(hash, _file.size, _file.type, _file.name).send({from:$selectedAccount});  
            //updating table
            const File = Moralis.Object.extend('File');
            const file = new File();
            file.set('address',($selectedAccount).toLocaleLowerCase());
            file.set('hash',hash);
            file.set('type',_file.type);
            file.set('size',_file.size);
            file.set('name',_file.name);
            file.set('fav',false);
            file.set('parent',currFolder);
            await file.save();  
            onCurrFolderChnage();
        } catch (error) {
            console.log(error);
        } finally {
            newFile=undefined;
            uploading=false;
        }
    }

    const toggleFavorate = async (_type,_id)=>{
        const q = new Moralis.Query(_type);
        q.equalTo('address',($selectedAccount).toLowerCase());
        q.equalTo('objectId',_id);
        let res = await q.find();
        res = res[0];
        res.set('fav',!res.get('fav'));
        await res.save();
        dispatch('getFavoriteFiles');
    }

    const fileSizeCalc = (bytes, decimals = 2)=>{
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
</script>

<div class="px-4 mx-2">
    
    <div class="flex justify-between">
        {#if !uploading}
            <div class="flex">
                <button class="border rounded px-2 mr-1 bg-slate-300 hover:bg-slate-400"
                on:click="{createFile}">+File</button>
                <input type="file" bind:files="{newFile}">
            </div>
        {:else}
            Uploading...
        {/if}
        <div>
            <button class="border rounded px-2 bg-slate-300 hover:bg-slate-400" 
            on:click="{createFolder}">+Folder</button>
            <input type="text" bind:value={newFolderName}
                class="border-2 px-1">
        </div>
    </div>
    
    <div class="w-full mx-auto overflow-auto mt-1">
        <table class="table-auto w-full text-left whitespace-no-wrap">
          <thead>
            <tr>
              <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">Name</th>
              <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Uploaded At</th>
              <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Type</th>
              <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Size</th>
              <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Marked Favorite</th>
              <th class="w-10 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tr rounded-br"></th>
            </tr>
          </thead>
          <tbody>
            {#if subFiles}
                {#each subFolders as folder (folder.id)}
                <tr>
                    <td class="px-4 py-3"><button on:click="{()=>(dispatch('onFolderEnter',folder))}">{folder.get('name')}</button></td>
                    <td class="px-4 py-3">{folder.createdAt.toLocaleString()}</td>
                    <td class="px-4 py-3">folder</td>
                    <td class="px-4 py-3 text-lg text-gray-900">-</td>
                    <td class="w-10 text-center">
                        -
                    </td>
                    </tr>
                {/each}
                {#each subFiles as file (file.id)}
                <tr>
                    <td class="px-4 py-3"><a href="ipfs://{file.get("hash")}" target="_blank">{file.get('name')}</a></td>
                    <td class="px-4 py-3">{file.createdAt.toLocaleString()}</td>
                    <td class="px-4 py-3">{file.get('type')}</td>
                    <td class="px-4 py-3 text-lg text-gray-900">{fileSizeCalc(file.get('size'))}</td>
                    <td class="w-10 text-center">
                        <input type="checkbox" on:click="{()=>{toggleFavorate('File',file.id)}}" checked="{file.get('fav')}">
                    </td>
                </tr>
                {/each}
            {:else}
                laoding..
            {/if}
          </tbody>
        </table>
      </div>
    
</div>





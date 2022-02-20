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

    const mintNFT = async (_file)=>{
        const metadata = {
            name:_file.get("name"),
            image : "/ipfs/" + _file.get("hash"),
        }
        const jsonFile = new Moralis.File("metadata.json",{
            base64: btoa(JSON.stringify(metadata))
        });
        await jsonFile.saveIPFS();
        let metadataHash= jsonFile.hash();
        const res =await Moralis.Plugins.rarible.lazyMint({
            chain: 'eth',
            userAddress: $selectedAccount,
            tokenType: 'ERC721',
            tokenUri: "/ipfs/" + metadataHash,
        })
        
        const token_address = res.data.result.tokenAddress;
        const token_id = res.data.result.tokenId;
        _file.set("nftUrl",`https://rarible.com/token/${token_address}:${token_id}`);
        await _file.save();
        onCurrFolderChnage();
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
            <div class="text-xl flex justify-center mb-2 ml-4">Uploading... &nbsp;
                <svg role="status" class="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
            </div>
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
            <tr class="text-left">
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
                    <td class="px-4 py-3">
                        <div class="flex justify-between">
                            <a href="ipfs://{file.get("hash")}" target="_blank">{file.get('name')}</a>
                            {#if file.get("nftUrl")}
                                <a href="{file.get("nftUrl")}" target="_blank"
                                class="border-l-4 pl-2 pr-2 bg-green-400 hover:bg-green-500 text-white">Marketplace</a> 
                            {:else}
                                <button on:click="{()=>mintNFT(file)}"
                                    class="border-l-4 pl-2 pr-2 bg-purple-400 hover:bg-purple-500 text-white">Mint NFT</button>
                            {/if}
                        </div>
                    </td>
                    <td class="px-4 py-3">{file.createdAt.toLocaleString()}</td>
                    <td class="px-4 py-3">{file.get('type')}</td>
                    <td class="px-4 py-3 text-lg text-gray-900">{fileSizeCalc(file.get('size'))}</td>
                    <td class="w-10 text-center">
                        <input type="checkbox" on:click="{()=>{toggleFavorate('File',file.id)}}" checked="{file.get('fav')}">
                    </td>
                </tr>
                {/each}
            {:else}
            <tr>
                <div class="text-xl flex justify-center my-40 mx-48 w-full">Loading... &nbsp;
                    <svg role="status" class="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                </div>
            </tr>
            {/if}
          </tbody>
        </table>
      </div>
    
</div>





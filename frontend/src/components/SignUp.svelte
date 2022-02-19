<script>
    import Moralis from 'moralis/dist/moralis.min.js';
    import { selectedAccount } from 'svelte-web3';
    import { createEventDispatcher } from 'svelte';

    let name="";
    let dispatch = createEventDispatcher();

    const signupHandler = async ()=>{
        const Folder = Moralis.Object.extend('Folder');
        const folder = new Folder();
        folder.set('name','root');
        folder.set('address',($selectedAccount).toLowerCase());
        folder.set('fav',false);
        
        const CustomUser = Moralis.Object.extend('CustomUser');
        const user = new CustomUser();
        user.set('address',($selectedAccount).toLowerCase());
        user.set('name',name);
        user.set('root',folder);
        await user.save();
        dispatch('login');
    }
</script>

<div class="w-1/3 mx-auto border-2 rounded-xl my-24 py-2 px-4">
    <p class="text-xl font-extrabold text-center mt-2 underline underline-offset-2">Welcome to Decentralized DropBox!</p>
    <p class="text-lg mt-4 p-1">Please enter your name below to use our service and start storing your files securely!</p>
    <div class="font-bold mb-1 p-4">
        Name:
        <input type="text" class="border-2 rounded p-1 w-full"
        bind:value="{name}">
        <button on:click="{signupHandler}"
            class="w-full border-2 rounded-md text-white bg-indigo-400 hover:bg-indigo-500 mt-2 px-2 py-1">
            Signup
        </button>
    </div>
</div>
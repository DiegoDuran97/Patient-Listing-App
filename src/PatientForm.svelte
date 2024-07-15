<script lang="ts">
    export let id: string = ''

</script>

{#if id}
    Patient Update: {id}
{:else}
    Patient Creation
{/if}

<div>
    <p class= 'font - semibold'>Name</p>
    <input class= 'border p-2' /> 
<button class= "p-2 bg-black text-white">Submit</button>
</div>
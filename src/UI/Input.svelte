<script lang="ts">
    export let value: string;
    export let type: string = 'text'; // Default to 'text' if not provided
  </script>
  
  {#if type === 'text'}
    <input type="text" bind:value={value} />
  {:else if type === 'number'}
    <input type="number" bind:value={value} />
  {:else if type === 'email'}
    <input type="email" bind:value={value} />
  <!-- Add more types as needed -->
  {:else}
    <input type="text" bind:value={value} /> <!-- Fallback to 'text' type -->
  {/if}
  
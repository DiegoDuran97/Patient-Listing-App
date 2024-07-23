<script lang="ts">
    export let type: 'button' | 'submit' | 'reset' = 'button';
    export let disabled = false;
    export let customClass = '';
</script>
  
<button
    {type}
    {disabled}
    class={`p-2 rounded disabled:bg-gray-400 ${customClass} hover:bg-primary hover:text-white transition duration-300`}
>
    <slot></slot>
</button>

<style>
    .bg-primary {
        background-color: #007BFF; /* Primary color */
    }
</style>

<script lang="ts">
    const fhirBaseUrl = 'https://fhir-bootcamp.medblocks.com/fhir'
    
    import type { Patient } from 'fhir/r4'
    import clsx from 'clsx'
    import { fhirApi } from './api';
  
    let page = 0
  
    const fetchPatients = async (page: number) => {
        const patientResponse = await fhirApi.get(`/Patient`, {params: {
          _sort: '-_lastUpdated',
          _count: 20,
          _offset: page*20
        }})
        const patients = patientResponse.data
        return patients
    
    }
  
    const formatName = (resource: Patient) => {
      const firstNameElement = resource.name?.[0];
      const firstName = firstNameElement?.given?.join(' ');
      const lastName = firstNameElement?.family;
  
      if (lastName) {
        return `${firstName} ${lastName}`;
      }
      return firstName;
    };
</script>

<a class= "p-2 bg-black text-white mb-2" href = "/patient" >Create Patient</a>

<h1 class="text-2xl font-semibold">Patients on the Server</h1>
{#await fetchPatients(page)}
  Loading...
{:then patientBundle}
  {#if patientBundle && patientBundle.entry}
    {#each patientBundle.entry as {resource :patient}}
      <p class= "py-2 hover: bg-gray-200 px-1 cursor-pointer">
        <a href = {`/patient/${patient?.resource?.id}`}>
        {patient?.resource?.id}, {formatName(patient)}, {patient?.birthDate || ' '}, {patient?.gender || ' '}
    </a>
      </p>
    {/each}
  {:else}
    <p>No patients found.</p>
  {/if}
{/await}
<div>
  <button class={clsx( "p-2 text-white", {
     'bg-black' : page != 0,
     'bg-green-300' : page ==0
  })} on:click={()=>page--} disabled={page==0}>Previous</button>
  <button class= "p-2 bg-black text-white" on:click={()=>page++}>Next</button>
</div>


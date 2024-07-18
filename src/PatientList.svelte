<script lang="ts">
  import { fhirApi } from "./api";
  import type { Bundle, Patient } from 'fhir/r4';
  import clsx from 'clsx';

  let page = 0;

  const fetchPatients = async (page: number): Promise<Bundle> => {
      const patientResponse = await fhirApi.get('/Patient', {
          params: {
              _sort: '-_lastUpdated',
              _count: 20,
              _offset: page * 20,
          },
      });
      return patientResponse.data;
  };

  const formatName = (resource: Patient): string => {
      if (resource.name && resource.name.length > 0) {
          const name = resource.name[0];
          const given = name.given?.join(' ') || '';
          const family = name.family || '';
          return given || family ? `${given} ${family}`.trim() : name.text || 'Not Provided';
      }
      return 'Not Provided';
  };

  const formatPatientData = (patient: Patient): { id: string, name: string, birthDate: string, gender: string } => {
      return {
          id: patient.id || 'Not Provided',
          name: formatName(patient),
          birthDate: patient.birthDate || 'Not Provided',
          gender: patient.gender || 'Not Provided',
      };
  };
</script>

<a class="p-2 bg-black text-white mb-2" href="/patient">Create Patient</a>

<h1 class="text-2xl font-semibold">Patients on the Server</h1>
{#await fetchPatients(page)}
Loading...
{:then patientBundle}
  {#if patientBundle && patientBundle.entry}
      {#each patientBundle.entry as { resource: patient }}
          {#if patient && patient.resourceType === 'Patient'}
              <p class="py-2 hover:bg-gray-200 px-1 cursor-pointer">
                  <a href={`/patient/${patient.id}`}>
                      {formatPatientData(patient).id}, {formatPatientData(patient).name}, {formatPatientData(patient).birthDate}, {formatPatientData(patient).gender}
                  </a>
              </p>
          {/if}
      {/each}
  {:else}
      <p>No patients found.</p>
  {/if}
{/await}
<div>
  <button
      class={clsx("p-2 text-white", {
          'bg-black': page !== 0,
          'bg-green-300': page === 0,
      })}
      on:click={() => page--}
      disabled={page === 0}
  >
      Previous
  </button>
  <button class="p-2 bg-black text-white" on:click={() => page++}>Next</button>
</div>

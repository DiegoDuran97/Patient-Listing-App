<script lang="ts">
    import { fhirApi } from "../api";
    import type { Bundle, Patient } from 'fhir/r4';
    import debounce from 'lodash.debounce';
    import { onMount } from 'svelte';
    import Button from '../UI/Button.svelte';
    import clsx from 'clsx';

    let page = 0;
    let searchTerm: string = '';
    let patientBundle: Bundle | undefined;
    let loading = false;

    const patientsPerPage = 30;

    const fetchPatients = async (page: number, searchTerm: string): Promise<Bundle> => {
        const params: any = {
            _sort: '-_lastUpdated',
            _count: patientsPerPage,
            _offset: page * patientsPerPage,
        };

        if (searchTerm) {
            if (/^\d+$/.test(searchTerm)) {
                params.telecom = searchTerm;
            } else {
                params.name = searchTerm;
            }
        }

        try {
            const patientResponse = await fhirApi.get('/Patient', { params });
            return patientResponse.data;
        } catch (error) {
            console.error('Error fetching patients:', error);
            return {
                resourceType: 'Bundle',
                type: 'searchset',
                entry: [],
                link: []
            };
        }
    };

    const debouncedFetchPatients = debounce(async () => {
        loading = true;
        patientBundle = await fetchPatients(page, searchTerm);
        loading = false;
    }, 250);

    onMount(() => {
        debouncedFetchPatients();
    });

    $: if (searchTerm || page !== 0) {
        debouncedFetchPatients();
    }

    const formatName = (resource: Patient): string => {
        if (resource.name && resource.name.length > 0) {
            const name = resource.name[0];
            const given = name.given?.join(' ') || '';
            const family = name.family || '';
            return given || family ? `${given} ${family}`.trim() : name.text || 'Not Provided';
        }
        return 'Not Provided';
    };

    const formatPatientData = (patient: Patient): { id: string, name: string, birthDate: string, gender: string, phone: string } => {
        return {
            id: patient.id || 'Not Provided',
            name: formatName(patient),
            birthDate: patient.birthDate || 'Not Provided',
            gender: patient.gender || 'Not Provided',
            phone: patient.telecom?.[0]?.value || 'Not Provided'
        };
    };

    const nextPage = async () => {
        const nextBundle = await fetchPatients(page + 1, searchTerm);
        if (nextBundle.entry && nextBundle.entry.length > 0) {
            page++;
            patientBundle = nextBundle;
        }
    };

    const prevPage = async () => {
        if (page > 0) {
            const prevBundle = await fetchPatients(page - 1, searchTerm);
            if (prevBundle.entry && prevBundle.entry.length > 0) {
                page--;
                patientBundle = prevBundle;
            }
        }
    };

    $: nextButtonDisabled = !patientBundle || !patientBundle.entry || patientBundle.entry.length < patientsPerPage;
    $: prevButtonDisabled = page === 0;
</script>

<style>
    .main-container {
        background-color: #f0f0f0;
        min-height: 100vh;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .table-container {
        background-color: #ffffff;
        border-radius: 0.5rem;
        overflow: hidden;
        width: 100%;
        max-width: 1200px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 0.75rem;
        border: 1px solid #ddd;
        text-align: center;
    }
    th {
        background-color: #f5f5f5;
        font-weight: bold;
    }
    tr:hover {
        background-color: #f1f1f1;
    }
    .info-text {
        font-size: 0.875rem;
        color: #555;
        margin-top: 0.5rem;
    }
</style>

<div class="main-container">
    <h1 class="text-3xl font-bold mb-6">Patient List</h1>

    <div class="flex items-center mb-6 w-full justify-between">
        <input
            bind:value={searchTerm}
            class="flex-grow border border-gray-300 p-3 rounded-md"
            placeholder="Search by Name or Phone Number"
        />
        <a href="/patient">
            <Button customClass="ml-4 bg-blue-600 text-white hover:bg-blue-700">Create Patient</Button>
        </a>
    </div>

    <p class="info-text">Click on a Patient's MRN to Update Information</p>

    {#if loading}
        <p>Loading...</p>
    {:else if patientBundle && patientBundle.entry}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>MRN</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Gender</th>
                        <th>Date of Birth</th>
                        <th>Phone Number</th>
                    </tr>
                </thead>
                <tbody>
                    {#each patientBundle.entry as { resource: patient }}
                        {#if patient && patient.resourceType === 'Patient'}
                            <tr>
                                <td>
                                    <a href={`/patient/${patient.id}`} class="text-blue-600 hover:underline">
                                        {formatPatientData(patient).id}
                                    </a>
                                </td>
                                <td>{formatPatientData(patient).name.split(' ')[0]}</td>
                                <td>{formatPatientData(patient).name.split(' ').slice(1).join(' ')}</td>
                                <td>{formatPatientData(patient).gender}</td>
                                <td>{formatPatientData(patient).birthDate}</td>
                                <td>{formatPatientData(patient).phone}</td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <p>No patients found.</p>
    {/if}

    <div class="mt-6 flex justify-center">
        <Button
            type="button"
            customClass={clsx({
                'mr-2 bg-blue-600 text-white hover:bg-blue-700': !prevButtonDisabled,
                'mr-2 bg-gray-400 text-white': prevButtonDisabled,
            })}
            on:click={prevPage}
            disabled={prevButtonDisabled}
        >
            Previous
        </Button>
        <Button
            type="button"
            customClass={clsx({
                'bg-blue-600 text-white hover:bg-blue-700': !nextButtonDisabled,
                'bg-gray-400 text-white': nextButtonDisabled,
            })}
            on:click={nextPage}
            disabled={nextButtonDisabled}
        >
            Next
        </Button>
    </div>
</div>

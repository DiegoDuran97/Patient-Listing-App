<script lang="ts">
    import { navigate } from "svelte-routing";
    import { fhirApi } from "./api";
    import type { Patient } from 'fhir/r4';

    export let id: string = '';

    const dateToday = new Date().toISOString().split("T")[0];

    let message: any | undefined = undefined;
    let loading = false;
    let patientResource: Patient | undefined = undefined;

    let patientLoading = false;

    let firstName: string = '';
    let lastname: string | undefined;
    let birthDate: string = '';
    let phonenumber: string | undefined;
    let gender: "other" | "male" | "female" | "unknown" | undefined = undefined;

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        loading = true;
        console.log({ firstName, lastname, birthDate, phonenumber, gender });

        // Construct FHIR Patient resource
        const fhirResource: Patient = {
            resourceType: "Patient",
            name: [{
                given: [firstName],
                family: lastname
            }],
            birthDate: birthDate,
            telecom: phonenumber ? [{ system: "phone", value: phonenumber }] : undefined,
            gender: gender // TypeScript ensures gender is one of the specified types
        };

        try {
            if (id) {
                // Update patient
                await updatePatient(id, fhirResource);
            } else {
                // Create new patient
                await createPatient(fhirResource);
            }
            navigate('/')
        } catch (error: any) {
            console.error('Error:', error);
            message = error.response?.data || { error: 'Unknown error occurred' };
        }

        loading = false;
    };

    const createPatient = async (resource: Patient): Promise<any> => {
        const response = await fhirApi.post(`/Patient`, resource);
        return response.data;
    };

    const updatePatient = async (id: string, resource: Patient): Promise<any> => {
        const response = await fhirApi.put(`/Patient/${id}`, resource);
        return response.data;
    };

    const loadPatient = async (id: string) => {
        const patientResponse = await fhirApi.get(`/Patient/${id}`);
        const patientResource = patientResponse.data;
        const name = patientResource.name?.[0];
        firstName = name?.given?.[0] || '';
        lastname = name?.family || '';
        birthDate = patientResource.birthDate || '';
        gender = patientResource.gender || undefined;
        
        const phoneContactPoint = patientResource.telecom?.find((a: any) => a.system === 'phone');
        if (phoneContactPoint) {
            phonenumber = phoneContactPoint.value || '';
        }
        return patientResource;
    };

    $: if (id) {
        patientLoading = true;
        loadPatient(id).then(resource => {
            patientResource = resource;
            patientLoading = false;
        });
    }
</script>

<h1 class="text-2xl font-semibold mb-10">
    {#if id}
        Patient Update: {id}
    {:else}
        Patient Creation
    {/if}
</h1>

{#if patientLoading}
    Loading...
{:else}
<form class="space-y-1" on:submit={handleSubmit}>
    <div>
        <label for="first_name" class="font-semibold block">First Name</label>
        <input bind:value={firstName} id="first_name" name="first_name" class="border p-1 w-full" required />
    </div>
    <div>
        <label for="last_name" class="font-semibold block">Last Name</label>
        <input bind:value={lastname} id="last_name" class="border p-1 w-full" />
    </div>
    <div>
        <label for="gender" class="font-semibold block">Gender</label>
        <select bind:value={gender} id="gender" class="border-2" required>
            <option value="undefined" disabled>Please Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
        </select>
    </div>
    <div>
        <label for="dob" class="font-semibold block">Date of Birth</label>
        <input bind:value={birthDate} id="dob" class="border p-2" type="date" max={dateToday} required />
    </div>
    <div>
        <label for="phone" class="font-semibold block">Phone Number</label>
        <input bind:value={phonenumber} id="phone" class="border p-2 w-full" type="tel" required />
    </div>

    <div>
        <button class="p-2 bg-black text-white">
            {#if loading}
                Loading...
            {:else if id}
                Update
            {:else}
                Create
            {/if}
        </button>
    </div>
</form>
{/if}

{#if message}
    <pre>
        Status:
        {JSON.stringify(message)}
    </pre>
{/if}

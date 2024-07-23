<script lang="ts">
    import { navigate } from "svelte-routing";
    import { fhirApi } from "../api";
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
            gender: gender 
        };

        try {
            if (id) {
                await updatePatient(id, fhirResource);
            } else {
                await createPatient(fhirResource);
            }
            navigate('/'); 
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

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        background-color: #f5f5f5;
    }
    .form-container {
        width: 100%;
        max-width: 600px;
        background-color: #ffffff;
        border-radius: 0.5rem;
        padding: 2rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        box-sizing: border-box;
    }
    .button-return {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 1rem;
    }
    .button-return:hover {
        background-color: #0056b3;
    }
    .form-label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
    }
    .form-button {
        width: 100%;
        padding: 0.75rem;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 0.25rem;
        font-size: 1rem;
        cursor: pointer;
    }
    .form-button:hover {
        background-color: #0056b3;
    }
    .form-message {
        margin-top: 1rem;
        padding: 0.75rem;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        background-color: #f8d7da;
        color: #721c24;
    }
</style>

<div class="container">
    <button class="button-return" on:click={() => navigate('/')}>Return to List</button>
    <div class="form-container">
        <h1 class="text-2xl font-semibold mb-6 text-center">
            {#if id}
                Update {firstName}'s Information
            {:else}
                Create a New Patient
            {/if}
        </h1>

        {#if patientLoading}
            <p class="text-center">Loading...</p>
        {:else}
            <form class="space-y-4" on:submit={handleSubmit}>
                <div>
                    <label for="first_name" class="form-label">First Name</label>
                    <input bind:value={firstName} id="first_name" name="first_name" class="form-input" required />
                </div>
                <div>
                    <label for="last_name" class="form-label">Last Name</label>
                    <input bind:value={lastname} id="last_name" class="form-input" />
                </div>
                <div>
                    <label for="gender" class="form-label">Gender</label>
                    <select bind:value={gender} id="gender" class="form-input" required>
                        <option value="" disabled>Please Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </div>
                <div>
                    <label for="dob" class="form-label">Date of Birth</label>
                    <input bind:value={birthDate} id="dob" class="form-input" type="date" max={dateToday} required />
                </div>
                <div>
                    <label for="phone" class="form-label">Phone Number</label>
                    <input bind:value={phonenumber} id="phone" class="form-input" type="tel" required />
                </div>

                <div>
                    <button class="form-button">
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
            <div class="form-message">
                <strong>Status:</strong>
                <pre>{JSON.stringify(message)}</pre>
            </div>
        {/if}
    </div>
</div>

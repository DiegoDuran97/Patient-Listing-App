<script lang="ts">
  import PatientForm from "./components/PatientForm.svelte";
  import PatientList from "./components/PatientList.svelte";
  import { Router, Route } from "svelte-routing";
</script>

<Router>
  <main class="min-h-screen flex items-center justify-center bg-gray-100 py-10">
    <div class="max-w-7xl w-full mx-4">
      <Route path="/">
        <PatientList></PatientList>
      </Route>
      <Route path="/patient">
        <PatientForm></PatientForm>
      </Route>
      <Route path="/patient/:id" component={PatientForm}>
      </Route>
    </div>
  </main>
</Router>

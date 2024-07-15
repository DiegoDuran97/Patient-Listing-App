<script lang="ts">
    import PatientForm from "./PatientForm.svelte";
    import PatientList from "./PatientList.svelte";
    import { Router, Link, Route } from "svelte-routing";


</script>

<Router> 
  <main>
    <div class="max-w-md mx-auto my-10">
      <Route path="/">
        <PatientList></PatientList>
      </Route>
      <Route path ="/patient">
        <PatientForm></PatientForm>
      </Route>
      <Route path ="/patient/:id" component = {PatientForm}>
      </Route>
    </div>
  </main>
</Router>




import { writable } from 'svelte/store';

export const refreshPatients = writable<boolean>(false);


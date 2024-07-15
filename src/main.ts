import App from './App.svelte';

// Ensure the element exists before passing it to Svelte
const targetElement = document.getElementById('app');

if (targetElement) {
  new App({
    target: targetElement,
  });
} else {
  console.error('No element with id "app" found.');
}


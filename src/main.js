import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'World',
		age: 18
	}
});

export default app;

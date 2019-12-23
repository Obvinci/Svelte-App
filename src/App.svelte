<script>
  import ContactCard from "./ContactCard.svelte";
	import Assignment1 from "./Assignment1.svelte";
	import Assignment2 from "./Assignment2.svelte";

  let name = "Torris";
  let title = "";
  let image = "";
  let description = "";
	let formState = "empty";
	let createdContacts = [];

  function addContactCard() {
		if (
			name.trim().length == 0 || 
			title.trim().length == 0 || 
			image.trim().length == 0 || 
			description.trim().length == 0
		) {
			formState = "invalid";
			return;
		}
		createdContacts = [...createdContacts,
		{
			id: Math.random(),
			name: name,
			title: title,
			image: image,
			description: description
		}]
		formState = "done";
		console.log(createdContacts);
	}

	function deleteFirst() {
		createdContacts = createdContacts.slice(1);
	}

	function deleteLast() {
		createdContacts = createdContacts.slice(0, -1);
	}
</script>

<style>
    #form {
		width: 30rem;
		max-width: 100%;
    }
</style>

<ul>
	<li><a href="./Assignment1.svelte">Assignment1</a></li>
	<li><a href="./Assignment2.svelte">Assignment2</a></li>
</ul>

<form id="form">
  <div class="form-control">
    <label for="userName">User Name</label>
    <input type="text" bind:value={name} id="userName" />
  </div>
  <div class="form-control">
    <label for="jobTitle">Job Title</label>
    <input type="text" bind:value={title} id="jobTitle" />
  </div>
  <div class="form-control">
    <label for="image">Image URL</label>
    <input type="text" bind:value={image} id="image" />
  </div>
  <div class="form-control">
    <label for="desc">Description</label>
    <textarea rows="3" bind:value={description} id="desc" />
  </div>
	<button type="submit" on:click|preventDefault={addContactCard}>Submit</button> <!-- This modifier has to be used in the form-->
	<button on:click|preventDefault={deleteFirst}>Delete First Contact</button>
	<button on:click|preventDefault={deleteLast}>Delete Last Contact</button>
</form>

{#if formState === "invalid"}
	<p>The input is invalid!</p>
{:else}
	<p>Please enter some data and hit Submit!</p>
{/if}

{#each createdContacts as contact, i (contact.id)}
	<h2># {i+1}</h2>
	<ContactCard 
		userName={contact.name} 
		jobTitle={contact.title} 
		description={contact.description}
		userImage={contact.image} />
{:else}
	<p>Please add some contacts.</p>
{/each}

<!-- <Assignment2 /> -->

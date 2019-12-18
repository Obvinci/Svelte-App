<script>
    import ContactCard from "./ContactCard.svelte";

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
			name: name,
			title: title,
			image: image,
			description: description
		}]
		formState = "done";
	}
</script>

<style>
    #form {
		width: 30rem;
		max-width: 100%;
    }
</style>

<div id="form">
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
</div>

<button on:click={addContactCard}>Submit</button>

{#if formState === "invalid"}
	<p>The input is invalid!</p>
{:else if formState === "empty"}
	<p>Please enter some data and hit Submit!</p>
{:else}
	{#each createdContacts as contact, i}
		<h2># {i+1}</h2>
		<ContactCard 
			userName={contact.name} 
			jobTitle={contact.title} 
			description={contact.description}
			userImage={contact.image} />
	{:else}
		<p>Please add some contacts.</p>
	{/each}
{/if}

<script>
	let pwd = '';
	let pwdValidity;
	let userPasswords = [];
	
	$: if (pwd.length > 0 && pwd.length < 5) {
			pwdValidity = "short";
		} else if (pwd.length > 10) {
			pwdValidity = "long";
		} else {
			pwdValidity = "valid";
		}
	
	function storePassword() {
		if (pwdValidity == "valid"){
			userPasswords = [
				...userPasswords, 
				pwd
			];
		}
	}

	function removePassword(index) {
		userPasswords = userPasswords.filter((userPassword, idx) => {
			return idx !== index;
		});
	}
	$: console.log(userPasswords);
</script>

<h1>Assignment</h1>

<p>Solve these tasks.</p>

<ol>
	<li>Add a password input field and save the user input in a variable.</li>
	<li>Output "Too short" if the password is shorter than 5 characters and "Too long" if it's longer than 10.</li>
	<li>Output the password in a paragraph tag if it's between these boundaries.</li>
	<li>Add a button and let the user add the passwords to an array.</li>
	<li>Output the array values (= passwords) in a unordered list (ul tag).</li>
	<li>Bonus: If a password is clicked, remove it from the list.</li>
</ol>

<input 
	type="password" 
	placeholder="Please enter your password"
	bind:value={pwd} />

{#if pwdValidity == "short"}
	<p>Password is too short</p>
{:else if pwdValidity == "long"}
	<p>Password is too long</p>
{:else}
	<p>Your password is {pwd}</p>
{/if}

<button on:click={storePassword}>Submit</button>

<ul>
	{#each userPasswords as userPassword, i}
		<li on:click={removePassword.bind(this, i)}>{userPassword}</li>
	{/each}
</ul>

/**
 * Fonction qui submit le formulaire de modification des informations personnelles
 * @returns true si tout est bon, false s'il manque le mdp de confirmation avec un message
 */
function sendData() {
	if (document.getElementById('password_change_info_confirmation').value !== '') {
		document.getElementById('hidden_password_confirmation').value = document.getElementById('password_change_info_confirmation').value;
		document.getElementById('mainForm').submit();
		return true;
	}
	document.getElementById('information_confirmation').textContent = 'Veuillez saisir votre mot de passe de confirmation';
	return false;
}

/**
 * Fait apparaitre la modale
 */
function showConfirmChanges() {
    document.getElementById('confirm_password').style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
}

/**
 * Cache la modale
 */
function hideConfirmChanges() {
	document.getElementById('confirm_password').style.display = 'none';
}

/**
 * Permet de retourner à la dernière page consultée avant celle-ci
 */
function back() {
	window.history.back();
}

/**
 * Ecouteur sur la confirmation du mdp, s'il est vide pas de message à lui afficher
 */
document.getElementById('password_change_info_confirmation').addEventListener('input', () => {
	document.getElementById('information_confirmation').innerText = '';
});

/**
 * Ecouteur sur le changement de mot de passe
 * si est égal à la confirmation du changement de mdp alors on peut confirmer ses modifications
 * en rentrant son mdp actuel dans la modale.
 * Sinon les mots de passe sont différents et il ne peux pas envoyer ses modifications et ça affiche
 * un message.
 */
document.getElementById("password_change_info").addEventListener('input', function(event) {

    let errorMessage = document.getElementById('errorMessage');
    let changeInfoSubmit = document.getElementById('changeInfoSubmit');
    let confirmationpswd_change_info = document.getElementById('confirmationpswd_change_info');

    if (event.target.value === confirmationpswd_change_info.value) {
		errorMessage.textContent = '';
        changeInfoSubmit.disabled = false;
	} else {
        errorMessage.textContent = 'Mots de passe différents';
		changeInfoSubmit.disabled = true;
        hideConfirmChanges();

	}
})

/**
 * Ecouteur sur la confirmation du changement de mot de passe
 * S'il est vide il y a pas d'erreur
 * S'il est différent du premier on lui notifie et empêche de passer à la confirmation
 * et on cache la modale
 * Sinon tout est bon est il peut passer à la suite
 */
document.getElementById('confirmationpswd_change_info').addEventListener('input', function (event) {

    let errorMessage = document.getElementById('errorMessage');
    let changeInfoSubmit = document.getElementById('changeInfoSubmit');
    let password_change_info = document.getElementById('password_change_info');

	if (event.target.value === '' && password_change_info.value !== '') {
		errorMessage.textContent = '';
		hideConfirmChanges();
		changeInfoSubmit.disabled = true;
	} else if (event.target.value !== password_change_info.value) {
		changeInfoSubmit.disabled = true;
		errorMessage.textContent = 'Mots de passe différents';
        hideConfirmChanges();
	} else {
		changeInfoSubmit.disabled = false;
		errorMessage.textContent = '';
	}
});


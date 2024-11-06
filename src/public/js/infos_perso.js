/**
 * Fonction qui submit le formulaire de modification des informations personnelles
 * @returns true si tout est bon, false s'il manque le mdp de confirmation avec un message
 */
function sendData() {
  if (document.getElementById('password_change_info_confirmation').value) {
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
  const errorMessage = document.getElementById('errorMessage');
  const confirmationPassword = document.getElementById('confirmationpswd_change_info');
  const submitButton = document.getElementById("changeInfoSubmitComfirmation");

  // Vérifie si les mots de passe correspondent
  if (event.target.value === confirmationPassword.value) {
      if (event.target.value.length < 8) {
          errorMessage.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
          submitButton.disabled = true;
      } else {
          errorMessage.textContent = '';
          submitButton.disabled = false;
      }
  } else if (confirmationPassword.value !== "") {
      errorMessage.textContent = 'Mots de passe différents';
      submitButton.disabled = true;
  } else {
      errorMessage.textContent = '';
      submitButton.disabled = true;
  }
});


/**
 * Ecouteur sur la confirmation du changement de mot de passe
 * S'il est vide il y a pas d'erreur
 * S'il est différent du premier on lui notifie et empêche de passer à la confirmation
 * et on cache la modale
 * Sinon tout est bon est il peut passer à la suite
 */
document.getElementById('confirmationpswd_change_info').addEventListener('input', function(event) {
  const errorMessage = document.getElementById('errorMessage');
  const mainPassword = document.getElementById('password_change_info');
  const submitButton = document.getElementById("changeInfoSubmitComfirmation");

  if (event.target.value === mainPassword.value) {
      if (event.target.value.length < 8) {
          errorMessage.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
          submitButton.disabled = true;
      } else {
          errorMessage.textContent = '';
          submitButton.disabled = false;
      }
  } else if (event.target.value !== "") {
      errorMessage.textContent = 'Mots de passe différents';
      submitButton.disabled = true;
  } else {
      errorMessage.textContent = '';
      submitButton.disabled = true;
  }
});

/**
 * permet de modifier l'username (rend l'input editable)
 */
function modifyUsername(){
    event.preventDefault()
    showConfirmChanges();
    document.getElementById("username_change_info").disabled = false;
}

/**
 * permet de modifier le mot de passe (rend l'input editable)
 */
function modifyPassword(){
    event.preventDefault()
    showConfirmChanges();
    document.getElementById("password_change_info").disabled = false;
    document.getElementById("div_confirmationpswd_change_info").style = "display: block";
    document.getElementById("togglePassword2").classList.remove("d-none");
}

/**
 * Change l'icone de la visualisation du mot de passe et le type de l'input
 */
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password_change_info_confirmation');

togglePassword.addEventListener('click', function () {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    togglePassword.src = '/img/oeil_2.svg';
  } else {
    passwordInput.type = 'password';
    togglePassword.src = '/img/oeil.png';
  }
});


/**
 * Change l'icone de la visualisation du mot de passe et le type de l'input
 */
const togglePassword2 = document.getElementById('togglePassword2');
const passwordInput2 = document.getElementById('password_change_info');

togglePassword2.addEventListener('click', function () {
  if (passwordInput2.type === 'password') {
    passwordInput2.type = 'text';
    togglePassword2.src = '/img/oeil_2.svg';
  } else {
    passwordInput2.type = 'password';
    togglePassword2.src = '/img/oeil.png';
  }
});

/**
 * Change l'icone de la visualisation du mot de passe et le type de l'input
 */
const togglePassword3 = document.getElementById('togglePassword3');
const passwordInput3 = document.getElementById('confirmationpswd_change_info');

togglePassword3.addEventListener('click', function () {
  if (passwordInput3.type === 'password') {
    passwordInput3.type = 'text';
    togglePassword3.src = '/img/oeil_2.svg';
  } else {
    passwordInput3.type = 'password';
    togglePassword3.src = '/img/oeil.png';
  }
});


/**
 * Permet de faire des tooltips avec bootstrap
 */
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
function verifierMdp1(){
    if(document.getElementById("confirmationpswd").value === ""){return;}
    verifierMdp()
}

function verifierMdp(){
    if(document.getElementById("password").value !== document.getElementById("confirmationpswd").value) {
        document.getElementById("inscriptionSubmit").disabled = true;
        document.getElementById("errorMessage").textContent = "Mots de passe différents";
    }
}

function clearMessage(){
    document.getElementById("inscriptionSubmit").disabled = false;
    document.getElementById("errorMessage").textContent = "";
}

/**
 * Change l'icone de la visualisation du mot de passe et le type de l'input
 */
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

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
const passwordInput2 = document.getElementById('confirmationpswd');

togglePassword2.addEventListener('click', function () {
  if (passwordInput2.type === 'password') {
    passwordInput2.type = 'text';
    togglePassword2.src = '/img/oeil_2.svg';
  } else {
    passwordInput2.type = 'password';
    togglePassword2.src = '/img/oeil.png';
  }
});
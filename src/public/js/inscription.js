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
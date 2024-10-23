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
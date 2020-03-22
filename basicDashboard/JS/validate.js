function validateEmail() {
  var email = document.getElementById('email').value;
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    console.log('Email valid!');
    window.location.href = './dashboard.html';
    return true;
  }
  alert('You have entered an invalid email address!');
  return false;
}

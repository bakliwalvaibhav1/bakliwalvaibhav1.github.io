// listen for auth status changes
auth.onAuthStateChanged(user => {

  db.collection("houses").get().then(function(querySnapshot) {
    setupHouses(querySnapshot.docs);
    setupAnalytics(querySnapshot.docs);
    querySnapshot.forEach(function(doc) {
        // console.log(doc.id, " => ", doc.data());
    });

  });
  if (user) {
    setupUI(user);
  } else {
    setupUI();
  }
});


// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // sign up the user & add firestore data
  auth.createUserWithEmailAndPassword(email, password).then(() => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
    M.toast({html: 'Logged In'});
  });
});

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
  M.toast({html: 'Logged Out'});
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
    M.toast({html: 'Logged In'});
  });

});
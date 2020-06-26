const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');
const houseList = document.querySelector('.houses');
const houseModal = document.querySelector('.house-modals');

const setupUI = (user) => {
  if (user) {
    db.collection('users').doc(user.uid).get().then(doc => {
      const html = `${user.email}`;
      accountDetails.innerHTML = html;
    });
    // toggle user elements
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
  } else {
    // toggle user elements
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
};

// Navbar
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems, {});
});


const setupHouses = (data) => {
  if (data.length) {
    let html = '';
    id = 0;
    
    data.forEach(doc => {
      const house = doc.data();
      const div = `
      <div class="col s12 m6 l4">
        <div class="card">
          <div class="card-image">
            <img src="${house.image}">
            <!-- <span class="card-title">Card Title</span> -->
          </div>
          <div class="card-content">
            <h5 class="center-align">${house.city}</h5>
            <p>${house.description}</p>
          </div>
          <div class="card-action center-align">
            <a href="#" class="modal-trigger btn red" data-target="modal-house${id}">View</a>
          </div>
        </div>
      </div>
      `;
      id += 1;
      html += div;
    });
    houseList.innerHTML = html

  } else {
    houseList.innerHTML = '<h5 class="center-align">No houses listed</h5>';
  }
};


const setupAnalytics = (data) => {
  let html = '';
  id = 0;
  
  var likesarr = [];
  var dislikesarr = [];
  var reviews = [];
  data.forEach(doc => {
    const house = doc.data();
    
    
    db.collection("houses").doc(doc.id).collection("analytics").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc1) {

        db.collection("houses").doc(doc.id).collection("analytics").doc(doc1.id).collection("reviews").get().then(function(querySnapshot) {
          querySnapshot.forEach(function(doc2) {
            // reviews.push(doc2.data());
            // console.log(reviews);
            // console.log(typeof(reviews));
          });
          // console.log(reviews);
          // for (const prop in reviews) {
            // console.log(`${prop} = ${reviews[prop]}`);
          // }
        });
        // console.log(reviews[0]);

        likesarr.push(doc1.data().likes.length);
        dislikesarr.push(doc1.data().dislikes.length);
        
        
      });

      const div = `
      <div id="modal-house${id}" class="modal">
        <div class="modal-content center-align">
          <h3>Details</h3>
          <img src="${house.image}" style="max-height: 200px">
          <h4>${house.city}</h4>
          <p>${house.description}</p>
          <p>Area : ${house.area}</p>
          <p>Address : ${house.address}</p>
          <p>Likes : ${likesarr[id]} Dislikes : ${dislikesarr[id]}</p>
          <button class="btn blue" id="${doc.id}" onclick="like(this.id)">Like</button>
          <button class="btn red" id="${doc.id}" onclick="dislike(this.id)">dislike</button>
          
        </div>
      </div>
      `;
      html += div;
      id += 1;
    
      houseModal.innerHTML = html;
      var modals = document.querySelectorAll('.modal');
      M.Modal.init(modals);
    });
  });
}



const dislike = (houseid) => {
  var likesarr = [];
  var dislikesarr = [];
  var analyticsid = '';
  db.collection("houses").doc(houseid).collection("analytics").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc1) {
      analyticsid = doc1.id;
      likesarr.push(doc1.data().likes);
      dislikesarr.push(doc1.data().dislikes);
    });
    var user = firebase.auth().currentUser;
    if(!dislikesarr[0].includes(user.uid)){
      dislikesarr[0].push(user.uid);
    
      // console.log(likesarr[0]);
      if(user.uid){
        db.collection("houses").doc(houseid).collection("analytics").doc(analyticsid).set({
          likes: likesarr[0],
          dislikes: dislikesarr[0]
        }).then(function() {
          // console.log("Added");
          M.toast({html: 'Disliked'});
        }); 
      }
    }else{
      M.toast({html: 'Already disliked'});
    }

  });  
}



const like = (houseid) => {
  var likesarr = [];
  var dislikesarr = [];
  var analyticsid = '';
  db.collection("houses").doc(houseid).collection("analytics").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc1) {
      analyticsid = doc1.id;
      likesarr.push(doc1.data().likes);
      dislikesarr.push(doc1.data().dislikes);
    });
    var user = firebase.auth().currentUser;
    if(!likesarr[0].includes(user.uid)){
      likesarr[0].push(user.uid);
    
      // console.log(likesarr[0]);
      if(user.uid){
        db.collection("houses").doc(houseid).collection("analytics").doc(analyticsid).set({
          likes: likesarr[0],
          dislikes: dislikesarr[0]
        }).then(function() {
          // console.log("Added");
          M.toast({html: 'Liked'});
        }); 
      }
    }else{
      M.toast({html: 'Already Liked'});
    }

  });  
}




function title(str) {
  return str.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
}

// Search
const search = () => {
  
  var city = document.getElementById("search").value;
  city = title(city);
  if(city){
    db.collection("houses").where("city", "==", city).get().then(function(querySnapshot) {
      setupHouses(querySnapshot.docs);
      setupAnalytics(querySnapshot.docs);
      // querySnapshot.forEach(function(doc) {
        // console.log(doc.data());
      // });
    })
    .catch(function(error) {
      // console.log("Error getting documents: ", error);
    });
  }else{
    db.collection("houses").get().then(function(querySnapshot) {
      setupHouses(querySnapshot.docs);
      setupAnalytics(querySnapshot.docs);
      querySnapshot.forEach(function(doc) {
          // console.log(doc.id, " => ", doc.data());
      });
  
    });
  }
}


// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

});
